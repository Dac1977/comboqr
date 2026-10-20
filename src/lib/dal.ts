import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { institution: true },
  });
});

export async function requireUser(
  roles?: Array<"SUPERADMIN" | "ADMIN" | "SCANNER">
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export async function requireAdmin() {
  return requireUser(["SUPERADMIN", "ADMIN"]);
}

export async function requireSuperAdmin() {
  return requireUser(["SUPERADMIN"]);
}
