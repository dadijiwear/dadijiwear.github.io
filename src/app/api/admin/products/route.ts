// list

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { toJsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { dbUser } = await getAdminUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const active = searchParams.get("active");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { pid: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }

  if (active === "true") where.active = true;
  if (active === "false") where.active = false;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { variants: true },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(request: Request) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const pid = String(body.pid || "").trim();
    const slug = String(body.slug || "").trim();
    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const collection = String(body.collection || "").trim();
    const description = typeof body.description === "string" ? body.description.trim() || null : null;
    const season = typeof body.season === "string" ? body.season.trim() || null : null;

    if (!pid || !slug || !name || !category || !collection) {
      return NextResponse.json({ error: "PID, slug, name, category, and collection are required" }, { status: 400 });
    }

    const mrp = Number(body.mrp);
    const price = Number(body.price);
    const discountPercent = Number(body.discountPercent || 0);

    if (!Number.isFinite(mrp) || mrp < 0 || !Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Invalid MRP or price" }, { status: 400 });
    }

    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return NextResponse.json({ error: "Invalid discount percent" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        pid,
        slug,
        name,
        description,
        category,
        collection,
        season,
        mrp: new Prisma.Decimal(mrp.toFixed(2)),
        price: new Prisma.Decimal(price.toFixed(2)),
        discountPercent: new Prisma.Decimal(discountPercent.toFixed(2)),
        featured: Boolean(body.featured),
        isNew: Boolean(body.isNew),
        active: body.active === undefined ? true : Boolean(body.active),
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: user.id,
        action: "PRODUCT_CREATE",
        entityType: "Product",
        entityId: product.id,
        afterData: toJsonSafe(product),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A product with this PID or slug already exists" }, { status: 409 });
    }
    console.error("PRODUCT CREATE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to create product" }, { status: 500 });
  }
}
