import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus, InventoryMovementType } from "@prisma/client";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const action = String(body.action || "").toUpperCase();

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let toStatus: OrderStatus;
    let historyNote = "";

    if (action === "CONFIRM") {
      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PAID) {
        return NextResponse.json({ error: `Cannot confirm an order with status ${order.status}` }, { status: 409 });
      }
      toStatus = OrderStatus.CONFIRMED;
      historyNote = "Order confirmed by admin";
      } else if (action === "CANCEL") {
      const cancellableStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.CONFIRMED];
      if (!cancellableStatuses.includes(order.status)) {
        return NextResponse.json({ error: `Cannot cancel an order with status ${order.status}` }, { status: 409 });
      }

      toStatus = OrderStatus.CANCELLED;
      historyNote = "Order cancelled by admin";
    } else if (action === "SHIP") {
      if (order.status !== OrderStatus.CONFIRMED) {
        return NextResponse.json({ error: `Cannot ship an order with status ${order.status}` }, { status: 409 });
      }
      toStatus = OrderStatus.SHIPPED;
      historyNote = "Order marked as shipped";
    } else if (action === "DELIVER") {
      if (order.status !== OrderStatus.SHIPPED) {
        return NextResponse.json({ error: `Cannot deliver an order with status ${order.status}` }, { status: 409 });
      }
      toStatus = OrderStatus.DELIVERED;
      historyNote = "Order marked as delivered";
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : undefined;
    const courierName = typeof body.courierName === "string" ? body.courierName.trim() : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      if (action === "CONFIRM" && order.paymentMethod === "COD" && order.status === OrderStatus.PENDING) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              stock: { decrement: item.quantity },
              reserved: { decrement: item.quantity },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              productVariantId: item.productVariantId,
              orderItemId: item.id,
              movementType: InventoryMovementType.SOLD,
              quantity: item.quantity,
              actorUserId: user.id,
              note: `Order ${order.orderNumber} confirmed by admin`,
            },
          });
        }
      }

      if (action === "CANCEL") {
        for (const item of order.items) {
          if (order.paymentMethod === "COD" && order.status === OrderStatus.PENDING) {
            await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: { reserved: { decrement: item.quantity } },
            });

            await tx.inventoryMovement.create({
              data: {
                productVariantId: item.productVariantId,
                orderItemId: item.id,
                movementType: InventoryMovementType.RELEASED,
                quantity: item.quantity,
                actorUserId: user.id,
                note: `Order ${order.orderNumber} cancelled by admin - reservation released`,
              },
            });
          } else if (order.status === OrderStatus.PAID || order.status === OrderStatus.CONFIRMED) {
            await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: { stock: { increment: item.quantity } },
            });

            await tx.inventoryMovement.create({
              data: {
                productVariantId: item.productVariantId,
                orderItemId: item.id,
                movementType: InventoryMovementType.RESTOCKED,
                quantity: item.quantity,
                actorUserId: user.id,
                note: `Order ${order.orderNumber} cancelled by admin - stock restored`,
              },
            });
          }
        }

        if (order.paymentStatus === PaymentStatus.CAPTURED) {
          historyNote += " — payment was captured; refund will be processed via Razorpay.";
        }
      }

      const updateData: any = { status: toStatus };

        if (action === "CONFIRM") updateData.confirmedAt = new Date();
        if (action === "CANCEL") {
          updateData.cancelledAt = new Date();
          if (order.paymentStatus === PaymentStatus.PENDING) {
            updateData.paymentStatus = PaymentStatus.FAILED;
            updateData.paymentFailedAt = new Date();
          }
        }
      

      if (action === "SHIP") {
        updateData.shippedAt = new Date();
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (courierName) updateData.courierName = courierName;
      }

      if (action === "DELIVER") {
        updateData.deliveredAt = new Date();
        if (order.paymentMethod === "COD") {
          updateData.paymentStatus = PaymentStatus.CAPTURED;
          updateData.paidAt = new Date();
        }
      }

      const result = await tx.order.update({
        where: { id: order.id },
        data: updateData,
        include: { items: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus,
          changedByUserId: user.id,
          note: historyNote,
        },
      });

      if (action === "DELIVER" && order.paymentMethod === "COD") {
        await tx.paymentEvent.create({
          data: {
            orderId: order.id,
            initiatedByUserId: user.id,
            provider: "COD",
            eventType: "cod.collected",
            processed: true,
            processedAt: new Date(),
            payload: { note: "Cash collected on delivery, confirmed by admin" },
          },
        });
      }

      await tx.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          action: `ORDER_${action}`,
          entityType: "Order",
          entityId: order.id,
          beforeData: { status: order.status, paymentStatus: order.paymentStatus } as any,
          afterData: { status: result.status, paymentStatus: result.paymentStatus } as any,
        },
      });

      return result;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("ORDER STATUS ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order" }, { status: 500 });
  }
}
