import { NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma, OrderStatus, PaymentStatus } from "@prisma/client";
import Razorpay from "razorpay";
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

    const fullName = dbUser.name;
    const email = dbUser.email;
    const phone = dbUser.phone;

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        coupon: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
            productVariant: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Bag is empty" }, { status: 400 });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + toAmount(item.unitPrice) * item.quantity, 0);
    const discountAmount = toAmount(cart.discountAmount);
    const shippingAmount = toAmount(cart.shippingAmount);
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

    const amountPaise = Math.round(totalAmount * 100);

    if (amountPaise < 100) {
      return NextResponse.json({ error: "Order amount must be at least 100 paise" }, { status: 400 });
    }

    for (const item of cart.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
      });

      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${item.productName}` },
          { status: 409 }
        );
      }
    }

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    /*
     * -----------------------------------------------------------
     * WE DONT NEED THIS ANYMORE.
     * each checkout created its own PENDING order. this will stay in the history regardless of outcome. 
    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      },
    });

    if (existingPendingOrder) {
      await prisma.order.delete({
        where: { id: existingPendingOrder.id },
      });
    }  
    ---------------------------------------------------------------
    */

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return NextResponse.json(
        { error: "Razorpay credentials missing" },
        { status: 500 }
      );
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
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
        paymentMethod: "RAZORPAY",
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
      include: {
        items: true,
      },
    });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId: user.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error: any) {
    console.error("CREATE ORDER ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create checkout order" },
      { status: 500 }
    );
  }
}
