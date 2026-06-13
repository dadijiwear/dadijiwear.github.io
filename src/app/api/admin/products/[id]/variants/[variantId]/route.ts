import { NextResponse } from "next/server";
import { InventoryMovementType } from "@prisma/client";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { toJsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, variantId } = await context.params;
    const body = await request.json();

    const existing = await prisma.productVariant.findFirst({ where: { id: variantId, productId: id } });

    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const data: any = {};

    if (typeof body.ageGroup === "string" && body.ageGroup.trim()) data.ageGroup = body.ageGroup.trim();
    if (typeof body.color === "string" && body.color.trim()) data.color = body.color.trim();
    if (typeof body.active === "boolean") data.active = body.active;

    let stockNote: string | null = null;
    let stockDelta = 0;

    if (body.stock !== undefined) {
      const newStock = Number(body.stock);

      if (!Number.isInteger(newStock) || newStock < 0) {
        return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
      }

      if (newStock < existing.reserved) {
        return NextResponse.json(
          {
            error: `Cannot set stock below reserved quantity (${existing.reserved} units currently reserved for pending orders)`,
          },
          { status: 409 }
        );
      }

      if (newStock !== existing.stock) {
        stockDelta = newStock - existing.stock;
        data.stock = newStock;
        const reason =
          typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "Manual stock adjustment by admin";
        stockNote = `${reason} (${existing.stock} -> ${newStock})`;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.productVariant.update({
        where: { id: variantId },
        data,
      });

      if (stockDelta !== 0) {
        await tx.inventoryMovement.create({
          data: {
            productVariantId: variantId,
            movementType: InventoryMovementType.ADJUSTED,
            quantity: stockDelta,
            actorUserId: user.id,
            note: stockNote || "Manual stock adjustment by admin",
          },
        });
      }

      await tx.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          action: "VARIANT_UPDATE",
          entityType: "ProductVariant",
          entityId: variantId,
          beforeData: toJsonSafe(existing),
          afterData: toJsonSafe(result),
        },
      });

      return result;
    });

    return NextResponse.json({ success: true, variant: updated });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A variant with this size/color already exists" }, { status: 409 });
    }
    console.error("VARIANT UPDATE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to update variant" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, variantId } = await context.params;

    const existing = await prisma.productVariant.findFirst({ where: { id: variantId, productId: id } });

    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const [orderItemCount, cartItemCount] = await Promise.all([
      prisma.orderItem.count({ where: { productVariantId: variantId } }),
      prisma.cartItem.count({ where: { productVariantId: variantId } }),
    ]);

    if (orderItemCount > 0 || cartItemCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete a variant that has order or cart history. Deactivate it instead." },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.productVariant.delete({ where: { id: variantId } });

      await tx.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          action: "VARIANT_DELETE",
          entityType: "ProductVariant",
          entityId: variantId,
          beforeData: toJsonSafe(existing),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("VARIANT DELETE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete variant" }, { status: 500 });
  }
}
