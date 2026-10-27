"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; porciones: number; precio_venta: number; costo_total: number; instrucciones: string; foto: string | null; alergenos: string[] };
type Item = { nombre: string; cantidad: number; unidad: string; costo: number };

export default function FichaPage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      const id = window.location.pathname.split("/")[3];
      const { data: rec } = await supabase.from("recipes").select("*").eq("id", id).single();
      setRecipe(rec);
      const { data: recIngs } = await supabase.from("recipe_ingredients").select("cantidad, costo, unidad, ingredients(nombre)").eq("recipe_id", id);
      if (recIngs) {
        setItems(recIngs.map((ri: any) => ({
          nombre: ri.ingredients?.nombre || "",
          cantidad: ri.cantidad,
          unidad: ri.unidad || "g",
          costo: ri.costo,
        })));
      }
    };
    load();
  }, []);

  if (!recipe) return <div className="p-6">Cargando...</div>;

  const costoPorcion = recipe.costo_total / (recipe.porciones || 1);
  const precioSinImp = recipe.precio_venta / 1.08;
  const foodCost = Math.round((costoPorcion / precioSinImp) * 100);
  const impoconsumo = recipe.precio_venta - precioSinImp;
  const margen = precioSinImp - costoPorcion;

  return (
    <div className="max-w-2xl mx-auto p-6 print:p-0">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{recipe.nombre}</h1>
          <p className="text-sm text-stone-500">{recipe.porciones} porción{recipe.porciones !== 1 ? "es" : ""}</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm print:hidden">Imprimir</button>
      </div>
      {recipe.foto && <img src={recipe.foto} alt="" className="w-full h-48 object-cover rounded-2xl mb-6" />}
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Ingredientes</p>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-stone-100">
              <span>{item.nombre}</span>
              <span>{item.cantidad} {item.unidad} · {formatCOP(item.costo)}</span>
            </div>
          ))}
        </div>
        <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Costo por porción</span><span>{formatCOP(costoPorcion)}</span></div>
          <div className="flex justify-between"><span>Precio de venta (sin imp.)</span><span>{formatCOP(precioSinImp)}</span></div>
          <div className="flex justify-between"><span>Impoconsumo 8%</span><span>{formatCOP(impoconsumo)}</span></div>
          <div className="flex justify-between font-medium"><span>Precio final</span><span>{formatCOP(recipe.precio_venta)}</span></div>
          <div className="flex justify-between"><span>Food cost</span><span className={foodCost > 30 ? "text-red-600" : "text-green-700"}>{foodCost}%</span></div>
          <div className="flex justify-between"><span>Margen de contribución</span><span>{formatCOP(margen)}</span></div>
        </div>
        {recipe.alergenos?.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Alérgenos</p>
            <p className="text-sm">{recipe.alergenos.join(", ")}</p>
          </div>
        )}
        {recipe.instrucciones && (
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Montaje</p>
            <p className="text-sm whitespace-pre-wrap">{recipe.instrucciones}</p>
          </div>
        )}
      </div>
    </div>
  );
}