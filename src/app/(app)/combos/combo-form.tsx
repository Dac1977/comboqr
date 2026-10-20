"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCombo, updateCombo } from "./actions";

export type ComboFormData = {
  id?: string;
  title: string;
  items: string[];
  value: string;
  totalStock: number;
  asignados?: number;
};

export function ComboForm({ combo }: { combo?: ComboFormData }) {
  const action = combo ? updateCombo : createCombo;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl bg-white p-4 ring-1 ring-gray-200"
    >
      {combo && <input type="hidden" name="comboId" value={combo.id} />}

      <Field label="Título del combo">
        <input
          name="title"
          required
          defaultValue={combo?.title}
          placeholder="Ej: Combo Almuerzo"
          className="input"
        />
      </Field>

      <Field label="Elementos incluidos (uno por línea)">
        <textarea
          name="items"
          required
          rows={4}
          defaultValue={combo?.items.join("\n")}
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
            defaultValue={combo?.value}
            placeholder="0.00"
            className="input"
          />
        </Field>
        <Field label="Cantidad total de combos">
          <input
            name="totalStock"
            type="number"
            min={combo?.asignados ?? 1}
            required
            defaultValue={combo?.totalStock}
            placeholder="2000"
            className="input"
          />
        </Field>
      </div>

      {combo?.asignados != null && combo.asignados > 0 && (
        <p className="text-xs text-gray-500">
          Ya hay {combo.asignados} unidades asignadas a QRs — el stock no puede
          bajar de ese número.
        </p>
      )}
      {combo && (
        <p className="text-xs text-amber-600">
          Cambiar el valor actualiza los montos en $ de todos los QRs de este
          combo, incluidos los ya entregados.
        </p>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href={combo ? `/combos/${combo.id}` : "/combos"}
          className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Guardando…" : combo ? "Guardar cambios" : "Crear combo"}
        </button>
      </div>
    </form>
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
