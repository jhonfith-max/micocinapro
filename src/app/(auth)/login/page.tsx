"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    <div className="min-h-screen grid lg:grid-cols-2" style={{ backgroundColor: "#F9F9F6" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fade-1{animation:fadeUp .5s ease-out both}
        .fade-2{animation:fadeUp .5s ease-out .1s both}
        .fade-3{animation:fadeUp .5s ease-out .2s both}
        .fade-4{animation:fadeUp .5s ease-out .3s both}
      `}</style>
      <div className="hidden lg:flex flex-col justify-between p-12 text-white" style={{ background: "linear-gradient(160deg,#1a3a2a,#0d1f16)" }}>
        <div>
          <p className="text-sm opacity-70">MiCocinaPro</p>
          <h2 className="mt-8 text-4xl leading-tight">El costo de cada plato, claro y en orden.</h2>
          <p className="mt-4 text-sm opacity-80">✅ Únete a los chefs que ya controlan sus números</p>
        </div>
        <div className="flex gap-3">
          {["01","02","03"].map((n)=>(
            <div key={n} className="flex-1 p-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <p className="text-xs opacity-60">{n}</p>
              <p className="mt-1 text-sm">Paso {n}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center p-8" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
        <div className="w-full max-w-sm relative">
          <div className="absolute -top-3 right-4 text-stone-400" style={{ fontFamily: "Caveat, cursive" }}>
            <span className="text-lg">📎</span> Tu cocina te espera
          </div>
          <form onSubmit={entrar} className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8" style={{ boxShadow: "0 16px 32px rgba(0,0,0,.06)" }}>
            <h1 className="fade-1 text-2xl font-semibold">Entrar</h1>
            <p className="fade-2 mt-1 text-sm text-stone-500">Accede a tu cocina</p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="fade-3 mt-6 space-y-4">
              <div>
                <label className="block text-sm text-stone-600 mb-1">Correo</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-1">Contraseña</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
              </div>
            </div>
            <button disabled={loading} className="fade-4 mt-6 w-full py-3 rounded-xl text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#E67E22,#D35400)" }}>
              {loading ? "Entrando..." : "Ingresar"}
            </button>
            <button type="button" onClick={() => router.push("/register")} className="mt-3 w-full text-sm text-stone-500 hover:text-stone-700">Crear cuenta</button>
          </form>
        </div>
      </div>
    </div>
  );
}