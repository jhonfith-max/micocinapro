"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PASOS = [
  { n: "01", titulo: "Ingredientes y Proveedores", texto: "Registra lo que compras y a quién.", icono: "📦", rot: "rotate-1" },
  { n: "02", titulo: "Mermas y Rendimiento", texto: "Calcula lo que se pierde al limpiar.", icono: "⚖️", rot: "-rotate-1" },
  { n: "03", titulo: "Sub-recetas y Platos", texto: "Arma cada preparación.", icono: "🍲", rot: "rotate-1" },
  { n: "04", titulo: "Food Cost y Precio", texto: "Define el margen justo y actualiza tu carta.", icono: "🧮", rot: "-rotate-1" },
];

function Pin() {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="8" r="6" fill="#9ca3af" />
        <circle cx="14" cy="8" r="3" fill="#d1d5db" />
        <rect x="12.5" y="12" width="3" height="12" rx="1.5" fill="#6b7280" />
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
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-8" style={{ backgroundColor: "#F9F9F6", backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes dropIn{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}}
        .drop-in{animation:dropIn .6s cubic-bezier(.34,1.56,.64,1) both}
      `}</style>
      <div className="mb-6 sm:mb-10">
        <p className="text-lg font-semibold">MiCocinaPro</p>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-x-auto">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 lg:gap-5 px-2">
          {PASOS.map((p, i) => (
            <div key={p.n} className="flex-1 drop-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`relative h-full min-h-[320px] lg:min-w-[240px] p-6 rounded-xl text-white flex flex-col shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ${p.rot}`} style={{ backgroundColor: "#1A3A2A" }}>
                <Pin />
                <p className="text-4xl font-light" style={{ color: "#D35400" }}>{p.n}</p>
                <p className="mt-4 text-xl font-semibold">{p.titulo}</p>
                <p className="mt-2 text-sm text-gray-300 flex-1">{p.texto}</p>
                <p className="mt-auto pt-4 text-3xl">{p.icono}</p>
              </div>
            </div>
          ))}
          <div className="flex-1 drop-in" style={{ animationDelay: "0.4s" }}>
            <div className="relative h-full min-h-[320px] lg:min-w-[240px] bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col shadow-lg" style={{ boxShadow: "0 16px 32px rgba(0,0,0,.08)" }}>
              <Pin />
              <div className="absolute -top-2 right-4 text-stone-500" style={{ fontFamily: "Caveat, cursive", fontSize: "18px" }}>
                📎 Tu cocina te espera
              </div>
              <h1 className="text-2xl font-semibold mt-2">Entrar</h1>
              <p className="mt-1 text-sm text-stone-500">El costo de cada plato, claro y en orden.</p>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <form onSubmit={entrar} className="mt-4 flex-1 flex flex-col">
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="block text-sm text-stone-600 mb-1">Correo</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-600 mb-1">Contraseña</label>
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" />
                  </div>
                </div>
                <button disabled={loading} className="mt-4 w-full py-3 rounded-xl text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#E67E22,#D35400)" }}>
                  {loading ? "Entrando..." : "Entrar a mi cocina"}
                </button>
                <button type="button" onClick={() => router.push("/register")} className="mt-2 text-sm text-stone-500 hover:text-stone-700">Crear cuenta</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}