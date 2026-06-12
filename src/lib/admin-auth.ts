import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, dbUser: null };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (dbUser?.role !== "ADMIN") {
    return { user, dbUser: null };
  }

  return { user, dbUser };
}
