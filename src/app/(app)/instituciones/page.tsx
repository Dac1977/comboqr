import { requireSuperAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { CreateInstitutionForm } from "./create-form";

export default async function InstitucionesPage() {
  await requireSuperAdmin();

  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { users: true, combos: true } },
      users: {
        where: { role: { not: "SUPERADMIN" } },
        select: { name: true, email: true, role: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Instituciones</h1>

      <CreateInstitutionForm />

      <ul className="space-y-3">
        {institutions.map((inst) => (
          <li
            key={inst.id}
            className="rounded-xl bg-white p-4 ring-1 ring-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{inst.name}</span>
              <span className="text-xs text-gray-500">
                {inst._count.users} usuario{inst._count.users !== 1 ? "s" : ""} ·{" "}
                {inst._count.combos} combo{inst._count.combos !== 1 ? "s" : ""}
              </span>
            </div>
            {inst.users.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {inst.users.map((u) => (
                  <li key={u.email} className="flex justify-between">
                    <span>
                      {u.name} — {u.email}
                    </span>
                    <span className="text-xs text-gray-400">
                      {u.role === "ADMIN" ? "Admin" : "Escáner"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
