"use client";

import { useActionState } from "react";
import { generateVouchers } from "../actions";

export function GenerateVouchersForm({
  comboId,
  sinAsignar,
}: {
  comboId: string;
  sinAsignar: number;
}) {
  const [state, formAction, pending] = useActionState(generateVouchers, {});

  return (
    <section className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
      <h2 className="mb-1 text-lg font-semibold">Generar QRs</h2>
      <p className="mb-3 text-sm text-gray-500">
        Disponibles sin asignar: <strong>{sinAsignar}</strong>
      </p>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="comboId" value={comboId} />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Cantidad de QRs</span>
            <input
              name="count"
              type="number"
              min="1"
              max="500"
              required
              placeholder="10"
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Combos por QR
            </span>
            <input
              name="qtyEach"
              type="number"
              min="1"
              required
              placeholder="50"
              className="input"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Nota / beneficiario (opcional)
          </span>
          <input
            name="recipientInfo"
            placeholder="Ej: Familia Pérez, lote A"
            className="input"
          />
        </label>
        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending || sinAsignar === 0}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Generando…" : "Generar QRs"}
        </button>
      </form>
    </section>
  );
}
