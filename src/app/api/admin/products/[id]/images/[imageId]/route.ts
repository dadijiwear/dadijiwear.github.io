import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function DELETE(_: Request, context: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    const { dbUser } = await getAdminUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, imageId } = await context.params;

    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const marker = "/object/public/products/";
    const markerIndex = image.url.indexOf(marker);

    if (markerIndex !== -1) {
      const path = image.url.slice(markerIndex + marker.length);
      const supabase = getSupabaseAdmin();
      await supabase.storage.from("products").remove([path]);
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("IMAGE DELETE ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete image" }, { status: 500 });
  }
}
