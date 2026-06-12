import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { dbUser } = await getAdminUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      order: true,
      items: { include: { orderItem: true } },
    },
  });

  if (!returnRequest) {
    return NextResponse.json({ error: "Return request not found" }, { status: 404 });
  }

  return NextResponse.json({ returnRequest });
}
