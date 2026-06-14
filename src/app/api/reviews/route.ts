import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, ReviewStatus } from "@prisma/client";

export const runtime = "nodejs";

const ELIGIBLE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.RECEIVED,
  OrderStatus.REFUNDED,
];

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ eligible: false, review: null });
    }

    const purchase = await prisma.orderItem.findFirst({
      where: {
        productVariant: { productId },
        order: { userId: user.id, status: { in: ELIGIBLE_STATUSES } },
      },
    });

    const review = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    return NextResponse.json({ eligible: Boolean(purchase), review });
  } catch (error: any) {
    console.error("REVIEW ELIGIBILITY ERROR:", error);
    return NextResponse.json({ error: "Failed to check review eligibility" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = String(body.productId || "");
    const rating = Number(body.rating);
    const title = typeof body.title === "string" ? body.title.trim() || null : null;
    const comment = String(body.comment || "").trim();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!comment) {
      return NextResponse.json({ error: "Please write a few words for your review" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const purchase = await prisma.orderItem.findFirst({
      where: {
        productVariant: { productId },
        order: { userId: user.id, status: { in: ELIGIBLE_STATUSES } },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "You can only review products you have purchased" },
        { status: 403 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (
      existingReview &&
      existingReview.rating === rating &&
      existingReview.title === title &&
      existingReview.comment === comment
    ) {
      return NextResponse.json({ success: true, review: existingReview, unchanged: true });
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: {
        rating,
        title,
        comment,
        status: ReviewStatus.PENDING,
        verifiedPurchase: true,
      },
      create: {
        userId: user.id,
        productId,
        rating,
        title,
        comment,
        status: ReviewStatus.PENDING,
        verifiedPurchase: true,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error("REVIEW SUBMIT ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit review" }, { status: 500 });
  }
}
