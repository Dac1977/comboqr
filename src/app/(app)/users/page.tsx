import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "./create-form";

export default async function UsersPage() {
  const user = await requireAdmin();

  const users = await prisma.user.findMany({
    where: { institutionId: user.institutionId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Usuarios</h1>

      <CreateUserForm currentRole={user.role} />

      <ul className="space-y-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-gray-200"
          >
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-gray-500">{u.email}</div>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                u.role === "ADMIN" || u.role === "SUPERADMIN"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {u.role === "SUPERADMIN"
                ? "Super admin"
                : u.role === "ADMIN"
                  ? "Administrador"
                  : "Escáner"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
