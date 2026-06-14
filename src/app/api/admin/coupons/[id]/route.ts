import { NextResponse } from "next/server";
import { CouponEligibilityType, CouponType, Prisma } from "@prisma/client";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { toJsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.coupon.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const data: any = {};

    if (typeof body.name === "string") data.name = body.name.trim();

    if (body.type !== undefined) {
      if (!["PERCENTAGE", "FIXED"].includes(body.type)) {
        return NextResponse.json({ error: "Invalid coupon type" }, { status: 400 });
      }
      data.type = body.type as CouponType;
    }

    if (body.value !== undefined) {
      const value = Number(body.value);
      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json({ error: "Invalid value" }, { status: 400 });
      }
      data.value = new Prisma.Decimal(value.toFixed(2));
    }

    if (body.minOrderAmount !== undefined) {
      const minOrderAmount = Number(body.minOrderAmount);
      if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
        return NextResponse.json({ error: "Invalid minimum order amount" }, { status: 400 });
      }
      data.minOrderAmount = new Prisma.Decimal(minOrderAmount.toFixed(2));
    }

    if (body.maxDiscountAmount !== undefined) {
      if (body.maxDiscountAmount === null || body.maxDiscountAmount === "") {
        data.maxDiscountAmount = null;
      } else {
        const maxDiscountAmount = Number(body.maxDiscountAmount);
        if (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount < 0) {
          return NextResponse.json({ error: "Invalid maximum discount amount" }, { status: 400 });
        }
        data.maxDiscountAmount = new Prisma.Decimal(maxDiscountAmount.toFixed(2));
      }
    }

    if (body.eligibilityType !== undefined) {
      if (!["NONE", "FIRST_ORDER", "KIDS_AGE"].includes(body.eligibilityType)) {
        return NextResponse.json({ error: "Invalid eligibility type" }, { status: 400 });
      }
      data.eligibilityType = body.eligibilityType as CouponEligibilityType;
    }

    if (typeof body.oncePerUser === "boolean") data.oncePerUser = body.oncePerUser;
    if (typeof body.active === "boolean") data.active = body.active;

    if (body.startsAt !== undefined) {
      data.startsAt = body.startsAt ? new Date(body.startsAt) : null;
    }

    if (body.endsAt !== undefined) {
      data.endsAt = body.endsAt ? new Date(body.endsAt) : null;
    }

    if (body.usageLimit !== undefined) {
      if (body.usageLimit === null || body.usageLimit === "") {
        data.usageLimit = null;
      } else {
        const usageLimit = Number(body.usageLimit);
        if (!Number.isInteger(usageLimit) || usageLimit < 0) {
          return NextResponse.json({ error: "Invalid usage limit" }, { status: 400 });
        }
        data.usageLimit = usageLimit;
      }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data,
    });

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: user.id,
        action: "COUPON_UPDATE",
        entityType: "Coupon",
        entityId: id,
        beforeData: toJsonSafe(existing),
        afterData: toJsonSafe(updated),
      },
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error("COUPON UPDATE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to update coupon" }, { status: 500 });
  }
}
