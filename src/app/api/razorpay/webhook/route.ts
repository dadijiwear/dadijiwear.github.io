import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, InventoryMovementType } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Webhook signature or secret missing" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    const eventType = event.event;
    const paymentEntity = event.payload?.payment?.entity;
    
    if (!paymentEntity) {
      return NextResponse.json({ success: true }); 
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    if (!razorpayOrderId) {
      return NextResponse.json({ success: true });
    }

    const order = await prisma.order.findUnique({
      where: { razorpayOrderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: true });
    }

    await prisma.paymentEvent.create({
      data: {
        orderId: order.id,
        provider: "RAZORPAY",
        eventType: eventType,
        providerEventId: event.id || razorpayPaymentId,
        paymentId: razorpayPaymentId,
        payload: event as any,
        processed: true,
        processedAt: new Date(),
      },
    });

    switch (eventType) {
      case "payment.captured":
        if (order.paymentStatus !== PaymentStatus.CAPTURED) {
          await prisma.$transaction(async (tx) => {
            const conflictItems: string[] = [];

            for (const item of order.items) {
              const updated = await tx.productVariant.updateMany({
                where: { 
                  id: item.productVariantId, 
                  stock: { gte: item.quantity } 
                },
                data: { 
                  stock: { decrement: item.quantity } 
                },
              });
              
              if (updated.count === 0) {
                conflictItems.push(item.productName);
                continue;
              }
              
              await tx.inventoryMovement.create({
                data: {
                  productVariantId: item.productVariantId,
                  movementType: InventoryMovementType.SOLD,
                  quantity: item.quantity,
                  note: `Webhook payment.captured - Order ${order.orderNumber}`,
                },
              });
            }

            await tx.order.update({
              where: { id: order.id },
              data: {
                status: OrderStatus.PAID,
                paymentStatus: PaymentStatus.CAPTURED,
                razorpayPaymentId,
                paidAt: new Date(),
              },
            });

            await tx.orderStatusHistory.create({
              data: { 
                orderId: order.id, 
                fromStatus: order.status, 
                toStatus: OrderStatus.PAID, 
                note: conflictItems.length > 0
                  ? `Webhook: Payment Captured. STOCK CONFLICT for: ${conflictItems.join(", ")}. Admin must review.`
                  : "Webhook: Payment Captured"
              },
            });
          });
        }
        break;

      case "payment.failed":
        if (
          order.paymentStatus !== PaymentStatus.FAILED && 
          order.paymentStatus !== PaymentStatus.CAPTURED
        ) {
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
                fromStatus: order.status,
                toStatus: OrderStatus.FAILED,
                note: "Webhook: Payment Failed",
              },
            });
          });
        }
        break;

      case "refund.processed":
        const refundAmount = paymentEntity.amount_refunded 
          ? paymentEntity.amount_refunded / 100 
          : 0;

        await prisma.order.update({
          where: { id: order.id },
          data: { 
            paymentStatus: PaymentStatus.REFUNDED,
            status: OrderStatus.REFUNDED,
            refundAmount,
            refundedAt: new Date(),
          },
        });

        await prisma.orderStatusHistory.create({
          data: { 
            orderId: order.id, 
            fromStatus: order.status, 
            toStatus: OrderStatus.REFUNDED, 
            note: "Webhook: Refund Processed" 
          },
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" }, 
      { status: 500 }
    );
  }
}
