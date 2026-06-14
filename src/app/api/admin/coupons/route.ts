import { NextResponse } from "next/server";
import { CouponEligibilityType, CouponType, Prisma } from "@prisma/client";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { toJsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET() {
  const { dbUser } = await getAdminUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const code = String(body.code || "").trim().toUpperCase();
    const name = String(body.name || "").trim();
    const type = String(body.type || "");
    const value = Number(body.value);
    const minOrderAmount = Number(body.minOrderAmount || 0);
    const maxDiscountAmount =
      body.maxDiscountAmount !== undefined && body.maxDiscountAmount !== null && body.maxDiscountAmount !== ""
        ? Number(body.maxDiscountAmount)
        : null;
    const eligibilityType = String(body.eligibilityType || "NONE");
    const oncePerUser = Boolean(body.oncePerUser);
    const active = body.active === undefined ? true : Boolean(body.active);
    const startsAt = body.startsAt ? new Date(body.startsAt) : null;
    const endsAt = body.endsAt ? new Date(body.endsAt) : null;
    const usageLimit =
      body.usageLimit !== undefined && body.usageLimit !== null && body.usageLimit !== ""
        ? Number(body.usageLimit)
        : null;

    if (!code || !name) {
      return NextResponse.json({ error: "Code and name are required" }, { status: 400 });
    }

    if (!["PERCENTAGE", "FIXED"].includes(type)) {
      return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
    }

    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      return NextResponse.json({ error: "Invalid minimum order amount" }, { status: 400 });
    }

    if (maxDiscountAmount !== null && (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount < 0)) {
      return NextResponse.json({ error: "Invalid maximum discount amount" }, { status: 400 });
    }

    if (!["NONE", "FIRST_ORDER", "KIDS_AGE"].includes(eligibilityType)) {
      return NextResponse.json({ error: "Invalid eligibility type" }, { status: 400 });
    }

    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 0)) {
      return NextResponse.json({ error: "Invalid usage limit" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        type: type as CouponType,
        value: new Prisma.Decimal(value.toFixed(2)),
        minOrderAmount: new Prisma.Decimal(minOrderAmount.toFixed(2)),
        maxDiscountAmount: maxDiscountAmount !== null ? new Prisma.Decimal(maxDiscountAmount.toFixed(2)) : null,
        eligibilityType: eligibilityType as CouponEligibilityType,
        oncePerUser,
        active,
        startsAt,
        endsAt,
        usageLimit,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: user.id,
        action: "COUPON_CREATE",
        entityType: "Coupon",
        entityId: coupon.id,
        afterData: toJsonSafe(coupon),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 });
    }
    console.error("COUPON CREATE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to create coupon" }, { status: 500 });
  }
}
