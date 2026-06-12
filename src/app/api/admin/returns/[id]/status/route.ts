import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus, ReturnStatus, InventoryMovementType, Prisma } from "@prisma/client";
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

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: true,
        items: { include: { orderItem: true } },
      },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      if (returnRequest.status !== ReturnStatus.REQUESTED) {
        return NextResponse.json({ error: `Cannot approve a request with status ${returnRequest.status}` }, { status: 409 });
      }

      const updated = await prisma.returnRequest.update({
        where: { id },
        data: {
          status: ReturnStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedByUserId: user.id,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          action: "RETURN_APPROVE",
          entityType: "ReturnRequest",
          entityId: id,
          beforeData: { status: returnRequest.status } as any,
          afterData: { status: updated.status } as any,
        },
      });

      return NextResponse.json({ success: true, returnRequest: updated });
    }

    if (action === "REJECT") {
      if (returnRequest.status !== ReturnStatus.REQUESTED) {
        return NextResponse.json({ error: `Cannot reject a request with status ${returnRequest.status}` }, { status: 409 });
      }

      const resolutionNote = typeof body.resolutionNote === "string" ? body.resolutionNote.trim() : "";

      if (!resolutionNote) {
        return NextResponse.json({ error: "A reason is required to reject a return request" }, { status: 400 });
      }

      const updated = await prisma.returnRequest.update({
        where: { id },
        data: {
          status: ReturnStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedByUserId: user.id,
          resolutionNote,
        },
      });

      await prisma.adminAuditLog.create({
        data: {
          actorUserId: user.id,
          action: "RETURN_REJECT",
          entityType: "ReturnRequest",
          entityId: id,
          beforeData: { status: returnRequest.status } as any,
          afterData: { status: updated.status, resolutionNote } as any,
        },
      });

      return NextResponse.json({ success: true, returnRequest: updated });
    }

    if (action === "RECEIVE") {
      if (returnRequest.status !== ReturnStatus.APPROVED) {
        return NextResponse.json({ error: `Cannot mark as received with status ${returnRequest.status}` }, { status: 409 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        for (const item of returnRequest.items) {
          await tx.productVariant.update({
            where: { id: item.orderItem.productVariantId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.inventoryMovement.create({
            data: {
              productVariantId: item.orderItem.productVariantId,
              orderItemId: item.orderItemId,
              returnRequestItemId: item.id,
              movementType: InventoryMovementType.RETURNED,
              quantity: item.quantity,
              actorUserId: user.id,
              note: `Return for order ${returnRequest.order.orderNumber} - item received back`,
            },
          });
        }

        const result = await tx.returnRequest.update({
          where: { id },
          data: { status: ReturnStatus.RECEIVED },
        });

        await tx.adminAuditLog.create({
          data: {
            actorUserId: user.id,
            action: "RETURN_RECEIVE",
            entityType: "ReturnRequest",
            entityId: id,
            beforeData: { status: returnRequest.status } as any,
            afterData: { status: result.status } as any,
          },
        });

        return result;
      });

      return NextResponse.json({ success: true, returnRequest: updated });
    }

    if (action === "REFUND") {
      if (returnRequest.status !== ReturnStatus.RECEIVED) {
        return NextResponse.json({ error: `Cannot process refund with status ${returnRequest.status}` }, { status: 409 });
      }

      const razorpayRefundId = typeof body.razorpayRefundId === "string" ? body.razorpayRefundId.trim() : "";

      const refundTotal = returnRequest.items.reduce((sum, item) => {
        return sum + Number(item.orderItem.unitPrice) * item.quantity;
      }, 0);

      const updated = await prisma.$transaction(async (tx) => {
        const order = returnRequest.order;
        const newRefundAmount = Number(order.refundAmount) + refundTotal;
        const isFullRefund = newRefundAmount >= Number(order.totalAmount);

        const orderUpdateData: any = {
          refundAmount: new Prisma.Decimal(newRefundAmount.toFixed(2)),
          refundedAt: new Date(),
        };

        if (razorpayRefundId) orderUpdateData.razorpayRefundId = razorpayRefundId;

        if (isFullRefund) {
          orderUpdateData.status = OrderStatus.REFUNDED;
          orderUpdateData.paymentStatus = PaymentStatus.REFUNDED;
        }

        await tx.order.update({
          where: { id: order.id },
          data: orderUpdateData,
        });

        if (isFullRefund) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: order.status,
              toStatus: OrderStatus.REFUNDED,
              changedByUserId: user.id,
              note: "Order fully refunded following return",
            },
          });
        }

        const result = await tx.returnRequest.update({
          where: { id },
          data: { status: ReturnStatus.REFUNDED, completedAt: new Date() },
        });

        await tx.adminAuditLog.create({
          data: {
            actorUserId: user.id,
            action: "RETURN_REFUND",
            entityType: "ReturnRequest",
            entityId: id,
            beforeData: { status: returnRequest.status, refundAmount: Number(order.refundAmount) } as any,
            afterData: { status: result.status, refundAmount: newRefundAmount } as any,
          },
        });

        return result;
      });

      return NextResponse.json({ success: true, returnRequest: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("RETURN STATUS ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to update return request" }, { status: 500 });
  }
}
