"use client";

import { useRouter } from "next/navigation";

function Sello() {
  return (
    <svg viewBox="0 0 64 64" className="w-16 h-16" aria-hidden>
      <circle cx="32" cy="32" r="30" fill="none" stroke="#1a3c34" strokeWidth="1.5" />
      <ellipse cx="32" cy="18" rx="14" ry="3.2" fill="none" stroke="#1a3c34" strokeWidth="1.2" />
      <path d="M26 21 v4 M38 21 v4" stroke="#1a3c34" strokeWidth="1.2" />
      <path d="M22 28 h20 v16 a6 6 0 0 1-6 6 h-8 a6 6 0 0 1-6-6 z" fill="none" stroke="#1a3c34" strokeWidth="1.2" />
      <path d="M26 40 a6 6 0 0 0 12 0" fill="none" stroke="#1a3c34" strokeWidth="1" />
      <circle cx="32" cy="40" r="1.2" fill="#1a3c34" />
      <path d="M32 40 15-4" stroke="#1a3c34" strokeWidth="1.2" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <Sello />
      <h1 className="text-3xl font-semibold mt-4">MiCocinaPro</h1>
      <p className="text-stone-500 mt-2 text-center">Costea tu carta. Sin Excel.</p>
      <button onClick={() => router.push("/login")} className="mt-8 px-6 py-3 bg-green-800 text-white rounded-xl">
        Entrar
      </button>
    </div>
  );
}