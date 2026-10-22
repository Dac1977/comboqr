import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { MovimientosTable } from "./movimientos-table";

export default async function MovimientosPage() {
  const user = await requireAdmin();

  const [redemptions, combos, users] = await Promise.all([
    prisma.redemption.findMany({
      where: { voucher: { combo: { institutionId: user.institutionId } } },
      include: {
        voucher: { include: { combo: { select: { id: true, title: true } } } },
        scannedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.combo.findMany({
      where: { institutionId: user.institutionId },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.user.findMany({
      where: { institutionId: user.institutionId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows = redemptions.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    quantity: r.quantity,
    comboId: r.voucher.combo.id,
    comboTitle: r.voucher.combo.title,
    beneficiary: r.voucher.recipientInfo ?? "—",
    token: r.voucher.token,
    scannedById: r.scannedBy.id,
    scannedByName: r.scannedBy.name,
    scannedByEmail: r.scannedBy.email,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Movimientos</h1>
        <p className="text-sm text-gray-500">
          Historial de entregas: quién entregó, cuánto y cuándo.
        </p>
      </div>
      <MovimientosTable rows={rows} combos={combos} users={users} />
    </div>
  );
}
