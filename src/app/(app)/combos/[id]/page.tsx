import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { GenerateVouchersForm } from "./generate-form";
import { VoucherRow } from "./voucher-row";

export default async function ComboDetailPage({
  params,
}: PageProps<"/combos/[id]">) {
  const { id } = await params;
  const user = await requireAdmin();

  const combo = await prisma.combo.findFirst({
    where: { id, institutionId: user.institutionId },
    include: {
      vouchers: { orderBy: { createdAt: "desc" } },
      createdBy: { select: { name: true } },
    },
  });
  if (!combo) notFound();

  const live = combo.vouchers.filter((v) => v.status !== "VOID");
  const asignados = live.reduce((s, v) => s + v.totalQty, 0);
  const entregados = live.reduce((s, v) => s + v.redeemedQty, 0);
  const sinAsignar = combo.totalStock - asignados;
  const unitValue = Number(combo.value);
  const money = (n: number) => `$${(n * unitValue).toLocaleString("es-AR")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/combos"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Combos
        </Link>
        <h1 className="text-xl font-bold">{combo.title}</h1>
      </div>

      <section className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Valor del combo</span>
          <span className="text-lg font-bold">
            ${Number(combo.value).toLocaleString("es-AR")}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-sm font-medium">Incluye:</span>
          <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
            {combo.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-gray-50 p-2">
            <div className="font-bold">{combo.totalStock}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <div className="font-bold">{sinAsignar}</div>
            <div className="text-xs text-gray-500">Sin asignar</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <div className="font-bold">{entregados}</div>
            <div className="text-xs text-gray-500">Entregados</div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-blue-50 p-2">
            <div className="font-bold text-blue-700">{money(asignados)}</div>
            <div className="text-xs text-blue-600">En QRs</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-2">
            <div className="font-bold text-blue-700">{money(entregados)}</div>
            <div className="text-xs text-blue-600">Entregado</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-2">
            <div className="font-bold text-blue-700">
              {money(asignados - entregados)}
            </div>
            <div className="text-xs text-blue-600">Saldo vivo</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Creado por {combo.createdBy.name}
        </div>
      </section>

      <GenerateVouchersForm comboId={combo.id} sinAsignar={sinAsignar} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            QRs generados ({live.length})
          </h2>
          {live.length > 0 && (
            <Link
              href={`/combos/${combo.id}/print`}
              target="_blank"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Vista de impresión
            </Link>
          )}
        </div>
        {live.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-gray-500 ring-1 ring-gray-200">
            Todavía no generaste QRs para este combo.
          </p>
        ) : (
          <ul className="space-y-2">
            {live.map((v) => (
              <VoucherRow
                key={v.id}
                voucher={{
                  id: v.id,
                  token: v.token,
                  totalQty: v.totalQty,
                  redeemedQty: v.redeemedQty,
                  status: v.status,
                  recipientInfo: v.recipientInfo,
                }}
                unitValue={unitValue}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
