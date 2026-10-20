"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  institutionName: z.string().min(1, "El nombre de la institución es obligatorio"),
  adminName: z.string().min(1, "El nombre del admin es obligatorio"),
  adminEmail: z.string().email("Email inválido"),
  adminPassword: z.string().min(6, "Mínimo 6 caracteres"),
});

export async function createInstitution(
  _prev: { error?: string; ok?: boolean },
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  await requireSuperAdmin();
  const parsed = schema.safeParse({
    institutionName: formData.get("institutionName"),
    adminName: formData.get("adminName"),
    adminEmail: formData.get("adminEmail"),
    adminPassword: formData.get("adminPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const email = parsed.data.adminEmail.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Ya existe un usuario con ese email" };

  await prisma.institution.create({
    data: {
      name: parsed.data.institutionName,
      users: {
        create: {
          name: parsed.data.adminName,
          email,
          passwordHash: await bcrypt.hash(parsed.data.adminPassword, 10),
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/instituciones");
  return { ok: true };
}
