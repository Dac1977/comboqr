"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
});

export async function redeemVoucher(
  _prev: { error?: string; done?: boolean; deliveredQty?: number; title?: string },
  formData: FormData
): Promise<{
  error?: string;
  done?: boolean;
  deliveredQty?: number;
  title?: string;
}> {
  const user = await requireUser(["ADMIN", "SCANNER"]);
  const parsed = schema.safeParse({
    token: formData.get("token"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { token, quantity } = parsed.data;

  try {
    const voucher = await prisma.$transaction(async (tx) => {
      const v = await tx.voucher.findFirst({
        where: { token, combo: { institutionId: user.institutionId } },
        include: { combo: true },
      });
      if (!v) throw new Error("QR no válido");
      if (v.status === "VOID") throw new Error("Este QR fue anulado");
      if (v.status === "EXHAUSTED") throw new Error("Este QR ya no tiene saldo");

      const remaining = v.totalQty - v.redeemedQty;
      if (quantity > remaining) {
        throw new Error(`Cantidad inválida: el saldo es ${remaining}`);
      }

      const updated = await tx.$executeRaw`
        UPDATE "Voucher"
        SET "redeemedQty" = "redeemedQty" + ${quantity},
            "status" = CASE
              WHEN "redeemedQty" + ${quantity} >= "totalQty"
              THEN 'EXHAUSTED'::"VoucherStatus"
              ELSE "status"
            END
        WHERE "id" = ${v.id}
          AND "status" = 'ACTIVE'
          AND "redeemedQty" + ${quantity} <= "totalQty"`;

      if (updated === 0) {
        throw new Error("Otro escáner actualizó este QR, recargá la página");
      }

      await tx.redemption.create({
        data: { voucherId: v.id, quantity, scannedById: user.id },
      });

      return v;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/combos/${voucher.comboId}`);
    return { done: true, deliveredQty: quantity, title: voucher.combo.title };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al entregar" };
  }
}
