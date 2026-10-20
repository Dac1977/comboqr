import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { RedeemForm } from "./redeem-form";

export default async function ScanTokenPage({
  params,
}: PageProps<"/scan/[token]">) {
  const { token } = await params;
  const user = await requireUser(["ADMIN", "SCANNER"]);

  const voucher = await prisma.voucher.findFirst({
    where: { token, combo: { institutionId: user.institutionId } },
    include: {
      combo: true,
      redemptions: {
        orderBy: { createdAt: "desc" },
        include: { scannedBy: { select: { name: true } } },
      },
    },
  });

  if (!voucher) {
    return (
      <MessageCard
        title="QR no válido"
        body="Este código no corresponde a ningún QR de tu institución."
      />
    );
  }

  if (voucher.status === "VOID") {
    return (
      <MessageCard
        title="QR anulado"
        body={`${voucher.combo.title} — este código fue anulado por un administrador.`}
      />
    );
  }

  const remaining = voucher.totalQty - voucher.redeemedQty;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-gray-200">
        <div className="text-sm text-gray-500">{user.institution.name}</div>
        <h1 className="mt-1 text-2xl font-bold">{voucher.combo.title}</h1>
        <div className="mt-1 text-sm text-gray-600">
          {voucher.combo.items.join(" · ")}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Valor: ${Number(voucher.combo.value).toLocaleString("es-AR")}
        </div>
        {voucher.recipientInfo && (
          <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
            {voucher.recipientInfo}
          </div>
        )}

        <div className="mt-4 rounded-xl bg-blue-50 p-4 text-center">
          <div className="text-4xl font-bold text-blue-700">{remaining}</div>
          <div className="text-sm text-blue-600">
            combos disponibles para retirar (de {voucher.totalQty})
          </div>
          <div className="mt-1 text-sm font-medium text-blue-700">
            ${(remaining * Number(voucher.combo.value)).toLocaleString("es-AR")} en
            saldo
          </div>
        </div>
      </section>

      {voucher.status === "ACTIVE" ? (
        <RedeemForm token={voucher.token} remaining={remaining} />
      ) : (
        <MessageCard
          title="Saldo agotado"
          body="Este QR ya entregó todos sus combos."
        />
      )}

      {voucher.redemptions.length > 0 && (
        <section className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
          <h2 className="mb-2 text-sm font-semibold">Entregas de este QR</h2>
          <ul className="space-y-1 text-sm text-gray-600">
            {voucher.redemptions.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span>
                  {r.quantity} combo{r.quantity !== 1 ? "s" : ""} — {r.scannedBy.name}
                </span>
                <span className="text-xs text-gray-400">
                  {r.createdAt.toLocaleString("es-AR")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function MessageCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{body}</p>
        <Link
          href="/scan"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Volver a escanear
        </Link>
      </div>
    </div>
  );
}
