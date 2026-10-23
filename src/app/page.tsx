"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen paper-grain">
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <BrandMark />
        <button
          onClick={() => router.push("/login")}
          className="hidden sm:inline-flex px-5 py-2.5 rounded-full border border-ink/15 text-sm hover:bg-white/70"
        >
          Ya tengo cuenta
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 sm:px-10 pb-16 pt-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div>
          <p className="text-copper text-xs uppercase tracking-[0.32em]">Cocina · costos · carta</p>
          <h1 className="mt-4 text-5xl sm:text-7xl leading-[0.95] text-ink">
            Costea como un chef.
            <span className="block text-leaf">Piensa como un negocio.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70 leading-relaxed">
            MiCocinaPro es el recetario vivo de tu restaurante: compras, merma, recetas y precio de venta, sin Excel y sin misterio.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
            <button onClick={() => router.push("/login")} className="btn-primary sm:w-auto">
              Entrar a la cocina
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-5 py-3.5 rounded-2xl border border-ink/15 bg-white/50 hover:bg-white"
            >
              Crear cuenta
            </button>
          </div>
        </div>

        <div className="card-paper p-7 rotate-1">
          <p className="text-xs uppercase tracking-[0.24em] text-copper">Hoy en el pass</p>
          <div className="mt-5 space-y-4">
            {[
              ["Lomo al cilantro", "food cost 28%"],
              ["Ceviche de coco", "merma 12%"],
              ["Menú ejecutivo", "margen claro"],
            ].map(([plato, dato]) => (
              <div key={plato} className="flex items-center justify-between border-b border-ink/10 pb-3 last:border-0">
                <p className="font-medium">{plato}</p>
                <p className="text-sm text-leaf">{dato}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink/55 leading-relaxed">
            Cada número nace de lo que realmente compras y de lo que se pierde en la preparación.
          </p>
        </div>
      </main>
    </div>
  );
}