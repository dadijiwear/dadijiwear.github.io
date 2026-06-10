import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

function normalizePhone(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^\+\d{10,15}$/.test(trimmed)) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;

  return `+${digits}`;
}

function normalizeText(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkEmail = searchParams.get("checkEmail");
    const checkPhone = searchParams.get("checkPhone");

    if (checkEmail) {
      const existingUser = await prisma.user.findFirst({
        where: { email: checkEmail.trim().toLowerCase() },
      });
      return NextResponse.json({ exists: !!existingUser });
    }

    if (checkPhone) {
      const formattedPhone = normalizePhone(checkPhone);
      if (!formattedPhone) return NextResponse.json({ exists: false });
      const existingUser = await prisma.user.findFirst({
        where: { phone: formattedPhone },
      });
      return NextResponse.json({ exists: !!existingUser });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ user: userProfile });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const name = normalizeText(body.name);
    const phone = normalizePhone(body.phone);
    const kidsAge = normalizeText(body.kidsAge);
    const address = normalizeText(body.address);

    if (phone) {
      const duplicatePhone = await prisma.user.findFirst({
        where: {
          phone,
          NOT: { id: user.id },
        },
      });
      if (duplicatePhone) {
        return NextResponse.json(
          { error: "This phone number is already used by another account." },
          { status: 409 }
        );
      }
    }

    const updatedProfile = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email ?? "",
        name,
        phone,
        kidsAge,
        address,
      },
      create: {
        id: user.id,
        email: user.email ?? "",
        name,
        phone,
        kidsAge,
        address,
      },
    });

    return NextResponse.json({ success: true, user: updatedProfile });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "This information conflicts with an existing account parameter." },
        { status: 409 }
      );
    }

    console.error("PROFILE SAVE ERROR:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to save profile" },
      { status: 500 }
    );
  }
}
