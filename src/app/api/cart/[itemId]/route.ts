import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

function decimal(value: unknown) {
  return Number(value ?? 0);
}

function buildItem(item: any) {
  const primaryImage =
    item?.product?.images?.find((img: any) => img.isPrimary)?.url ??
    item?.product?.images?.[0]?.url ??
    "";

  return {
    id: item.id,
    cartItemId: item.id,
    productId: item.productId,
    productVariantId: item.productVariantId,
    productPid: item.productPid,
    productName: item.productName,
    ageGroup: item.ageGroup,
    color: item.color,
    quantity: item.quantity,
    unitPrice: decimal(item.unitPrice),
    product: {
      id: item.product?.id,
      pid: item.product?.pid,
      slug: item.product?.slug,
      name: item.product?.name,
      price: decimal(item.product?.price),
      mrp: item.product?.mrp ? decimal(item.product.mrp) : null,
      images: item.product?.images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })) ?? [],
      image: primaryImage,
      category: item.product?.category,
      collection: item.product?.collection,
    },
    selectedSize: item.ageGroup,
    image: primaryImage,
    name: item.productName,
    price: decimal(item.unitPrice),
    mrp: item.product?.mrp ? decimal(item.product.mrp) : undefined,
    slug: item.product?.slug,
    category: item.product?.category,
    images: item.product?.images?.map((img: any) => img.url) ?? [],
  };
}

async function getUser() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}

async function recalculateCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
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

  if (!cart) {
    return null;
  }

  const subtotal = cart.items.reduce((acc, item) => acc + Number(item.unitPrice) * item.quantity, 0);
  const discountAmount = Number(cart.discountAmount ?? 0);
  const shippingAmount = Number(cart.shippingAmount ?? 0);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  const updated = await prisma.cart.update({
    where: { userId },
    data: {
      subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
      discountAmount: new Prisma.Decimal(discountAmount.toFixed(2)),
      shippingAmount: new Prisma.Decimal(shippingAmount.toFixed(2)),
      totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
      status: "ACTIVE",
    },
    include: {
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

  return updated;
}

export async function PATCH(request: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const {
      data: { user },
      error,
    } = await getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await context.params;
    const body = await request.json();
    const quantity = Math.max(0, Number(body.quantity ?? 0));

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: user.id,
        },
      },
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
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.productVariantId },
      });

      if (!variant) {
        return NextResponse.json({ error: "Variant not found" }, { status: 404 });
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          { error: "Not enough stock for this item" },
          { status: 409 }
        );
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: {
          quantity,
        },
      });
    }

    const updated = await recalculateCart(user.id);

    return NextResponse.json({
      cart: {
        id: updated?.id,
        status: updated?.status,
        subtotal: decimal(updated?.subtotal),
        discountAmount: decimal(updated?.discountAmount),
        shippingAmount: decimal(updated?.shippingAmount),
        totalAmount: decimal(updated?.totalAmount),
        items: updated?.items.map(buildItem) ?? [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ itemId: string }> }) {
  try {
    const {
      data: { user },
      error,
    } = await getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await context.params;

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: user.id,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    const updated = await recalculateCart(user.id);

    return NextResponse.json({
      cart: {
        id: updated?.id,
        status: updated?.status,
        subtotal: decimal(updated?.subtotal),
        discountAmount: decimal(updated?.discountAmount),
        shippingAmount: decimal(updated?.shippingAmount),
        totalAmount: decimal(updated?.totalAmount),
        items: updated?.items.map(buildItem) ?? [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
