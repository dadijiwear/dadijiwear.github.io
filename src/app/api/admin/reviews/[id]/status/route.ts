import { NextResponse } from "next/server";
import { ReviewStatus } from "@prisma/client";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { toJsonSafe } from "@/lib/serialize";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { user, dbUser } = await getAdminUser();

    if (!dbUser || !user) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const action = String(body.action || "");

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const newStatus = action === "APPROVE" ? ReviewStatus.APPROVED : ReviewStatus.REJECTED;

    const updated = await prisma.review.update({
      where: { id },
      data: { status: newStatus },
    });

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: user.id,
        action: `REVIEW_${action}`,
        entityType: "Review",
        entityId: id,
        beforeData: toJsonSafe(existing),
        afterData: toJsonSafe(updated),
      },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    console.error("REVIEW STATUS ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to update review" }, { status: 500 });
  }
}
