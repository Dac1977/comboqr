"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().startsWith("/").default("/dashboard"),
});

export async function login(formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || "/dashboard",
  });
  if (!parsed.success) return { error: "Datos inválidos" };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { error: "Email o contraseña incorrectos" };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect(parsed.data.next);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
