"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-semibold">MiCocinaPro</h1>
      <p className="text-stone-500 mt-2">Costea tu carta.</p>
      <button onClick={() => router.push("/login")} className="mt-8 px-6 py-3 bg-green-800 text-white rounded-xl">
        Entrar
      </button>
    </div>
  );
}