import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function getAuthedUser() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}

export async function POST(request: Request) {
  try {
    const {
      data: { user },
      error,
    } = await getAuthedUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const orderId = String(body.orderId || "").trim();
    const reason = String(body.reason || "Payment cancelled by user").trim().slice(0, 500);

    if (!orderId) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== OrderStatus.PENDING || order.paymentStatus !== PaymentStatus.PENDING) {
      return NextResponse.json({ success: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.FAILED,
          paymentStatus: PaymentStatus.FAILED,
          paymentFailedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.FAILED,
          changedByUserId: user.id,
          note: reason,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update order" }, { status: 500 });
  }
}
