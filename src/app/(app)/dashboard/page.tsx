import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();

  const combos = await prisma.combo.findMany({
    where: { institutionId: user.institutionId },
    include: { vouchers: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = combos.map((combo) => {
    const live = combo.vouchers.filter((v) => v.status !== "VOID");
    const asignados = live.reduce((s, v) => s + v.totalQty, 0);
    const entregados = live.reduce((s, v) => s + v.redeemedQty, 0);
    const value = Number(combo.value);
    return {
      id: combo.id,
      title: combo.title,
      total: combo.totalStock,
      asignados,
      enCirculacion: asignados - entregados,
      entregados,
      sinAsignar: combo.totalStock - asignados,
      valorEnQrs: asignados * value,
      valorEntregado: entregados * value,
      valorSaldoVivo: (asignados - entregados) * value,
    };
  });

  const totals = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      enCirculacion: acc.enCirculacion + s.enCirculacion,
      entregados: acc.entregados + s.entregados,
      sinAsignar: acc.sinAsignar + s.sinAsignar,
      valorEnQrs: acc.valorEnQrs + s.valorEnQrs,
      valorEntregado: acc.valorEntregado + s.valorEntregado,
      valorSaldoVivo: acc.valorSaldoVivo + s.valorSaldoVivo,
    }),
    {
      total: 0,
      enCirculacion: 0,
      entregados: 0,
      sinAsignar: 0,
      valorEnQrs: 0,
      valorEntregado: 0,
      valorSaldoVivo: 0,
    }
  );

  const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

  return (
    <div className="space-y-6">
      <Link
        href="/scan"
        className="block rounded-2xl bg-blue-600 p-5 text-center text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Escanear QR
      </Link>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Combos creados" value={totals.total} />
        <StatCard label="En QRs" value={money(totals.valorEnQrs)} sub={`${totals.enCirculacion + totals.entregados} unidades`} />
        <StatCard label="Entregado" value={money(totals.valorEntregado)} sub={`${totals.entregados} combos`} />
        <StatCard label="Saldo vivo en QRs" value={money(totals.valorSaldoVivo)} sub={`${totals.enCirculacion} combos`} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Por combo</h2>
        {stats.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-gray-500 ring-1 ring-gray-200">
            Todavía no hay combos creados.
          </p>
        ) : (
          <ul className="space-y-2">
            {stats.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/combos/${s.id}`}
                  className="block rounded-xl bg-white p-4 ring-1 ring-gray-200 transition hover:ring-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.title}</span>
                    <span className="text-sm text-gray-500">
                      {s.entregados}/{s.total} entregados
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${s.total ? (s.entregados / s.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    <span>Saldo vivo: {money(s.valorSaldoVivo)}</span>
                    <span>Sin asignar: {s.sinAsignar}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
