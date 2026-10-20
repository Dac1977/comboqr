"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Panel", roles: ["SUPERADMIN", "ADMIN", "SCANNER"] },
  { href: "/combos", label: "Combos", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/users", label: "Usuarios", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/instituciones", label: "Instituciones", roles: ["SUPERADMIN"] },
  { href: "/scan", label: "Escanear", roles: ["SUPERADMIN", "ADMIN", "SCANNER"] },
];

export function Nav({
  role,
  variant,
}: {
  role: "SUPERADMIN" | "ADMIN" | "SCANNER";
  variant: "top" | "bottom";
}) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => i.roles.includes(role));

  if (variant === "bottom") {
    return (
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`py-3 text-center text-sm font-medium ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-3 py-2 text-sm font-medium ${
              active
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
