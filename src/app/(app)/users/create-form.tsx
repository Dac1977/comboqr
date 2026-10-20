"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

export function CreateUserForm({
  currentRole,
}: {
  currentRole: "SUPERADMIN" | "ADMIN" | "SCANNER";
}) {
  const [state, formAction, pending] = useActionState(createUser, {});

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-gray-200"
    >
      <h2 className="font-semibold">Crear usuario</h2>
      <input name="name" required placeholder="Nombre" className="input" />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="input"
      />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Contraseña (mín. 6 caracteres)"
        className="input"
      />
      <select name="role" className="input" defaultValue="SCANNER">
        <option value="SCANNER">Escáner (solo escanea)</option>
        <option value="ADMIN">Administrador (crea combos y escanea)</option>
        {currentRole === "SUPERADMIN" && (
          <option value="SUPERADMIN">Super admin (crea instituciones)</option>
        )}
      </select>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Usuario creado
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
