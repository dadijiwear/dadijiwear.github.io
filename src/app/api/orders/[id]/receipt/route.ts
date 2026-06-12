import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateReceiptPdf } from "@/lib/receipt";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await context.params;

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true },
    });

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const pdfBuffer = await generateReceiptPdf(order);

    return new Response( new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${order.orderNumber}-receipt.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("RECEIPT ERROR:", error);
    return new Response(error?.message || "Failed to generate receipt", { status: 500 });
  }
}
