"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Plato = { id: string; nombre: string; categoria: string | null; costo_porcion: number; precio_venta: number | null; food_cost: number };

const NOMBRES: Record<string, string> = {
  entradas: "Entradas y sopas", fuertes: "Platos fuertes", guarniciones: "Guarniciones",
  postres: "Postres", jugos: "Jugos y gaseosas", cerveza: "Cerveza", coctel: "Cócteles",
  vino: "Copas de vino", "menú corporativo": "Menú corporativo", otros: "Sin tipo",
};
const METAS: Record<string, number> = {
  entradas: 24, fuertes: 30, guarniciones: 23, postres: 28, jugos: 18,
  cerveza: 22, coctel: 20, vino: 28, "menú corporativo": 32, otros: 30,
};
const BARRA = ["jugos", "cerveza", "coctel", "vino"];
const TIPOS = ["entradas", "fuertes", "guarniciones", "postres", "jugos", "cerveza", "coctel", "vino", "menú corporativo"];

function color(fc: number, meta: number) {
  if (!fc) return "text-stone-400";
  if (fc <= meta) return "text-green-700";
  if (fc <= meta + 5) return "text-yellow-600";
  return "text-red-600";
}
function titulo(id: string) { return NOMBRES[id] || id.charAt(0).toUpperCase() + id.slice(1); }

export default function CartaPage() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, categoria, costo_porcion, precio_venta, food_cost").eq("user_id", user.id).eq("es_preparacion", false).order("nombre");
      setPlatos(data || []);
    };
    load();
  }, []);

  const asignar = async (id: string, categoria: string) => {
    await supabase.from("recipes").update({ categoria }).eq("id", id);
    setPlatos((prev) => prev.map((p) => (p.id === id ? { ...p, categoria } : p)));
  };

  if (platos.length === 0) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-semibold">La carta</h1>
        <p className="text-stone-500 mt-3">Todavía no hay nada.</p>
        <a href="/dashboard/recetas/nueva" className="inline-block mt-6 px-5 py-3 bg-green-800 text-white rounded-xl">Costear el primero</a>
      </div>
    );
  }

  const grupos = Array.from(new Set(platos.map((p) => p.categoria || "otros")));
  const bloque = (ids: string[], nombreBloque: string) => {
    if (ids.length === 0) return null;
    return (
      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-4">{nombreBloque}</h2>
        {ids.map((id) => {
          const items = platos.filter((p) => (p.categoria || "otros") === id);
          const meta = METAS[id] || 30;
          return (
            <div key={id} className="mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-lg font-semibold">{titulo(id)}</h3>
                <span className="text-xs text-stone-400">margen {meta}%</span>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                {items.map((plato) => {
                  const neto = (plato.precio_venta || 0) / 1.08;
                  const deja = Math.round(neto - plato.costo_porcion);
                  return (
                    <div key={plato.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 last:border-0 gap-2">
                      <div>
                        <p className="font-medium">{plato.nombre}</p>
                        <p className="text-xs text-stone-400 mt-0.5">cuesta {formatCOP(plato.costo_porcion)}</p>
                        {!plato.categoria && (
                          <select onChange={(e) => asignar(plato.id, e.target.value)} className="mt-2 text-xs border rounded px-2 py-1">
                            <option value="">Asignar tipo</option>
                            {TIPOS.map((t) => <option key={t} value={t}>{titulo(t)}</option>)}
                          </select>
                        )}
                      </div>
                      <div className="sm:text-right">
                        <p className="text-lg font-semibold">{plato.precio_venta ? formatCOP(plato.precio_venta) : "sin precio"}</p>
                        <p className={"text-sm " + color(plato.food_cost, meta)}>{plato.food_cost ? plato.food_cost + "%" : "—"}</p>
                        <p className="text-xs text-stone-500">{plato.precio_venta ? "deja " + formatCOP(deja) : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    );
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">El restaurante</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">La carta</h1>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 border border-stone-300 rounded-xl text-sm">Imprimir</button>
      </div>
      {bloque(grupos.filter((g) => !BARRA.includes(g)), "Cocina")}
      {bloque(grupos.filter((g) => BARRA.includes(g)), "Barra")}
    </div>
  );
}