import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });


async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  const baseUrl =
    "https://rgsbdssglkfnkpodgpnt.supabase.co/storage/v1/object/public/products";

  const pid1 = await prisma.product.create({
    data: {
      pid: "PID0001",
      slug: "elite-junior-casual-pant-shirt-set",
      name: "Elite Junior Casual Pant & Shirt Set",
      description:
        "Premium boys casual pant and shirt co-ord set for everyday comfort.",
      category: "Co-Ord Set",
      collection: "Boys",
      mrp: 899,
      price: 699,
      discountPercent: 22.25,
      featured: true,
      isNew: true,
      images: {
        create: [
          {
            color: "Blue",
            url: `${baseUrl}/PID0001/blue.webp`,
            alt: "Elite Junior Blue",
            sortOrder: 1,
          },
          {
            color: "Orange",
            url: `${baseUrl}/PID0001/orange.webp`,
            alt: "Elite Junior Olive Green",
            sortOrder: 2,
          },
          {
            color: "Yellow",
            url: `${baseUrl}/PID0001/yellow.webp`,
            alt: "Elite Junior Beige",
            sortOrder: 3,
          },
        ],
      },
      variants: {
        create: [
          {
            ageGroup: "5-6Y",
            color: "Blue",
            sku: "PID0001-56-BLUE",
            stock: 3,
          },
          {
            ageGroup: "5-6Y",
            color: "Yellow",
            sku: "PID0001-56-YELLOW",
            stock: 3,
          },
          {
            ageGroup: "5-6Y",
            color: "Orange",
            sku: "PID0001-56-ORANGE",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Blue",
            sku: "PID0001-67-BLUE",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Orange",
            sku: "PID0001-67-ORANGE",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Yellow",
            sku: "PID0001-67-YELLOW",
            stock: 3,
          },
        ],
      },
    },
  });

  const pid2 = await prisma.product.create({
    data: {
      pid: "PID0002",
      slug: "jeans-shorts-tshirt-set",
      name: "Jeans Shorts & T-Shirt",
      description:
        "Comfortable boys t-shirt and denim shorts combo for casual wear.",
      category: "T-Shirt Set",
      collection: "Boys",
      mrp: 899,
      price: 699,
      discountPercent: 22.25,
      featured: true,
      isNew: true,
      images: {
        create: [
          {
            color: "Gray",
            url: `${baseUrl}/PID0002/grey.webp`,
            alt: "Gray Variant",
            sortOrder: 1,
          },
          {
            color: "Beige",
            url: `${baseUrl}/PID0002/beige.webp`,
            alt: "Beige Variant",
            sortOrder: 2,
          },
          {
            color: "Olive Green",
            url: `${baseUrl}/PID0002/olivegreen.webp`,
            alt: "Olive Green Variant",
            sortOrder: 3,
          },
        ],
      },
      variants: {
        create: [
          {
            ageGroup: "3-4Y",
            color: "Gray",
            sku: "PID0002-34-GRAY",
            stock: 3,
          },
          {
            ageGroup: "3-4Y",
            color: "Beige",
            sku: "PID0002-34-BEIGE",
            stock: 3,
          },
          {
            ageGroup: "3-4Y",
            color: "Olive Green",
            sku: "PID0002-34-OLIVE",
            stock: 3,
          },
          {
            ageGroup: "5-6Y",
            color: "Gray",
            sku: "PID0002-56-GRAY",
            stock: 3,
          },
          {
            ageGroup: "5-6Y",
            color: "Beige",
            sku: "PID0002-56-BEIGE",
            stock: 3,
          },
          {
            ageGroup: "5-6Y",
            color: "Olive Green",
            sku: "PID0002-56-OLIVE",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Gray",
            sku: "PID0002-67-GRAY",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Beige",
            sku: "PID0002-67-BEIGE",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Olive Green",
            sku: "PID0002-67-OLIVE",
            stock: 3,
          },
        ],
      },
    },
  });

  const pid3 = await prisma.product.create({
    data: {
      pid: "PID0003",
      slug: "printed-summer-shirt-shorts-coord-set",
      name: "Printed Summer Shirt & Shorts Co-Ord Set",
      description:
        "Lightweight summer co-ord set designed for comfort and breathability.",
      category: "Summer Co-Ord Set",
      collection: "Summer",
      season: "Summer",
      mrp: 899,
      price: 699,
      discountPercent: 22.25,
      featured: false,
      isNew: true,
      images: {
        create: [
          {
            color: "Blue",
            url: `${baseUrl}/PID0003/blue.webp`,
            alt: "Blue Variant",
            sortOrder: 1,
          },
          {
            color: "Gray",
            url: `${baseUrl}/PID0003/grey.webp`,
            alt: "Gray Variant",
            sortOrder: 2,
          },
          {
            color: "Pink",
            url: `${baseUrl}/PID0003/pink.webp`,
            alt: "Pink Variant",
            sortOrder: 3,
          },
        ],
      },
      variants: {
        create: [
          {
            ageGroup: "3-4Y",
            color: "Gray",
            sku: "PID0003-34-GRAY",
            stock: 3,
          },
          {
            ageGroup: "5-6Y",
            color: "Pink",
            sku: "PID0003-56-PINK",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Gray",
            sku: "PID0003-67-GRAY",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Pink",
            sku: "PID0003-67-PINK",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Blue",
            sku: "PID0003-67-BLUE",
            stock: 3,
          },
        ],
      },
    },
  });

  console.log({
    pid1: pid1.pid,
    pid2: pid2.pid,
    pid3: pid3.pid,
  });

  await prisma.coupon.upsert({
    where: { code: "NEWBORN06" },
    update: {},
    create: {
      code: "NEWBORN06",
      name: "Newborn Welcome Offer",
      type: "PERCENTAGE",
      value: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 100,
      active: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
