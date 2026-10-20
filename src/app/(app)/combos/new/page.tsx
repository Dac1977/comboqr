"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCombo } from "../actions";

export default function NewComboPage() {
  const [state, formAction, pending] = useActionState(createCombo, {});

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/combos" className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver
        </Link>
        <h1 className="text-xl font-bold">Nuevo combo</h1>
      </div>

      <form
        action={formAction}
        className="space-y-4 rounded-xl bg-white p-4 ring-1 ring-gray-200"
      >
        <Field label="Título del combo">
          <input
            name="title"
            required
            placeholder="Ej: Combo Almuerzo"
            className="input"
          />
        </Field>

        <Field label="Elementos incluidos (uno por línea)">
          <textarea
            name="items"
            required
            rows={4}
            placeholder={"Sandwich\nGaseosa 500ml\nFruta"}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor del combo">
            <input
              name="value"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              className="input"
            />
          </Field>
          <Field label="Cantidad total de combos">
            <input
              name="totalStock"
              type="number"
              min="1"
              required
              placeholder="2000"
              className="input"
            />
          </Field>
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Creando…" : "Crear combo"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
