"use client";

import { useActionState } from "react";
import { createInstitution } from "./actions";

export function CreateInstitutionForm() {
  const [state, formAction, pending] = useActionState(createInstitution, {});

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-gray-200"
    >
      <h2 className="font-semibold">Nueva institución</h2>
      <input
        name="institutionName"
        required
        placeholder="Nombre de la institución"
        className="input"
      />
      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-sm font-medium text-gray-600">
          Primer administrador
        </p>
        <div className="space-y-3">
          <input
            name="adminName"
            required
            placeholder="Nombre del admin"
            className="input"
          />
          <input
            name="adminEmail"
            type="email"
            required
            placeholder="Email del admin"
            className="input"
          />
          <input
            name="adminPassword"
            type="password"
            required
            minLength={6}
            placeholder="Contraseña (mín. 6 caracteres)"
            className="input"
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Institución creada con su administrador
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear institución"}
      </button>
    </form>
  );
}
