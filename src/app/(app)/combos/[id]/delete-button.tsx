"use client";

import { useState, useTransition } from "react";
import { deleteCombo } from "../actions";

export function DeleteComboButton({ comboId }: { comboId: string }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        "¿Eliminar este combo? Se borran también sus QRs. Esta acción no se puede deshacer."
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteCombo(comboId);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Eliminando…" : "Eliminar"}
      </button>
      {error && <span className="mt-1 max-w-xs text-right text-xs text-red-600">{error}</span>}
    </span>
  );
}
