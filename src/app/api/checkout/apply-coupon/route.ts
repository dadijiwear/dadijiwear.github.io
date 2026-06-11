import { NextResponse } from "next/server";
import { Prisma, CouponType } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function toAmount(value: unknown): number {
  return Number(String(value ?? 0));
}

function parseKidsAgeInMonths(kidsAge: string | null | undefined): number | null {
  if (!kidsAge) return null;
  const text = kidsAge.toLowerCase();
  const numbers = text.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (numbers.length === 0) return null;
  const isYears = /y/.test(text);
  const value = Math.max(...numbers);
  return isYears ? value * 12 : value;
}

function isEligibleForCoupon(code: string, kidsAgeMonths: number | null): boolean {
  if (code.toUpperCase() === "NEWBORN06") {
    return kidsAgeMonths !== null && kidsAgeMonths <= 6;
  }
  return true;
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
    const code = String(body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your bag is empty" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const now = new Date();

    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ error: "This coupon is not active yet" }, { status: 400 });
    }

    if (coupon.endsAt && now > coupon.endsAt) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    const kidsAgeMonths = parseKidsAgeInMonths(dbUser?.kidsAge);

    if (!isEligibleForCoupon(coupon.code, kidsAgeMonths)) {
      return NextResponse.json({ error: "You are not eligible for this coupon" }, { status: 403 });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + toAmount(item.unitPrice) * item.quantity, 0);

    if (subtotal < toAmount(coupon.minOrderAmount)) {
      return NextResponse.json(
        {
          error: `Minimum order amount for this coupon is ₹${toAmount(coupon.minOrderAmount).toLocaleString("en-IN")}`,
        },
        { status: 400 }
      );
    }

    let discount = 0;

    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (subtotal * toAmount(coupon.value)) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, toAmount(coupon.maxDiscountAmount));
      }
    } else {
      discount = toAmount(coupon.value);
    }

    discount = Math.min(discount, subtotal);

    const shippingAmount = toAmount(cart.shippingAmount);
    const totalAmount = Math.max(0, subtotal - discount + shippingAmount);

    const updated = await prisma.cart.update({
      where: { userId: user.id },
      data: {
        couponId: coupon.id,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        discountAmount: new Prisma.Decimal(discount.toFixed(2)),
        totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
      },
    });

    return NextResponse.json({
      success: true,
      couponCode: coupon.code,
      discountAmount: toAmount(updated.discountAmount),
      subtotal: toAmount(updated.subtotal),
      shippingAmount: toAmount(updated.shippingAmount),
      totalAmount: toAmount(updated.totalAmount),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to apply coupon" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const {
      data: { user },
      error,
    } = await getAuthedUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + toAmount(item.unitPrice) * item.quantity, 0);
    const shippingAmount = toAmount(cart.shippingAmount);
    const totalAmount = Math.max(0, subtotal + shippingAmount);

    const updated = await prisma.cart.update({
      where: { userId: user.id },
      data: {
        couponId: null,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        discountAmount: new Prisma.Decimal(0),
        totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
      },
    });

    return NextResponse.json({
      success: true,
      subtotal: toAmount(updated.subtotal),
      shippingAmount: toAmount(updated.shippingAmount),
      discountAmount: 0,
      totalAmount: toAmount(updated.totalAmount),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to remove coupon" }, { status: 500 });
  }
}
