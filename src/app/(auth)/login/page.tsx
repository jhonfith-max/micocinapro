"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PASOS = [
  { n: "01", titulo: "Ingredientes y Proveedores", texto: "Registra lo que compras y a quién.", icono: "📦" },
  { n: "02", titulo: "Mermas y Rendimiento", texto: "Calcula lo que se pierde al limpiar.", icono: "⚖️" },
  { n: "03", titulo: "Sub-recetas y Platos", texto: "Arma cada preparación.", icono: "🍲" },
  { n: "04", titulo: "Food Cost y Precio", texto: "Define el margen justo y actualiza tu carta.", icono: "🧮" },
];

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
    <div className="min-h-screen w-full flex flex-col p-6" style={{ backgroundColor: "#F9F9F6", backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease-out both}
      `}</style>
      <div className="mb-8">
        <p className="text-lg font-semibold">MiCocinaPro</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 lg:gap-5">
          {PASOS.map((p, i) => (
            <div key={p.n} className="flex-1 fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="h-full min-h-[280px] p-6 rounded-2xl text-white flex flex-col" style={{ backgroundColor: "#1A3A2A" }}>
                <p className="text-3xl font-light" style={{ color: "#D35400" }}>{p.n}</p>
                <p className="mt-4 text-lg font-medium">{p.titulo}</p>
                <p className="mt-2 text-sm opacity-80 flex-1">{p.texto}</p>
                <p className="mt-4 text-2xl">{p.icono}</p>
              </div>
            </div>
          ))}
          <div className="flex-1 fade-up" style={{ animationDelay: "0.32s" }}>
            <div className="relative h-full min-h-[280px] bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col" style={{ boxShadow: "0 16px 32px rgba(0,0,0,.06)" }}>
              <div className="absolute -top-3 right-4 text-stone-500" style={{ fontFamily: "Caveat, cursive", fontSize: "18px" }}>
                📎 Tu cocina te espera
              </div>
              <h1 className="text-2xl font-semibold">Entrar</h1>
              <p className="mt-1 text-sm text-stone-500">El costo de cada plato, claro y en orden.</p>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <form onSubmit={entrar} className="mt-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm text-stone-600 mb-1">Correo</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-600 mb-1">Contraseña</label>
                    <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
                  </div>
                </div>
                <button disabled={loading} className="mt-6 w-full py-3 rounded-xl text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#E67E22,#D35400)" }}>
                  {loading ? "Entrando..." : "Entrar a mi cocina"}
                </button>
                <button type="button" onClick={() => router.push("/register")} className="mt-3 text-sm text-stone-500 hover:text-stone-700">Crear cuenta</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}