// This seed.ts file is used to seed products and its variants into the supabase database storage.
// seed file can be run as 
// DO NOT RUN SEED FILE UNLESS YOU WANT TO START OVER.
// THIS SCRIPT CAN ONLY BE RUN IF YOU WANT TO PUSH BULK PRODUCTS.
// IF YOU WANT TO ADD ONLY FEW PRODUCTS MANUALLY ADD USING ADMIN PANEL.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products`;

  const placeholderUrl = `${baseUrl}/placeholder.png`;

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

  const pid4 = await prisma.product.create({
    data: {
      pid: "PID0004",
      slug: "printed-shorts-and-shirts",
      name: "Printed Shorts & Shirts",
      description:
        "Printed shorts and shirt set for everyday casual wear.",
      category: "Shorts & Shirt Set",
      collection: "Boys",
      mrp: 899,
      price: 699,
      discountPercent: 22.25,
      featured: false,
      isNew: true,
      images: {
        create: [
          {
            color: "Pink & White Shadow",
            url: placeholderUrl,
            alt: "Pink & White Shadow Variant",
            sortOrder: 1,
          },
          {
            color: "Blue & White Shadow",
            url: placeholderUrl,
            alt: "Blue & White Shadow Variant",
            sortOrder: 2,
          },
          {
            color: "Gray & White Shadow",
            url: placeholderUrl,
            alt: "Gray & White Shadow Variant",
            sortOrder: 3,
          },
          {
            color: "Solid Pink",
            url: placeholderUrl,
            alt: "Solid Pink Variant",
            sortOrder: 4,
          },
        ],
      },
      variants: {
        create: [
          {
            ageGroup: "6-7Y",
            color: "Pink & White Shadow",
            sku: "PID0004-67-PWS",
            stock: 3,
          },
          {
            ageGroup: "3-4Y",
            color: "Pink & White Shadow",
            sku: "PID0004-34-PWS",
            stock: 1,
          },
          {
            ageGroup: "5-6Y",
            color: "Blue & White Shadow",
            sku: "PID0004-56-BWS",
            stock: 2,
          },
          {
            ageGroup: "3-4Y",
            color: "Gray & White Shadow",
            sku: "PID0004-34-GWS",
            stock: 2,
          },
          {
            ageGroup: "3-4Y",
            color: "Solid Pink",
            sku: "PID0004-34-SOLIDPINK",
            stock: 1,
          },
        ],
      },
    },
  });

  const pid5 = await prisma.product.create({
    data: {
      pid: "PID0005",
      slug: "dream-on-coord-set",
      name: "Dream On Co-Ord Set",
      description:
        "Charming co-ord set designed for little girls, perfect for playtime and outings.",
      category: "Co-Ord Set",
      collection: "Girls",
      mrp: 899,
      price: 699,
      discountPercent: 22.25,
      featured: false,
      isNew: true,
      images: {
        create: [
          {
            color: "Earthy Brown",
            url: placeholderUrl,
            alt: "Earthy Brown Variant",
            sortOrder: 1,
          },
          {
            color: "Brown & Blue",
            url: placeholderUrl,
            alt: "Brown & Blue Variant",
            sortOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            ageGroup: "3-4Y",
            color: "Earthy Brown",
            sku: "PID0005-34-EARTHYBROWN",
            stock: 2,
          },
          {
            ageGroup: "5-6Y",
            color: "Earthy Brown",
            sku: "PID0005-56-EARTHYBROWN",
            stock: 3,
          },
          {
            ageGroup: "6-7Y",
            color: "Brown & Blue",
            sku: "PID0005-67-BROWNBLUE",
            stock: 2,
          },
        ],
      },
    },
  });

  const pid6 = await prisma.product.create({
    data: {
      pid: "PID0006",
      slug: "green-urban-abstract-print",
      name: "Green Urban Abstract Print",
      description:
        "Bold urban abstract print co-ord set for a trendy everyday look.",
      category: "Co-Ord Set",
      collection: "Boys",
      mrp: 899,
      price: 699,
      discountPercent: 22.25,
      featured: false,
      isNew: true,
      images: {
        create: [
          {
            color: "Olive Green Urban Abstract",
            url: placeholderUrl,
            alt: "Olive Green Urban Abstract Variant",
            sortOrder: 1,
          },
          {
            color: "Blue Urban Abstract",
            url: placeholderUrl,
            alt: "Blue Urban Abstract Variant",
            sortOrder: 2,
          },
          {
            color: "Gray Urban Abstract",
            url: placeholderUrl,
            alt: "Gray Urban Abstract Variant",
            sortOrder: 3,
          },
        ],
      },
      variants: {
        create: [
          {
            ageGroup: "6-7Y",
            color: "Olive Green Urban Abstract",
            sku: "PID0006-67-OLIVEGREEN",
            stock: 3,
          },
          {
            ageGroup: "3-4Y",
            color: "Blue Urban Abstract",
            sku: "PID0006-34-BLUEURBAN",
            stock: 3,
          },
          {
            ageGroup: "4-5Y",
            color: "Gray Urban Abstract",
            sku: "PID0006-45-GRAYURBAN",
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
    pid4: pid4.pid,
    pid5: pid5.pid,
    pid6: pid6.pid,
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
