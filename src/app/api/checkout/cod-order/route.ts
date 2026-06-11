import { NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma, OrderStatus, PaymentStatus, InventoryMovementType } from "@prisma/client";
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
    const shippingAddress = String(body.shippingAddress || "").trim();

    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser?.name || !dbUser?.phone) {
      return NextResponse.json(
        { error: "Please complete your profile before placing an order" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        coupon: true,
        items: { include: { productVariant: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Bag is empty" }, { status: 400 });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + toAmount(item.unitPrice) * item.quantity, 0);
    const discountAmount = toAmount(cart.discountAmount);
    const shippingAmount = toAmount(cart.shippingAmount);
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

    for (const item of cart.items) {
      if (!item.productVariant || item.productVariant.stock < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${item.productName}` }, { status: 409 });
      }
    }

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error(`Not enough stock for ${item.productName}`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: dbUser.name!,
          customerEmail: dbUser.email,
          customerPhone: dbUser.phone!,
          shippingAddress,
          couponId: cart.couponId,
          couponCode: cart.coupon?.code ?? null,
          currency: "INR",
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          discountAmount: new Prisma.Decimal(discountAmount.toFixed(2)),
          shippingAmount: new Prisma.Decimal(shippingAmount.toFixed(2)),
          totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: "COD",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              productPid: item.productPid,
              productName: item.productName,
              ageGroup: item.ageGroup,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: new Prisma.Decimal((toAmount(item.unitPrice) * item.quantity).toFixed(2)),
            })),
          },
        },
        include: { items: true },
      });

      for (const item of created.items) {
        await tx.inventoryMovement.create({
          data: {
            productVariantId: item.productVariantId,
            orderItemId: item.id,
            movementType: InventoryMovementType.SOLD,
            quantity: item.quantity,
            actorUserId: user.id,
            note: `COD Order ${created.orderNumber}`,
          },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: created.id,
          fromStatus: null,
          toStatus: OrderStatus.PENDING,
          changedByUserId: user.id,
          note: "Order placed via Cash on Delivery",
        },
      });

      if (cart.couponId) {
        await tx.couponRedemption.create({
          data: { couponId: cart.couponId, userId: user.id, orderId: created.id },
        });
        await tx.coupon.update({
          where: { id: cart.couponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { userId: user.id },
        data: {
          status: "ACTIVE",
          couponId: null,
          subtotal: new Prisma.Decimal(0),
          discountAmount: new Prisma.Decimal(0),
          shippingAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(0),
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id });
  } catch (error: any) {
    console.error("COD ORDER ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to place order" }, { status: 500 });
  }
}
