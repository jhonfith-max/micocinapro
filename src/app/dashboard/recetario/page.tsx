"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = {
  id: string;
  nombre: string;
  instrucciones: string | null;
  es_preparacion: boolean;
  costo_porcion?: number;
  precio_venta?: number;
  costo_total?: number;
  porciones?: number;
};
type Ing = { nombre: string; cantidad: number; unidad: string; costo?: number };

export default function RecetarioPage() {
  const [recetas, setRecetas] = useState<Recipe[]>([]);
  const [ingredientes, setIngredientes] = useState<Record<string, Ing[]>>({});
  const [vista, setVista] = useState<"cocina" | "costeo">("cocina");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, instrucciones, es_preparacion, costo_porcion, precio_venta, costo_total, porciones").eq("user_id", user.id);
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

  const foodCost = (r: Recipe) => r.precio_venta && r.costo_total ? Math.round((r.costo_total / r.precio_venta) * 100) : 0;
  const indirecto = (costo: number) => costo * 0.08;

  return (
    <div className="max-w-3xl mx-auto">
      <style>{`
        @media print {
          aside, nav, header, button, .no-print { display: none !important; }
          body, html { margin: 0; padding: 0; background: white; }
          main { margin: 0; padding: 12mm; width: 100%; }
          .ficha { page-break-inside: avoid; break-inside: avoid; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print flex justify-between items-center mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Recetario</p>
          <h1 className="text-2xl font-semibold">Fichas técnicas</h1>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 border rounded-lg text-sm">Imprimir</button>
      </div>
      <div className="no-print flex gap-2 mb-6">
        <button onClick={() => setVista("cocina")} className={`px-4 py-2 rounded-full text-sm ${vista === "cocina" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Ficha de cocina</button>
        <button onClick={() => setVista("costeo")} className={`px-4 py-2 rounded-full text-sm ${vista === "costeo" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Ficha de costeo</button>
      </div>

      <div className="space-y-8">
        {recetas.map((r) => {
          const ings = ingredientes[r.id] || [];
          const subtotal = ings.reduce((s, i) => s + (i.costo || 0), 0);
          const ind = indirecto(subtotal);
          const total = subtotal + ind;
          return (
            <div key={r.id} className="ficha border border-stone-300 p-6 bg-white text-sm">
              <div className="flex justify-between border-b border-stone-300 pb-3 mb-4">
                <div>
                  <p className="text-xs text-stone-500">{r.es_preparacion ? "SUB-RECETA" : "PLATO"}</p>
                  <h2 className="text-xl font-semibold mt-1">{r.nombre}</h2>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <p>Código: {r.id.slice(0, 8).toUpperCase()}</p>
                  <p>Porciones: {r.porciones || 1}</p>
                </div>
              </div>

              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-stone-300 text-stone-500">
                    <th className="text-left py-1">Ingrediente</th>
                    <th className="text-right">Cantidad</th>
                    <th className="text-right">Unidad</th>
                    {vista === "costeo" && <th className="text-right">Costo</th>}
                  </tr>
                </thead>
                <tbody>
                  {ings.map((ing, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      <td className="py-1">{ing.nombre}</td>
                      <td className="text-right">{ing.cantidad}</td>
                      <td className="text-right">{ing.unidad}</td>
                      {vista === "costeo" && <td className="text-right">{ing.costo ? formatCOP(ing.costo) : "-"}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              {vista === "costeo" && (
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-stone-300 pt-3">
                  <div>
                    <p>Subtotal materia prima: <span className="font-medium">{formatCOP(subtotal)}</span></p>
                    <p>Costos indirectos (8%): <span className="font-medium">{formatCOP(ind)}</span></p>
                    <p>Costo total: <span className="font-medium">{formatCOP(total)}</span></p>
                  </div>
                  <div className="text-right">
                    <p>Costo por porción: <span className="font-medium">{formatCOP(total / (r.porciones || 1))}</span></p>
                    {r.precio_venta && <p>Precio venta: <span className="font-medium">{formatCOP(r.precio_venta)}</span></p>}
                    {r.precio_venta && <p className="font-semibold">Food cost: {foodCost(r)}%</p>}
                  </div>
                </div>
              )}

              {r.instrucciones && (
                <div className="mt-4 pt-3 border-t border-stone-200">
                  <p className="text-xs font-medium text-stone-500 mb-1">Producción</p>
                  <p className="text-xs text-stone-700 whitespace-pre-wrap">{r.instrucciones}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}