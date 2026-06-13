import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { dbUser } = await getAdminUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const color = String(formData.get("color") || "").trim();
    const alt = String(formData.get("alt") || "").trim() || null;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!color) {
      return NextResponse.json({ error: "Color is required" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or WEBP images are allowed" }, { status: 400 });
    }

    const MAX_SIZE = 4 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be smaller than 4MB" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const colorSlug = color.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "image";
    const path = `${product.pid}/${colorSlug}-${randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage.from("products").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        color,
        url: urlData.publicUrl,
        alt,
        sortOrder: product.images.length,
        isPrimary,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error: any) {
    console.error("IMAGE UPLOAD ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to upload image" }, { status: 500 });
  }
}
