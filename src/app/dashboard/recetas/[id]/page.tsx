"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; porciones: number; precio_venta: number; costo_total: number; instrucciones: string; foto: string | null };
type Item = { nombre: string; cantidad: number; unidad: string; costo: number };

export default function FichaPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      const id = window.location.pathname.split("/")[3];
      const { data: rec } = await supabase.from("recipes").select("*").eq("id", id).single();
      setRecipe(rec);
      const { data: recIngs } = await supabase.from("recipe_ingredients").select("ingredient_id, cantidad, costo, unidad").eq("recipe_id", id);
      const { data: recSubs } = await supabase.from("recipe_components").select("component_recipe_id, cantidad, costo").eq("recipe_id", id);
      const { data: ings } = await supabase.from("ingredients").select("id, nombre");
      const { data: subs } = await supabase.from("recipes").select("id, nombre");
      const lista: Item[] = [];
      if (recIngs) recIngs.forEach((ri) => lista.push({ nombre: ings?.find((i) => i.id === ri.ingredient_id)?.nombre || "", cantidad: ri.cantidad, unidad: ri.unidad || "g", costo: ri.costo }));
      if (recSubs) recSubs.forEach((rs) => lista.push({ nombre: subs?.find((s) => s.id === rs.component_recipe_id)?.nombre || "", cantidad: rs.cantidad, unidad: "porción", costo: rs.costo }));
      setItems(lista);
    };
    load();
  }, []);

  if (!recipe) return <div className="p-6">Cargando...</div>;

  const costoPorcion = recipe.costo_total / (recipe.porciones || 1);
  const foodCost = Math.round((costoPorcion / recipe.precio_venta) * 100);
  const impoconsumo = Math.round(recipe.precio_venta * 0.08);
  const precioRecomendado = Math.round(costoPorcion / 0.3);
  const margen = recipe.precio_venta - costoPorcion;

  return (
    <div className="max-w-2xl mx-auto p-6 print:p-4 print:max-w-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{recipe.nombre}</h1>
          <p className="text-sm text-stone-500">{recipe.porciones} porción{recipe.porciones !== 1 ? "es" : ""}</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm print:hidden">Imprimir</button>
      </div>
      {recipe.foto && <img src={recipe.foto} alt="" className="w-full max-h-48 object-cover rounded-2xl mb-6 print:max-h-32" />}
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Ingredientes</p>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-stone-100">
              <span>{item.nombre}</span>
              <span className="text-right">{item.cantidad} {item.unidad} · {formatCOP(Math.round(item.costo))}</span>
            </div>
          ))}
        </div>
        <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm print:bg-white print:border">
          <div className="flex justify-between"><span>Costo de producción</span><span>{formatCOP(Math.round(costoPorcion))}</span></div>
          <div className="flex justify-between"><span>Precio de venta</span><span>{formatCOP(recipe.precio_venta)}</span></div>
          <div className="flex justify-between"><span>Impoconsumo 8%</span><span>{formatCOP(impoconsumo)}</span></div>
          <div className="flex justify-between font-medium"><span>Precio recomendado</span><span>{formatCOP(precioRecomendado)}</span></div>
          <div className="flex justify-between"><span>Food cost</span><span className={foodCost > 30 ? "text-red-600" : "text-green-700"}>{foodCost}%</span></div>
          <div className="flex justify-between"><span>Margen de ganancia</span><span>{formatCOP(Math.round(margen))}</span></div>
        </div>
        {recipe.instrucciones && (
          <div className="print:break-inside-avoid">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Montaje</p>
            <p className="text-sm whitespace-pre-wrap break-all max-w-full overflow-hidden">{recipe.instrucciones}</p>
          </div>
        )}
      </div>
    </div>
  );
}