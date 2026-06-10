import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        variants: {
          where: {
            active: true,
          },
          orderBy: [
            {
              ageGroup: "asc",
            },
            {
              color: "asc",
            },
          ],
        },
        reviews: {
          where: {
            status: "APPROVED",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error("PRODUCT GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Failed to load products",
      },
      {
        status: 500,
      }
    );
  }
}
