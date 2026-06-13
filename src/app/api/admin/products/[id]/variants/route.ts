import { NextResponse } from "next/server";
import { InventoryMovementType } from "@prisma/client";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { toJsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const ageGroup = String(body.ageGroup || "").trim();
    const color = String(body.color || "").trim();
    const sku = String(body.sku || "").trim();
    const stock = Number(body.stock || 0);

    if (!ageGroup || !color || !sku) {
      return NextResponse.json({ error: "Size, color, and SKU are required" }, { status: 400 });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variant = await prisma.$transaction(async (tx) => {
      const created = await tx.productVariant.create({
        data: {
          productId: id,
          ageGroup,
          color,
          sku,
          stock,
          active: true,
        },
      });

      if (stock > 0) {
        await tx.inventoryMovement.create({
          data: {
            productVariantId: created.id,
            movementType: InventoryMovementType.ADJUSTED,
            quantity: stock,
            actorUserId: user.id,
            note: `Initial stock for new variant ${ageGroup} / ${color}`,
          },
        });
      }

      await tx.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          action: "VARIANT_CREATE",
          entityType: "ProductVariant",
          entityId: created.id,
          afterData: toJsonSafe(created),
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, variant });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A variant with this size/color or SKU already exists" }, { status: 409 });
    }
    console.error("VARIANT CREATE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to create variant" }, { status: 500 });
  }
}
