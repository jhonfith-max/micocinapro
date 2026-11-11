"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#F9F9F6", backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes breathe { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:.75;transform:scale(1.1)} }
        .glow-fire{animation:breathe 5s ease-in-out infinite}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .fade-1{animation:fadeUp .5s ease-out both}
        .fade-2{animation:fadeUp .5s ease-out .08s both}
        .fade-3{animation:fadeUp .5s ease-out .16s both}
        .fade-4{animation:fadeUp .5s ease-out .24s both}
        .fade-5{animation:fadeUp .5s ease-out .32s both}
      `}</style>
      <div className="absolute top-20 left-10 w-[520px] h-[520px] glow-fire pointer-events-none" style={{ background: "radial-gradient(circle, rgba(211,84,0,.6) 0%, transparent 62%)", mixBlendMode: "multiply" }} />
      <header className="relative flex items-center justify-between px-6 sm:px-10 py-6">
        <BrandMark />
        <button onClick={() => router.push("/login")} className="hidden sm:inline-flex px-5 py-2.5 rounded-full border border-black/10 text-sm hover:bg-white/80">Ya tengo cuenta</button>
      </header>
      <main className="relative max-w-6xl mx-auto px-6 sm:px-10 pb-16 pt-4 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
        <div>
          <p className="fade-1 text-xs uppercase tracking-[0.3em]" style={{ color: "#D35400" }}>Cocina · costos · carta</p>
          <h1 className="fade-2 mt-3 text-5xl sm:text-7xl leading-[0.95]">Costea como un chef.<span className="block" style={{ color: "#2d6a4f" }}>Piensa como un negocio.</span></h1>
          <p className="fade-3 mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(0,0,0,.65)" }}>MiCocinaPro es el recetario vivo de tu restaurante: compras, merma, recetas y precio de venta, sin Excel y sin misterio.</p>
          <div className="fade-4 mt-7 flex flex-col sm:flex-row gap-3 max-w-md">
            <button onClick={() => router.push("/login")} className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-black/10 shadow-md hover:shadow-lg transition-all hover:scale-105">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Entrar a la cocina
            </button>
            <button onClick={() => router.push("/register")} className="inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#E67E22,#D35400)" }}>Crear cuenta</button>
          </div>
          <div className="fade-5 mt-10 inline-block bg-white p-2 shadow-md rotate-2">
            <div className="w-40 h-28 bg-stone-200 flex items-center justify-center text-xs text-stone-400">Foto del plato</div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-100/80 border border-yellow-200 rotate-3" />
          </div>
        </div>
        <div className="fade-5 relative mt-8 lg:mt-0">
          <div className="absolute -top-6 -left-4 bg-yellow-100 px-3 py-2 shadow rotate-[-3deg] text-sm" style={{ fontFamily: "Caveat, cursive" }}>¡Ojo con la merma!</div>
          <div className="bg-white/75 backdrop-blur-md border border-gray-200 rounded-2xl p-6" style={{ boxShadow: "0 20px 40px rgba(0,0,0,.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "#D35400" }}>Hoy en el pass</p>
              <span className="px-2.5 py-0.5 bg-green-600 text-white text-xs rounded-full">Sistema Activo</span>
            </div>
            <div className="space-y-3">
              {[["Filet mignon","food cost 30%"],["Bondiola de cerdo","merma 18%"],["Menú ejecutivo","margen claro"]].map(([plato,dato])=>(
                <div key={plato} className="flex items-center justify-between pb-3 border-b border-dashed border-gray-200 last:border-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <p className="font-medium text-sm">{plato}</p>
                  </div>
                  <p className="text-sm" style={{ color: "#2d6a4f" }}>{dato}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed" style={{ color: "rgba(0,0,0,.5)" }}>Cada número nace de lo que realmente compras y de lo que se pierde en la preparación.</p>
          </div>
        </div>
      </main>
    </div>
  );
}