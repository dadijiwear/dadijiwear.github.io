import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function getAuthedUser() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}

export async function GET() {
  try {
    const {
      data: { user },
      error,
    } = await getAuthedUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orderInclude = {
      orders: {
        orderBy: { createdAt: "desc" as const },
        include: { items: true },
      },
      reviews: {
        orderBy: { createdAt: "desc" as const },
        include: {  
          product: {
            select: { name: true, pid: true, slug: true },
          },
        },
      },
    };

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: orderInclude,
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email ?? "",
        },
        include: orderInclude,
      });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        address: dbUser.address,
        kidsAge: dbUser.kidsAge,
        role: dbUser.role,
        orders: dbUser.orders ?? [],
        reviews: dbUser.reviews ?? [],
      },
    });
    

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load profile" }, { status: 500 });
  }
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

    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const kidsAge = typeof body.kidsAge === "string" ? body.kidsAge.trim() : undefined;
    const address = typeof body.address === "string" ? body.address.trim() : undefined;

    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name || null;
    if (phone !== undefined) data.phone = phone || null;
    if (kidsAge !== undefined) data.kidsAge = kidsAge || null;
    if (address !== undefined) data.address = address || null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: { items: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              select: { name: true, pid: true, slug: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        kidsAge: updated.kidsAge,
        role: updated.role,
        orders: updated.orders ?? [],
        reviews: updated.reviews ?? [],
      },
    });  

  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "This phone number is already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || "Failed to update profile" }, { status: 500 });
  }
}
