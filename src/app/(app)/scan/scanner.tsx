"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner as QrScanner } from "@yudiel/react-qr-scanner";

function extractToken(raw: string) {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "scan" && parts[1]) return parts[1];
  } catch {
    // not a URL
  }
  return raw.trim();
}

export function Scanner() {
  const router = useRouter();
  const [manual, setManual] = useState("");
  const [cameraError, setCameraError] = useState(false);

  function go(raw: string) {
    const token = extractToken(raw);
    if (token) router.push(`/scan/${token}`);
  }

  return (
    <div className="space-y-4">
      {!cameraError ? (
        <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200">
          <QrScanner
            onScan={(result) => {
              const raw = result?.[0]?.rawValue;
              if (raw) go(raw);
            }}
            onError={() => setCameraError(true)}
            constraints={{ facingMode: "environment" }}
            styles={{ container: { width: "100%" } }}
          />
        </div>
      ) : (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          No se pudo acceder a la cámara. Revisá los permisos del navegador o
          escaneá el QR con la app de cámara del celular.
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(manual);
        }}
        className="flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="O pegá el link / código del QR"
          className="input"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Ir
        </button>
      </form>
    </div>
  );
}
