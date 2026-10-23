import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <Image
          src="/logo.png"
          alt="Logo"
          width={96}
          height={83}
          className="mx-auto h-20 w-auto"
          priority
        />
        <p className="mt-1 mb-6 text-sm text-gray-500">
          Inicia sesión para continuar
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
