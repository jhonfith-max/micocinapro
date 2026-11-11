"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#faf8f5", backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        .glow-fire { animation: breathe 5s ease-in-out infinite; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp 0.5s ease-out both; }
        .fade-2 { animation: fadeUp 0.5s ease-out 0.08s both; }
        .fade-3 { animation: fadeUp 0.5s ease-out 0.16s both; }
        .fade-4 { animation: fadeUp 0.5s ease-out 0.24s both; }
        .fade-5 { animation: fadeUp 0.5s ease-out 0.32s both; }
      `}</style>

      <div className="absolute top-24 left-16 w-[500px] h-[500px] glow-fire pointer-events-none" style={{ background: "radial-gradient(circle, rgba(211,84,0,0.55) 0%, transparent 65%)", mixBlendMode: "multiply" }} />

      <header className="relative flex items-center justify-between px-6 sm:px-10 py-6">
        <BrandMark />
        <button onClick={() => router.push("/login")} className="hidden sm:inline-flex px-5 py-2.5 rounded-full border border-black/10 text-sm hover:bg-white/80">
          Ya tengo cuenta
        </button>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 sm:px-10 pb-16 pt-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div>
          <p className="fade-1 text-xs uppercase tracking-[0.32em]" style={{ color: "#D35400" }}>Cocina · costos · carta</p>
          <h1 className="fade-2 mt-4 text-5xl sm:text-7xl leading-[0.95]">
            Costea como un chef.
            <span className="block" style={{ color: "#2d6a4f" }}>Piensa como un negocio.</span>
          </h1>
          <p className="fade-3 mt-6 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(0,0,0,0.65)" }}>
            MiCocinaPro es el recetario vivo de tu restaurante: compras, merma, recetas y precio de venta, sin Excel y sin misterio.
          </p>
          <div className="fade-4 mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
            <button onClick={() => router.push("/login")} className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-black/10 shadow-md hover:shadow-lg transition-all hover:scale-105">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Entrar a la cocina
            </button>
            <button onClick={() => router.push("/register")} className="inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #e67e22, #D35400)" }}>
              Crear cuenta
            </button>
          </div>
        </div>

        <div className="fade-5">
          <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-2xl p-6" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "#D35400" }}>Hoy en el pass</p>
              <span className="px-2.5 py-0.5 bg-green-600 text-white text-xs rounded-full">Sistema Activo</span>
            </div>
            <div className="space-y-3">
              {[
                ["Filet mignon", "food cost 30%"],
                ["Bondiola de cerdo", "merma 18%"],
                ["Menú ejecutivo", "margen claro"],
              ].map(([plato, dato]) => (
                <div key={plato} className="flex items-center justify-between pb-3 border-b border-dashed border-gray-200 last:border-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p className="font-medium text-sm">{plato}</p>
                  </div>
                  <p className="text-sm" style={{ color: "#2d6a4f" }}>{dato}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}>
              Cada número nace de lo que realmente compras y de lo que se pierde en la preparación.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}