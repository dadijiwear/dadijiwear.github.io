import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

function decimal(value: unknown) {
  return Number(value ?? 0);
}

function buildItem(item: any) {
  const colorImage = item?.product?.images?.find(
    (img: any) =>
      img.color &&
      item.color &&
      img.color.trim().toLowerCase() === item.color.trim().toLowerCase()
  )?.url;

  const primaryImage =
    colorImage ??
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
        color: img.color,
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

async function getCart(userId: string) {
  return prisma.cart.findUnique({
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
}

async function recalculateCart(userId: string) {
  const cart = await getCart(userId);

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

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } });

  if (existing) {
    if (existing.status === "CHECKED_OUT") {
      return prisma.cart.update({
        where: { userId },
        data: {
          status: "ACTIVE",
        },
      });
    }
    return existing;
  }

  return prisma.cart.create({
    data: {
      userId,
      status: "ACTIVE",
      subtotal: new Prisma.Decimal(0),
      discountAmount: new Prisma.Decimal(0),
      shippingAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(0),
    },
  });
}

export async function GET() {
  try {
    const {
      data: { user },
      error,
    } = await getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await getCart(user.id);

    if (!cart) {
      return NextResponse.json({
        cart: null,
      });
    }

    return NextResponse.json({
      cart: {
        id: cart.id,
        status: cart.status,
        subtotal: decimal(cart.subtotal),
        discountAmount: decimal(cart.discountAmount),
        shippingAmount: decimal(cart.shippingAmount),
        totalAmount: decimal(cart.totalAmount),
        items: cart.items.map(buildItem),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load bag" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      data: { user },
      error,
    } = await getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = String(body.productId || "");
    const size = body.size ? String(body.size) : null;
    const color = body.color ? String(body.color) : null;
    const quantity = Math.max(1, Number(body.quantity || 1));
    const variantId = body.variantId ? String(body.variantId) : null;

    if (!productId) {
      return NextResponse.json({ error: "Product is required" }, { status: 400 });
    }

    const cart = await getOrCreateCart(user.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: {
            active: true,
          },
        },
      },
    });

    if (!product || !product.active) {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }

    const variant =
      (variantId
        ? product.variants.find((item) => item.id === variantId)
        : null) ||
      product.variants.find((item) => {
        const sizeMatch = size ? item.ageGroup === size : true;
        const colorMatch = color ? item.color === color : true;
        return sizeMatch && colorMatch;
      }) ||
      product.variants[0];

    if (!variant) {
      return NextResponse.json({ error: "Variant not available" }, { status: 404 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variant.id,
        },
      },
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if (variant.stock < newQuantity) {
      return NextResponse.json(
        { error: "Not enough stock for this item" },
        { status: 409 }
      );
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variant.id,
        },
      },
      update: {
        quantity: newQuantity,
        productId: product.id,
        productPid: product.pid,
        productName: product.name,
        ageGroup: variant.ageGroup,
        color: variant.color,
        unitPrice: product.price,
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        productVariantId: variant.id,
        productPid: product.pid,
        productName: product.name,
        ageGroup: variant.ageGroup,
        color: variant.color,
        quantity,
        unitPrice: product.price,
      },
    });

    const updatedCart = await recalculateCart(user.id);

    return NextResponse.json({
      cart: {
        id: updatedCart?.id,
        status: updatedCart?.status,
        subtotal: decimal(updatedCart?.subtotal),
        discountAmount: decimal(updatedCart?.discountAmount),
        shippingAmount: decimal(updatedCart?.shippingAmount),
        totalAmount: decimal(updatedCart?.totalAmount),
        items: updatedCart?.items.map(buildItem) ?? [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to add item" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const {
      data: { user },
      error,
    } = await getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await prisma.cart.update({
        where: { userId: user.id },
        data: {
          status: "ACTIVE",
          subtotal: new Prisma.Decimal(0),
          discountAmount: new Prisma.Decimal(0),
          shippingAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(0),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to clear bag" },
      { status: 500 }
    );
  }
}
