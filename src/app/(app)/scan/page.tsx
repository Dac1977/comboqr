import { requireUser } from "@/lib/dal";
import { Scanner } from "./scanner";

export default async function ScanPage() {
  await requireUser(["ADMIN", "SCANNER"]);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-bold">Escanear QR</h1>
      <p className="text-sm text-gray-500">
        Apuntá la cámara al QR del beneficiario, o escanealo con la cámara del
        celular: el link te trae directo a esta pantalla.
      </p>
      <Scanner />
    </div>
  );
}
