import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { toJsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { dbUser } = await getAdminUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: [{ ageGroup: "asc" }, { color: "asc" }] },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data: any = {};

    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.description === "string") data.description = body.description.trim() || null;
    if (typeof body.category === "string") data.category = body.category.trim();
    if (typeof body.collection === "string") data.collection = body.collection.trim();
    if (typeof body.season === "string") data.season = body.season.trim() || null;
    if (typeof body.featured === "boolean") data.featured = body.featured;
    if (typeof body.isNew === "boolean") data.isNew = body.isNew;
    if (typeof body.active === "boolean") data.active = body.active;

    if (body.mrp !== undefined) {
      const mrp = Number(body.mrp);
      if (!Number.isFinite(mrp) || mrp < 0) {
        return NextResponse.json({ error: "Invalid MRP" }, { status: 400 });
      }
      data.mrp = new Prisma.Decimal(mrp.toFixed(2));
    }

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      }
      data.price = new Prisma.Decimal(price.toFixed(2));
    }

    if (body.discountPercent !== undefined) {
      const discount = Number(body.discountPercent);
      if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
        return NextResponse.json({ error: "Invalid discount percent" }, { status: 400 });
      }
      data.discountPercent = new Prisma.Decimal(discount.toFixed(2));
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: user.id,
        action: "PRODUCT_UPDATE",
        entityType: "Product",
        entityId: id,
        beforeData: toJsonSafe(existing),
        afterData: toJsonSafe(updated),
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("PRODUCT UPDATE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to update product" }, { status: 500 });
  }
}
