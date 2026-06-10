import { NextResponse } from "next/server";
import crypto from "crypto";
import { 
  Prisma, 
  OrderStatus, 
  PaymentStatus, 
  InventoryMovementType 
} from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toAmount(value: unknown): number {
  return Number(String(value ?? 0));
}

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
    const razorpayOrderId = String(body.razorpayOrderId || "").trim();
    const razorpayPaymentId = String(body.razorpayPaymentId || "").trim();
    const razorpaySignature = String(body.razorpaySignature || "").trim();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        razorpayOrderId: razorpayOrderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === PaymentStatus.CAPTURED) {
      return NextResponse.json({ success: true });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.productVariantId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }

        await tx.inventoryMovement.create({
          data: {
            productVariantId: item.productVariantId,
            movementType: InventoryMovementType.SOLD,
            quantity: item.quantity,
            actorUserId: user.id,
            note: `Order ${order.orderNumber}`,
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.CAPTURED,
          paymentMethod: "RAZORPAY",
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          paidAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.CONFIRMED,
          changedByUserId: user.id,
          note: "Payment confirmed",
        },
      });

      await tx.paymentEvent.create({
        data: {
          orderId: order.id,
          initiatedByUserId: user.id,
          provider: "RAZORPAY",
          eventType: "payment.captured",
          providerEventId: razorpayPaymentId,
          paymentId: razorpayPaymentId,
          payload: body,
          processed: true,
          processedAt: new Date(),
        },
      });

      const cart = await tx.cart.findUnique({
        where: { userId: user.id },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        await tx.cart.update({
          where: { userId: user.id },
          data: {
            status: "ACTIVE",
            subtotal: new Prisma.Decimal(0),
            discountAmount: new Prisma.Decimal(0),
            shippingAmount: new Prisma.Decimal(0),
            totalAmount: new Prisma.Decimal(0),
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
