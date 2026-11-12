"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PASOS = [
  { n: "01", titulo: "Compras reales", texto: "Registra la factura del proveedor. El costo real, no el que crees.", rot: "rotate-1" },
  { n: "02", titulo: "Pérdidas controladas", texto: "El 30% de tu cocina se va a la basura. Cóbralo en el plato.", rot: "-rotate-1" },
  { n: "03", titulo: "El secreto de la casa", texto: "Controla el costo de tus salsas y bases, no solo del plato final.", rot: "rotate-1" },
  { n: "04", titulo: "Margen inteligente", texto: "Define tu Food Cost ideal y deja que el sistema calcule el precio.", rot: "-rotate-1" },
];

function Pin() {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="7" r="5" fill="#9ca3af" />
        <circle cx="12" cy="7" r="2.5" fill="#e5e7eb" />
        <rect x="10.5" y="11" width="3" height="10" rx="1.5" fill="#6b7280" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-8" style={{ backgroundColor: "#F9F9F6", backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes dropIn{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:translateY(0)}}
        .drop-in{animation:dropIn .55s cubic-bezier(.34,1.56,.64,1) both}
      `}</style>
      <div className="mb-8 text-center">
        <p className="text-sm font-medium tracking-wide">MiCocinaPro</p>
        <h1 className="mt-4 text-3xl sm:text-4xl leading-tight max-w-3xl mx-auto" style={{ fontFamily: "Playfair Display, serif", color: "#1A3A2A" }}>
          El error que quiebra a los restaurantes no es la comida, es no saber cuánto cuesta.
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-x-auto">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-5 lg:gap-4 px-2">
          {PASOS.map((p, i) => (
            <div key={p.n} className="flex-1 drop-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`relative h-full min-h-[300px] lg:min-w-[260px] p-6 rounded-xl text-white flex flex-col shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ${p.rot}`} style={{ backgroundColor: "#1A3A2A" }}>
                <Pin />
                <p className="text-lg font-semibold mt-2">{p.titulo}</p>
                <p className="mt-2 text-sm text-gray-300">{p.texto}</p>
                <div className="mt-auto pt-6 border-t border-white/10">
                  <p className="text-6xl font-light" style={{ fontFamily: "Playfair Display, serif", color: "#D35400" }}>{p.n}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="flex-1 drop-in" style={{ animationDelay: "0.32s" }}>
            <div className="relative h-full min-h-[300px] lg:min-w-[260px] bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col shadow-xl">
              <Pin />
              <div className="absolute -top-2 right-3 text-stone-500" style={{ fontFamily: "Caveat, cursive", fontSize: "17px" }}>
                📎 Tu cocina te espera
              </div>
              <h1 className="text-xl font-semibold mt-2">Entrar</h1>
              <p className="mt-1 text-xs text-stone-500">El costo de cada plato, claro y en orden.</p>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <form onSubmit={entrar} className="mt-4 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Correo</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">Contraseña</label>
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none" />
                  </div>
                </div>
                <button disabled={loading} className="mt-4 w-full py-2.5 rounded-xl text-white text-sm transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#E67E22,#D35400)" }}>
                  {loading ? "Entrando..." : "Entrar y costear ahora"}
                </button>
                <button type="button" onClick={() => router.push("/register")} className="mt-2 text-xs text-stone-500 hover:text-stone-700">Crear cuenta</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-stone-500">Deja de usar Excel. MiCocinaPro conecta tus compras con tu carta en 4 pasos.</p>
      </div>
    </div>
  );
}