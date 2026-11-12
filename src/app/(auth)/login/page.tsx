"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PASOS = [
  { n: "01", titulo: "Compras reales", texto: "Registra la factura del proveedor. El costo real, no el que crees.", rot: "rotate-1", nota: "¡Ojo con el proveedor!" },
  { n: "02", titulo: "Pérdidas controladas", texto: "El 30% de tu cocina se va a la basura. Cóbralo en el plato.", rot: "-rotate-1", nota: "Revisar merma" },
  { n: "03", titulo: "El secreto de la casa", texto: "Controla el costo de tus salsas y bases, no solo del plato final.", rot: "rotate-1", nota: "Receta de la abuela" },
  { n: "04", titulo: "Margen inteligente", texto: "Define tu Food Cost ideal y deja que el sistema calcule el precio.", rot: "-rotate-1", nota: "Margen 30%" },
];

function Cinta() {
  return (
    <div 
      className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#FDFBF7]/80 backdrop-blur-sm border border-[#E5DEC9] shadow-sm opacity-90 z-10" 
      style={{ 
        clipPath: "polygon(2% 0, 98% 5%, 100% 100%, 0 95%)",
        transform: "rotate(-2deg)"
      }} 
    />
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
      className="min-h-screen w-full flex flex-col p-4 sm:p-8 lg:p-12 font-sans overflow-hidden" 
      style={{ 
        backgroundColor: "#FAF9F6", // Crema muy limpio
        backgroundImage: "radial-gradient(circle, #E8E6E1 1px, transparent 1px)", 
        backgroundSize: "24px 24px" 
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-15px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .drop-in { animation: dropIn .6s cubic-bezier(.2,.8,.2,1) both; }
        .paper-texture {
          background-color: #FFFFFF;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* HEADER */}
      <div className="mb-8 lg:mb-12 text-center flex flex-col items-center drop-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded bg-[#111827] flex items-center justify-center text-white text-sm font-bold shadow-md">M</div>
          <p className="text-sm font-semibold tracking-widest text-[#4A4A4A] uppercase">MiCocinaPro</p>
        </div>
        <h1 
          className="text-2xl sm:text-4xl lg:text-5xl leading-[1.15] max-w-4xl mx-auto" 
          style={{ fontFamily: "Playfair Display, serif", color: "#1A1A1A" }}
        >
          El error que quiebra a los restaurantes no es la comida, es no saber cuánto cuesta.
        </h1>
      </div>

      {/* CONTENEDOR DE TARJETAS */}
      <div className="flex-1 flex items-center w-full max-w-[1400px] mx-auto">
        <div className="w-full flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-4 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 lg:px-0 lg:gap-5 items-stretch hide-scrollbar">
          
          {PASOS.map((p, i) => (
            <div key={p.n} className="min-w-[85vw] sm:min-w-[320px] lg:min-w-0 snap-center drop-in flex" style={{ animationDelay: `${i * 0.1}s` }}>
              <div 
                className={`relative w-full min-h-[340px] p-6 paper-texture rounded-sm flex flex-col border border-[#EBE8E0] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out ${p.rot}`}
              >
                <Cinta />
                
                {/* La ÚNICA mancha de café, ubicada en el paso 02 */}
                {i === 1 && (
                  <div 
                    className="absolute w-24 h-24 rounded-full pointer-events-none opacity-[0.08] mix-blend-multiply -bottom-4 -right-4"
                    style={{ background: "radial-gradient(circle, transparent 45%, #4A2F1D 50%, transparent 55%)" }}
                  />
                )}

                <span className="absolute top-4 right-4 text-lg text-[#A0522D] opacity-80 -rotate-3" style={{ fontFamily: "Caveat, cursive" }}>
                  {p.nota}
                </span>

                <p className="text-lg font-bold text-[#2C2C2C] mt-6 pr-12">{p.titulo}</p>
                <p className="mt-2 text-sm text-[#5A5A5A] leading-relaxed">{p.texto}</p>
                
                <div className="mt-auto pt-6 flex justify-between items-end relative z-0">
                  <p 
                    className="text-[4.5rem] leading-none font-light text-[#1A1A1A] opacity-[0.06] select-none -ml-2" 
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {p.n}
                  </p>
                  {/* Esquina doblada sutil */}
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-tl from-[#F0EDE4] to-transparent shadow-[-2px_-2px_4px_rgba(0,0,0,0.03)] rounded-tl-lg border-t border-l border-white" />
                </div>
              </div>
            </div>
          ))}

          {/* LOGIN CARD */}
          <div className="min-w-[85vw] sm:min-w-[320px] lg:min-w-0 snap-center drop-in flex" style={{ animationDelay: "0.5s" }}>
            <div className="relative w-full min-h-[340px] paper-texture border border-[#D1C9B6] rounded-sm p-6 pt-9 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <Cinta />
              
              <div className="absolute top-3 right-3 text-[#A0522D] flex items-center gap-1 z-20 bg-white/50 px-2 py-1 rounded backdrop-blur-sm" style={{ fontFamily: "Caveat, cursive", fontSize: "19px" }}>
                <span>📎</span> Tu cocina te espera
              </div>
              
              <h1 className="text-xl font-bold text-[#2C2C2C] mt-2">Entrar</h1>
              <p className="mt-1 text-xs text-[#5A5A5A]">El costo de cada plato, claro y en orden.</p>
              
              {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
              
              <form onSubmit={entrar} className="mt-5 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4A4A] mb-1">Correo</label>
                    <input 
                      required 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md text-sm text-[#1A1A1A] placeholder-[#A09A8D] focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                      placeholder="chef@restaurante.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4A4A] mb-1">Contraseña</label>
                    <input 
                      required 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md text-sm text-[#1A1A1A] placeholder-[#A09A8D] focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <button 
                  disabled={loading} 
                  className="mt-6 w-full py-2.5 rounded-md text-white text-sm font-medium transition-all bg-[#4F46E5] hover:bg-[#4338CA] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Entrando..." : "Entrar y costear ahora"}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => router.push("/register")} 
                  className="mt-3 text-xs text-[#5A5A5A] hover:text-[#1A1A1A] font-medium transition-colors"
                >
                  Crear cuenta nueva
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 lg:mt-8 text-center drop-in" style={{ animationDelay: "0.6s" }}>
        <p className="text-xs text-[#5A5A5A] font-medium">
          Deja de usar Excel. MiCocinaPro conecta tus compras con tu carta en 4 pasos.
        </p>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}