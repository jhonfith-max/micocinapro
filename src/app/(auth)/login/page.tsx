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

// Chinche metálico más realista
function Pin() {
  return (
    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-white/50" />
      <div className="w-1.5 h-3 bg-gray-400 shadow-md -mt-1 rounded-b-sm" />
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
    <div 
      className="min-h-screen w-full flex flex-col p-6 sm:p-12 font-sans" 
      style={{ 
        backgroundColor: "#FAFAFA", 
        backgroundImage: "radial-gradient(circle, #E5E7EB 1px, transparent 1px)", 
        backgroundSize: "24px 24px" 
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .drop-in { animation: dropIn .6s cubic-bezier(.2,.8,.2,1) both; }
      `}</style>

      {/* HEADER */}
      <div className="mb-12 text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded bg-[#111827] flex items-center justify-center text-white text-xs font-bold">M</div>
          <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase">MiCocinaPro</p>
        </div>
        <h1 
          className="text-3xl sm:text-5xl leading-[1.15] max-w-4xl mx-auto" 
          style={{ fontFamily: "Playfair Display, serif", color: "#111827" }}
        >
          El error que quiebra a los restaurantes no es la comida, es no saber cuánto cuesta.
        </h1>
      </div>

      {/* PANELES */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 px-2 items-stretch">
          
          {PASOS.map((p, i) => (
            <div key={p.n} className="flex-1 drop-in flex" style={{ animationDelay: `${i * 0.08}s` }}>
              <div 
                className={`relative w-full min-h-[320px] p-7 bg-white rounded-2xl flex flex-col border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out ${p.rot}`}
              >
                <Pin />
                <p className="text-lg font-semibold text-gray-900 mt-2">{p.titulo}</p>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{p.texto}</p>
                
                <div className="mt-auto pt-6">
                  <p 
                    className="text-[5.5rem] leading-none font-light opacity-20 select-none" 
                    style={{ fontFamily: "Playfair Display, serif", color: "#111827" }}
                  >
                    {p.n}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* LOGIN CARD */}
          <div className="flex-1 drop-in flex" style={{ animationDelay: "0.32s" }}>
            <div className="relative w-full min-h-[320px] bg-white border border-gray-200 rounded-2xl p-7 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <Pin />
              
              <div className="absolute -top-3 right-4 text-gray-500 flex items-center gap-1.5" style={{ fontFamily: "Caveat, cursive", fontSize: "18px" }}>
                <span>📎</span> Tu cocina te espera
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900 mt-2">Entrar</h1>
              <p className="mt-1 text-xs text-gray-500">El costo de cada plato, claro y en orden.</p>
              
              {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
              
              <form onSubmit={entrar} className="mt-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Correo</label>
                    <input 
                      required 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-colors" 
                      placeholder="chef@restaurante.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Contraseña</label>
                    <input 
                      required 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-colors" 
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <button 
                  disabled={loading} 
                  className="mt-6 w-full py-2.5 rounded-lg text-white text-sm font-medium transition-all bg-[#4F46E5] hover:bg-[#4338CA] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Entrando..." : "Entrar y costear ahora"}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => router.push("/register")} 
                  className="mt-3 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                  Crear cuenta nueva
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Deja de usar Excel. MiCocinaPro conecta tus compras con tu carta en 4 pasos.
        </p>
      </div>
    </div>
  );
}