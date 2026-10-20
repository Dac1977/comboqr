"use client";

import { useState, useTransition } from "react";
import { voidVoucher, updateVoucherNote } from "../actions";

type Voucher = {
  id: string;
  token: string;
  totalQty: number;
  redeemedQty: number;
  status: string;
  recipientInfo: string | null;
};

export function VoucherRow({
  voucher,
  unitValue,
}: {
  voucher: Voucher;
  unitValue: number;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(voucher.recipientInfo ?? "");
  const [error, setError] = useState<string>();
  const [saving, startSaving] = useTransition();
  const remaining = voucher.totalQty - voucher.redeemedQty;
  const url = `${window.location.origin}/scan/${voucher.token}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function save() {
    startSaving(async () => {
      const res = await updateVoucherNote(voucher.id, note);
      if (res.error) setError(res.error);
      else setEditing(false);
    });
  }

  return (
    <li className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                voucher.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {voucher.status === "ACTIVE" ? "Activo" : "Agotado"}
            </span>
            <span className="text-sm font-medium">
              {remaining}/{voucher.totalQty} restantes
            </span>
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            Valor QR: ${(voucher.totalQty * unitValue).toLocaleString("es-AR")}
            {remaining !== voucher.totalQty &&
              ` · restante $${(remaining * unitValue).toLocaleString("es-AR")}`}
          </div>
          {editing ? (
            <div className="mt-2 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota / beneficiario"
                maxLength={200}
                className="input py-1.5 text-sm"
                autoFocus
              />
              <button
                onClick={save}
                disabled={saving}
                className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "…" : "Guardar"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setNote(voucher.recipientInfo ?? "");
                  setError(undefined);
                }}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="mt-1 block max-w-full truncate text-left text-sm text-gray-500 hover:text-blue-600"
            >
              {voucher.recipientInfo || "+ Agregar nota / beneficiario"}
            </button>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/qr/${voucher.token}`}
          alt="QR"
          className="h-14 w-14 shrink-0"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={copy}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50"
        >
          {copied ? "¡Copiado!" : "Copiar link"}
        </button>
        <a
          href={`/qr/${voucher.token}`}
          download={`qr-${voucher.token.slice(0, 8)}.png`}
          className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium hover:bg-gray-50"
        >
          Descargar QR
        </a>
        {voucher.status === "ACTIVE" && (
          <form action={voidVoucher}>
            <input type="hidden" name="voucherId" value={voucher.id} />
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Anular
            </button>
          </form>
        )}
      </div>
    </li>
  );
}
