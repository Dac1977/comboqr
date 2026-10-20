import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ComboForm } from "../../combo-form";

export default async function EditComboPage({
  params,
}: PageProps<"/combos/[id]/edit">) {
  const { id } = await params;
  const user = await requireAdmin();

  const combo = await prisma.combo.findFirst({
    where: { id, institutionId: user.institutionId },
    include: { vouchers: { where: { status: { not: "VOID" } } } },
  });
  if (!combo) notFound();

  const asignados = combo.vouchers.reduce((s, v) => s + v.totalQty, 0);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/combos/${combo.id}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Volver
        </Link>
        <h1 className="text-xl font-bold">Editar combo</h1>
      </div>
      <ComboForm
        combo={{
          id: combo.id,
          title: combo.title,
          items: combo.items,
          value: String(combo.value),
          totalStock: combo.totalStock,
          asignados,
        }}
      />
    </div>
  );
}
