"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default function HomePage() {
  const router = useRouter();
  
  return (
    <div 
      className="min-h-screen relative overflow-hidden font-sans" 
      style={{ 
        backgroundColor: "#FAF9F6", 
        backgroundImage: "radial-gradient(circle, #E8E6E1 1px, transparent 1px)", 
        backgroundSize: "24px 24px" 
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp .6s ease-out both; }
        .fade-2 { animation: fadeUp .6s ease-out .1s both; }
        .fade-3 { animation: fadeUp .6s ease-out .2s both; }
        .fade-4 { animation: fadeUp .6s ease-out .3s both; }
        
        .perspective-1000 { perspective: 1000px; }
        .dashboard-3d {
          transform: rotateY(-8deg) rotateX(4deg);
          transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .dashboard-3d:hover {
          transform: rotateY(0deg) rotateX(0deg);
        }
      `}</style>

      {/* Resplandor sutil de fondo */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* NAVBAR */}
      <header className="relative flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto z-20">
        <BrandMark />
        <button 
          onClick={() => router.push("/login")} 
          className="hidden sm:inline-flex px-5 py-2.5 rounded-full bg-white border border-[#E5E5E5] text-sm font-medium text-[#1A1A1A] hover:border-[#4F46E5] hover:text-[#4F46E5] shadow-sm transition-colors"
        >
          Ya tengo cuenta
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-12 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center z-10">
        
        {/* LADO IZQUIERDO: TEXTO Y CTAs */}
        <div className="flex flex-col items-start">
          <p className="fade-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#A0522D]">
            Cocina · Costos · Carta
          </p>
          
          <h1 className="fade-2 mt-4 text-5xl sm:text-6xl lg:text-7xl leading-[1.05]" style={{ fontFamily: "Playfair Display, serif" }}>
            <span className="text-[#111827]">Costea como un chef.</span>
            <span className="block text-[#4F46E5] mt-2">Piensa como un negocio.</span>
          </h1>
          
          <p className="fade-3 mt-6 max-w-lg text-lg text-[#5A5A5A] leading-relaxed">
            MiCocinaPro es el recetario vivo de tu restaurante: compras, merma, recetas y precio de venta, sin Excel y sin misterio.
          </p>
          
          <div className="fade-4 mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={() => router.push("/register")} 
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-white font-medium bg-[#4F46E5] hover:bg-[#4338CA] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
            >
              Crear cuenta gratis
            </button>
            
            <button 
              onClick={() => router.push("/login")} 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-[#1A1A1A] font-medium bg-white border border-[#E5E5E5] hover:bg-gray-50 shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Entrar a la cocina
            </button>
          </div>
        </div>

        {/* LADO DERECHO: DASHBOARD 3D Y NOTAS */}
        <div className="fade-4 relative w-full h-[500px] flex items-center justify-center perspective-1000 hidden lg:flex">
          
          {/* Tarjeta Principal (Dashboard) */}
          <div className="dashboard-3d relative w-full max-w-md bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-7 z-10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A0522D]">Hoy en el pass</p>
              <span className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold rounded-full">Sistema Activo</span>
            </div>
            
            <div className="space-y-4">
              {[
                ["Filet mignon", "Food cost 30%"],
                ["Bondiola de cerdo", "Merma 18%"],
                ["Menú ejecutivo", "Margen claro"]
              ].map(([plato, dato]) => (
                <div key={plato} className="flex items-center justify-between pb-4 border-b border-dashed border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="font-medium text-sm text-[#111827]">{plato}</p>
                  </div>
                  <p className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">{dato}</p>
                </div>
              ))}
            </div>
            
            <p className="mt-6 text-xs leading-relaxed text-gray-400">
              Cada número nace de lo que realmente compras y de lo que se pierde en la preparación.
            </p>
          </div>

          {/* Nota Adhesiva 1 (Prep List) */}
          <div className="absolute -bottom-6 -left-8 w-52 bg-[#FEF3C7] p-5 shadow-[2px_10px_20px_rgba(0,0,0,0.1)] rotate-[-4deg] z-20 border border-yellow-200">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm" />
            <p className="text-xs font-bold text-gray-800 mb-3 border-b border-yellow-300 pb-1">Prep List</p>
            <div className="space-y-2 text-gray-700" style={{ fontFamily: "Caveat, cursive", fontSize: "18px" }}>
              <p className="flex items-center gap-2"><span className="text-gray-500">☑</span> Costear Lomo</p>
              <p className="flex items-center gap-2"><span className="text-gray-500">☐</span> Revisar merma</p>
              <p className="flex items-center gap-2"><span className="text-gray-500">☐</span> Precio de carta</p>
            </div>
            {/* Mancha de café */}
            <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full pointer-events-none opacity-10 mix-blend-multiply" style={{ background: "radial-gradient(circle, transparent 40%, #4A2F1D 45%, transparent 55%)" }} />
          </div>

          {/* Nota Adhesiva 2 (Alerta) */}
          <div className="absolute -top-4 -right-4 w-44 bg-[#FEF3C7] p-4 shadow-[2px_10px_20px_rgba(0,0,0,0.1)] rotate-[6deg] z-20 border border-yellow-200">
             <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm" />
            <p className="text-gray-800 leading-tight" style={{ fontFamily: "Caveat, cursive", fontSize: "19px" }}>
              ¡Ojo con la merma del lomo!
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}