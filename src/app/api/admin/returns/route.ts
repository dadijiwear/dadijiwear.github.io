import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus, ReturnStatus } from "@prisma/client";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { dbUser } = await getAdminUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

  const where: any = {};

  if (status) where.status = status;
  if (search) {
    where.order = {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [returnRequests, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        order: true,
        items: { include: { orderItem: true } },
      },
    }),
    prisma.returnRequest.count({ where }),
  ]);

  return NextResponse.json({ returnRequests, total, page, limit });
}

export async function POST(request: Request) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const orderId = String(body.orderId || "").trim();
    const reason = String(body.reason || "").trim();
    const details = typeof body.details === "string" && body.details.trim() ? body.details.trim() : null;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!orderId || !reason || items.length === 0) {
      return NextResponse.json({ error: "Order, reason, and at least one item are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.userId) {
      return NextResponse.json({ error: "Order has no associated customer account" }, { status: 409 });
    }

    if (order.status !== OrderStatus.DELIVERED) {
      return NextResponse.json({ error: "Return requests can only be created for delivered orders" }, { status: 409 });
    }

    const orderItemsById = new Map(order.items.map((item) => [item.id, item]));
    const validatedItems: { orderItemId: string; quantity: number }[] = [];

    for (const raw of items) {
      const orderItemId = String(raw.orderItemId || "");
      const quantity = Number(raw.quantity);
      const orderItem = orderItemsById.get(orderItemId);

      if (!orderItem) {
        return NextResponse.json({ error: "Invalid item in return request" }, { status: 400 });
      }

      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > orderItem.quantity) {
        return NextResponse.json({ error: `Invalid quantity for ${orderItem.productName}` }, { status: 400 });
      }

      validatedItems.push({ orderItemId, quantity });
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const returnRequest = await prisma.$transaction(async (tx) => {
      const created = await tx.returnRequest.create({
        data: {
          orderId: order.id,
          userId: order.userId!,
          reason,
          details,
          status: ReturnStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedByUserId: user.id,
          items: {
            create: validatedItems.map((item) => ({
              orderItemId: item.orderItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          action: "RETURN_CREATE",
          entityType: "ReturnRequest",
          entityId: created.id,
          afterData: { status: created.status, orderId: order.id } as any,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, returnRequest });
  } catch (error: any) {
    console.error("ADMIN RETURN CREATE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to create return request" }, { status: 500 });
  }
}
