"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ing = { nombre: string; cantidad: number; unidad: string; costo: number };
type Recipe = {
  id: string;
  nombre: string;
  instrucciones: string | null;
  es_preparacion: boolean;
  costo_porcion: number;
  precio_venta: number | null;
  food_cost: number;
  peso_plato: number | null;
  alergenos: string | null;
  ingredientes: Ing[];
};

export default function RecetarioPage() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [vista, setVista] = useState<"cocina" | "dueno">("cocina");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: recipes } = await supabase.from("recipes").select("id, nombre, instrucciones, es_preparacion, costo_porcion, precio_venta, food_cost, peso_plato, alergenos").eq("user_id", user.id).order("nombre");
      const { data: ings } = await supabase.from("recipe_ingredients").select("recipe_id, cantidad, unidad, costo, ingredients(nombre)");
      const porReceta: Record<string, Ing[]> = {};
      (ings || []).forEach((row) => {
        if (!porReceta[row.recipe_id]) porReceta[row.recipe_id] = [];
        porReceta[row.recipe_id].push({
          nombre: (row.ingredients as { nombre?: string } | null)?.nombre || "Producto",
          cantidad: row.cantidad,
          unidad: row.unidad,
          costo: row.costo,
        });
      });
      setItems((recipes || []).map((r) => ({ ...r, ingredientes: porReceta[r.id] || [] })));
    };
    load();
  }, []);

  return (
    <div className="max-w-3xl px-1">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 print:hidden">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Para imprimir</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Recetario</h1>
          <p className="text-stone-500 mt-1 text-sm">Cocina no ve precios. Tú sí.</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2.5 border border-stone-300 rounded-xl text-sm">Imprimir</button>
      </div>
      <div className="flex gap-2 mb-6 print:hidden">
        <button onClick={() => setVista("cocina")} className={"flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm " + (vista === "cocina" ? "bg-green-800 text-white" : "border border-stone-200")}>Para cocina</button>
        <button onClick={() => setVista("dueno")} className={"flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm " + (vista === "dueno" ? "bg-green-800 text-white" : "border border-stone-200")}>Para ti</button>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-stone-100 pb-3 mb-4 gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400">{item.es_preparacion ? "Sub-receta" : "Plato"}</p>
                <h2 className="text-lg sm:text-xl font-semibold capitalize">{item.nombre}</h2>
                {item.peso_plato && <p className="text-sm text-stone-500 mt-1">Salen {item.peso_plato} g en el plato</p>}
              </div>
              {vista === "dueno" && (
                <div className="sm:text-right">
                  <p className="font-semibold">{item.precio_venta ? formatCOP(item.precio_venta) : "sin precio"}</p>
                  <p className="text-sm text-stone-500">{formatCOP(item.costo_porcion)} · {item.food_cost}%</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {item.ingredientes.map((ing, i) => (
                <div key={i} className="flex items-baseline justify-between text-sm border-t border-stone-50 pt-2">
                  <span className="capitalize">{ing.nombre}</span>
                  <span className="text-stone-600">{ing.cantidad} {ing.unidad}{vista === "dueno" ? " · " + formatCOP(ing.costo) : ""}</span>
                </div>
              ))}
            </div>
            {item.alergenos && <p className="text-sm text-stone-600 mt-4">Alérgenos: {item.alergenos}</p>}
            {item.instrucciones && <p className="text-sm text-stone-600 mt-4 pt-4 border-t border-stone-100">{item.instrucciones}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}