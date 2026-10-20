import Link from "next/link";
import { ComboForm } from "../combo-form";

export default function NewComboPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/combos" className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver
        </Link>
        <h1 className="text-xl font-bold">Nuevo combo</h1>
      </div>
      <ComboForm />
    </div>
  );
}
