"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Item = {
  id: string;
  nombre: string;
  instrucciones: string | null;
  es_preparacion: boolean;
  costo_porcion?: number;
  precio_venta?: number;
  costo_total?: number;
};
type Ing = { nombre: string; cantidad: number; unidad: string; costo?: number };

export default function RecetarioPage() {
  const [recetas, setRecetas] = useState<Item[]>([]);
  const [ingredientes, setIngredientes] = useState<Record<string, Ing[]>>({});
  const [vista, setVista] = useState<"cocina" | "costeo">("cocina");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, instrucciones, es_preparacion, costo_porcion, precio_venta, costo_total").eq("user_id", user.id);
      setRecetas(data || []);
      const { data: ings } = await supabase.from("recipe_ingredients").select("recipe_id, cantidad, unidad, costo, ingredients(nombre)").eq("user_id", user.id);
      const map: Record<string, Ing[]> = {};
      ings?.forEach((i: any) => {
        if (!map[i.recipe_id]) map[i.recipe_id] = [];
        map[i.recipe_id].push({ nombre: i.ingredients?.nombre || "", cantidad: i.cantidad, unidad: i.unidad, costo: i.costo });
      });
      setIngredientes(map);
    };
    load();
  }, []);

  const foodCost = (r: Item) => {
    if (!r.precio_venta || !r.costo_total) return 0;
    return Math.round((r.costo_total / r.precio_venta) * 100);
  };

  return (
    <div className="max-w-2xl">
      <style>{`
        @media print {
          aside, nav, header, button, .print\\:hidden { display: none !important; }
          body, html { margin: 0 !important; }
          main { width: 100% !important; margin: 0 !important; padding: 16px !important; }
        }
      `}</style>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Para imprimir</p>
          <h1 className="text-2xl font-semibold mt-1">Recetario</h1>
          <p className="text-sm text-stone-500">{vista === "cocina" ? "Para la cocina. Sin precios." : "Para el dueño. Con costos."}</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm print:hidden">Imprimir</button>
      </div>
      <div className="flex gap-2 mb-6 print:hidden">
        <button onClick={() => setVista("cocina")} className={`px-4 py-2 rounded-full text-sm ${vista === "cocina" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Ficha de cocina</button>
        <button onClick={() => setVista("costeo")} className={`px-4 py-2 rounded-full text-sm ${vista === "costeo" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Ficha de costeo</button>
      </div>
      <div className="space-y-4">
        {recetas.map((r) => (
          <div key={r.id} className="bg-white border border-stone-200 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-stone-400">{r.es_preparacion ? "Sub-receta" : "Plato"}</p>
            <h2 className="font-semibold text-lg mt-1">{r.nombre}</h2>
            {vista === "costeo" && (
              <div className="mt-3 text-sm space-y-1">
                {r.costo_total && <p>Costo total: <span className="font-medium">{formatCOP(r.costo_total)}</span></p>}
                {r.precio_venta && <p>Precio de venta: <span className="font-medium">{formatCOP(r.precio_venta)}</span></p>}
                {r.precio_venta && r.costo_total && <p>Food cost: <span className="font-medium">{foodCost(r)}%</span></p>}
                {r.costo_total && <p>Margen de error (10%): <span className="font-medium">{formatCOP(r.costo_total * 0.1)}</span></p>}
              </div>
            )}
            <div className="mt-4 space-y-1">
              {ingredientes[r.id]?.map((ing, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-stone-50">
                  <span>{ing.nombre}</span>
                  <span className="text-stone-500">
                    {ing.cantidad} {ing.unidad}
                    {vista === "costeo" && ing.costo ? ` · ${formatCOP(ing.costo)}` : ""}
                  </span>
                </div>
              ))}
            </div>
            {r.instrucciones && <p className="mt-4 text-sm text-stone-600">{r.instrucciones}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}