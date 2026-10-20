"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/vouchers";

const createComboSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(120),
  items: z.string().min(1, "Indica al menos un elemento"),
  value: z.coerce.number().positive("El valor debe ser mayor a 0"),
  totalStock: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
});

export async function createCombo(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const parsed = createComboSchema.safeParse({
    title: formData.get("title"),
    items: formData.get("items"),
    value: formData.get("value"),
    totalStock: formData.get("totalStock"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const items = parsed.data.items
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean);
  if (items.length === 0) return { error: "Indica al menos un elemento" };

  const combo = await prisma.combo.create({
    data: {
      institutionId: user.institutionId,
      title: parsed.data.title,
      items,
      value: parsed.data.value,
      totalStock: parsed.data.totalStock,
      createdById: user.id,
    },
  });

  redirect(`/combos/${combo.id}`);
}

const updateComboSchema = createComboSchema.extend({
  comboId: z.string().min(1),
});

export async function updateCombo(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const parsed = updateComboSchema.safeParse({
    comboId: formData.get("comboId"),
    title: formData.get("title"),
    items: formData.get("items"),
    value: formData.get("value"),
    totalStock: formData.get("totalStock"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { comboId, title, value, totalStock } = parsed.data;
  const items = parsed.data.items
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean);
  if (items.length === 0) return { error: "Indica al menos un elemento" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "Combo" WHERE id = ${comboId} FOR UPDATE`;

      const combo = await tx.combo.findFirst({
        where: { id: comboId, institutionId: user.institutionId },
        include: { vouchers: { where: { status: { not: "VOID" } } } },
      });
      if (!combo) throw new Error("Combo no encontrado");

      const asignados = combo.vouchers.reduce((s, v) => s + v.totalQty, 0);
      if (totalStock < asignados) {
        throw new Error(
          `El stock no puede bajar de ${asignados} (ya asignado a QRs)`
        );
      }

      await tx.combo.update({
        where: { id: comboId },
        data: { title, items, value, totalStock },
      });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al actualizar" };
  }

  revalidatePath(`/combos/${comboId}`);
  revalidatePath("/combos");
  revalidatePath("/dashboard");
  redirect(`/combos/${comboId}`);
}

export async function deleteCombo(comboId: string): Promise<{ error?: string }> {
  const user = await requireAdmin();

  try {
    await prisma.$transaction(async (tx) => {
      const combo = await tx.combo.findFirst({
        where: { id: comboId, institutionId: user.institutionId },
        include: { vouchers: true },
      });
      if (!combo) throw new Error("Combo no encontrado");

      if (combo.vouchers.some((v) => v.redeemedQty > 0)) {
        throw new Error(
          "No se puede eliminar: hay QRs con entregas registradas. Anulá los QRs activos en su lugar."
        );
      }

      await tx.voucher.deleteMany({ where: { comboId } });
      await tx.combo.delete({ where: { id: comboId } });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar" };
  }

  revalidatePath("/combos");
  revalidatePath("/dashboard");
  redirect("/combos");
}

const generateSchema = z.object({
  comboId: z.string().min(1),
  count: z.coerce.number().int().min(1).max(500),
  qtyEach: z.coerce.number().int().min(1),
  recipientInfo: z.string().max(200).optional(),
});

export async function generateVouchers(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const parsed = generateSchema.safeParse({
    comboId: formData.get("comboId"),
    count: formData.get("count"),
    qtyEach: formData.get("qtyEach"),
    recipientInfo: formData.get("recipientInfo") || undefined,
  });
  if (!parsed.success) return { error: "Datos inválidos" };

  const { comboId, count, qtyEach, recipientInfo } = parsed.data;
  const requested = count * qtyEach;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "Combo" WHERE id = ${comboId} FOR UPDATE`;

      const combo = await tx.combo.findFirst({
        where: { id: comboId, institutionId: user.institutionId },
        include: { vouchers: { where: { status: { not: "VOID" } } } },
      });
      if (!combo) throw new Error("Combo no encontrado");

      const asignados = combo.vouchers.reduce((s, v) => s + v.totalQty, 0);
      if (asignados + requested > combo.totalStock) {
        throw new Error(
          `Stock insuficiente: quedan ${combo.totalStock - asignados} sin asignar`
        );
      }

      await tx.voucher.createMany({
        data: Array.from({ length: count }, () => ({
          comboId,
          token: generateToken(),
          totalQty: qtyEach,
          recipientInfo: recipientInfo ?? null,
        })),
      });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al generar" };
  }

  revalidatePath(`/combos/${comboId}`);
  revalidatePath("/dashboard");
  return {};
}

export async function updateVoucherNote(
  voucherId: string,
  recipientInfo: string
): Promise<{ error?: string }> {
  const user = await requireAdmin();

  const voucher = await prisma.voucher.findFirst({
    where: { id: voucherId, combo: { institutionId: user.institutionId } },
  });
  if (!voucher) return { error: "QR no encontrado" };
  if (voucher.status === "VOID") return { error: "El QR está anulado" };

  await prisma.voucher.update({
    where: { id: voucherId },
    data: { recipientInfo: recipientInfo.trim() || null },
  });

  revalidatePath(`/combos/${voucher.comboId}`);
  return {};
}

export async function voidVoucher(formData: FormData) {
  const user = await requireAdmin();
  const voucherId = String(formData.get("voucherId") ?? "");

  const voucher = await prisma.voucher.findFirst({
    where: { id: voucherId, combo: { institutionId: user.institutionId } },
  });
  if (!voucher) return;

  await prisma.voucher.updateMany({
    where: { id: voucherId, status: "ACTIVE" },
    data: { status: "VOID" },
  });

  revalidatePath(`/combos/${voucher.comboId}`);
  revalidatePath("/dashboard");
}
