"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen paper-grain relative overflow-hidden">
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        .glow-fire {
          animation: breathe 6s ease-in-out infinite;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp 0.6s ease-out both; }
        .fade-2 { animation: fadeUp 0.6s ease-out 0.1s both; }
        .fade-3 { animation: fadeUp 0.6s ease-out 0.2s both; }
        .fade-4 { animation: fadeUp 0.6s ease-out 0.3s both; }
        .fade-5 { animation: fadeUp 0.6s ease-out 0.4s both; }
      `}</style>

      <div className="absolute top-32 left-10 w-96 h-96 glow-fire pointer-events-none" style={{ background: "radial-gradient(circle, rgba(211,84,0,0.4) 0%, transparent 70%)" }} />

      <header className="relative flex items-center justify-between px-6 sm:px-10 py-6">
        <BrandMark />
        <button
          onClick={() => router.push("/login")}
          className="hidden sm:inline-flex px-5 py-2.5 rounded-full border border-ink/15 text-sm hover:bg-white/70"
        >
          Ya tengo cuenta
        </button>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 sm:px-10 pb-16 pt-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div>
          <p className="fade-1 text-copper text-xs uppercase tracking-[0.32em]">Cocina · costos · carta</p>
          <h1 className="fade-2 mt-4 text-5xl sm:text-7xl leading-[0.95] text-ink">
            Costea como un chef.
            <span className="block text-leaf">Piensa como un negocio.</span>
          </h1>
          <p className="fade-3 mt-6 max-w-xl text-lg text-ink/70 leading-relaxed">
            MiCocinaPro es el recetario vivo de tu restaurante: compras, merma, recetas y precio de venta, sin Excel y sin misterio.
          </p>
          <div className="fade-4 mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-ink/15 bg-white/50 hover:bg-white transition-transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Entrar a la cocina
            </button>
            <button
              onClick={() => router.push("/register")}
              className="inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "#D35400" }}
            >
              Crear cuenta
            </button>
          </div>
        </div>

        <div className="fade-5 relative">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-green-600 text-white text-xs rounded-full">Sistema Activo</div>
          <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-copper">Hoy en el pass</p>
            <div className="mt-5 space-y-4">
              {[
                ["Filet mignon", "food cost 30%"],
                ["Bondiola de cerdo", "merma 18%"],
                ["Menú ejecutivo", "margen claro"],
              ].map(([plato, dato]) => (
                <div key={plato} className="flex items-center justify-between border-b border-ink/10 pb-3 last:border-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p className="font-medium">{plato}</p>
                  </div>
                  <p className="text-sm text-leaf">{dato}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-ink/55 leading-relaxed">
              Cada número nace de lo que realmente compras y de lo que se pierde en la preparación.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}