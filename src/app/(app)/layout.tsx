import { requireUser } from "@/lib/dal";
import { logout } from "@/app/login/actions";
import { Nav } from "./nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div>
            <span className="font-bold">ComboQR</span>
            <span className="ml-2 text-sm text-gray-500">
              {user.institution.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">
                {user.role === "SUPERADMIN"
                  ? "Super admin"
                  : user.role === "ADMIN"
                    ? "Administrador"
                    : "Escáner"}
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <nav className="hidden border-t border-gray-100 md:block">
          <div className="mx-auto flex max-w-4xl gap-1 px-4">
            <Nav role={user.role} variant="top" />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white md:hidden">
        <Nav role={user.role} variant="bottom" />
      </nav>
    </div>
  );
}
