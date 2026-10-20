"use client";

import { useActionState } from "react";
import Link from "next/link";
import { redeemVoucher } from "../actions";

export function RedeemForm({
  token,
  remaining,
}: {
  token: string;
  remaining: number;
}) {
  const [state, formAction, pending] = useActionState(redeemVoucher, {});

  if (state.done) {
    return (
      <section className="rounded-2xl bg-green-50 p-6 text-center ring-1 ring-green-200">
        <div className="text-4xl font-bold text-green-700">
          {state.deliveredQty}
        </div>
        <div className="mt-1 font-medium text-green-800">
          combo{state.deliveredQty !== 1 ? "s" : ""} de {state.title} entregado
          {state.deliveredQty !== 1 ? "s" : ""}
        </div>
        <Link
          href="/scan"
          className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          Escanear otro QR
        </Link>
      </section>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-gray-200"
    >
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Cantidad a entregar
        </span>
        <input
          name="quantity"
          type="number"
          min="1"
          max={remaining}
          defaultValue={remaining}
          required
          inputMode="numeric"
          className="input text-center text-2xl font-bold"
        />
      </label>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/scan"
          className="rounded-lg border border-gray-300 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Entregando…" : "Entregar"}
        </button>
      </div>
    </form>
  );
}
