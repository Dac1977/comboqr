import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function CombosPage() {
  const user = await requireAdmin();

  const combos = await prisma.combo.findMany({
    where: { institutionId: user.institutionId },
    include: { vouchers: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Combos</h1>
        <Link
          href="/combos/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Nuevo combo
        </Link>
      </div>

      {combos.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-500 ring-1 ring-gray-200">
          Todavía no hay combos. Creá el primero con el botón de arriba.
        </p>
      ) : (
        <ul className="space-y-2">
          {combos.map((combo) => {
            const live = combo.vouchers.filter((v) => v.status !== "VOID");
            const entregados = live.reduce((s, v) => s + v.redeemedQty, 0);
            return (
              <li key={combo.id}>
                <Link
                  href={`/combos/${combo.id}`}
                  className="block rounded-xl bg-white p-4 ring-1 ring-gray-200 transition hover:ring-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{combo.title}</span>
                    <span className="text-sm font-semibold">
                      ${Number(combo.value).toLocaleString("es-AR")}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {combo.items.join(" · ")}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Stock: {combo.totalStock} · QRs: {live.length} · Entregados:{" "}
                    {entregados}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
