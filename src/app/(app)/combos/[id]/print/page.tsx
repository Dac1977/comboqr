import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "./print-button";

export default async function PrintPage({
  params,
}: PageProps<"/combos/[id]/print">) {
  const { id } = await params;
  const user = await requireAdmin();

  const combo = await prisma.combo.findFirst({
    where: { id, institutionId: user.institutionId },
    include: {
      vouchers: {
        where: { status: { not: "VOID" } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!combo) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold">Imprimir QRs — {combo.title}</h1>
        <PrintButton />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3">
        {combo.vouchers.map((v) => (
          <div
            key={v.id}
            className="rounded-xl bg-white p-4 text-center ring-1 ring-gray-200 print:break-inside-avoid"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/qr/${v.token}`}
              alt={`QR ${v.token.slice(0, 8)}`}
              className="mx-auto w-full max-w-[200px]"
            />
            <div className="mt-2 text-sm font-semibold">{combo.title}</div>
            <div className="text-xs text-gray-600">
              {v.totalQty} combo{v.totalQty !== 1 ? "s" : ""}
            </div>
            {v.recipientInfo && (
              <div className="mt-1 text-xs text-gray-500">{v.recipientInfo}</div>
            )}
            <div className="mt-1 font-mono text-[10px] text-gray-400">
              {v.token.slice(0, 12)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
