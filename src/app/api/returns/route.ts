import { NextResponse } from "next/server";
import { OrderStatus, ReturnStatus } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const orderId = String(body.orderId || "").trim();
    const reason = String(body.reason || "").trim();
    const details = typeof body.details === "string" ? body.details.trim() : null;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!orderId || !reason || items.length === 0) {
      return NextResponse.json({ error: "Order, reason, and at least one item are required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { items: true, returnRequests: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== OrderStatus.DELIVERED) {
      return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 409 });
    }

    if (order.returnRequests.length > 0) {
      return NextResponse.json({ error: "A return request already exists for this order" }, { status: 409 });
    }

    if (!order.deliveredAt) {
      return NextResponse.json({ error: "Order has not been delivered yet" }, { status: 409 });
    }

    const RETURN_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;

    if (Date.now() - new Date(order.deliveredAt).getTime() > RETURN_WINDOW_MS) {
      return NextResponse.json({ error: "The return window for this order has expired" }, { status: 409 });
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

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: user.id,
        reason,
        details,
        status: ReturnStatus.REQUESTED,
        items: {
          create: validatedItems.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, returnRequest });
  } catch (error: any) {
    console.error("RETURN REQUEST ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit return request" }, { status: 500 });
  }
}
