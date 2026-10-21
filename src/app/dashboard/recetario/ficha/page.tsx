"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = {
  id: string;
  nombre: string;
  porciones: number;
  precio_venta: number | null;
  costo_porcion: number;
  food_cost: number;
  instrucciones: string | null;
  es_preparacion: boolean;
};

type IngredientRow = { id: string; cantidad: number; unidad: string; costo: number; ingredients: { nombre: string } | null };
type PrepRow = { id: string; cantidad: number; costo: number; nombre: string };

function FichaInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || "";
  const esDueno = params.get("tipo") === "dueno";
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [items, setItems] = useState<IngredientRow[]>([]);
  const [preps, setPreps] = useState<PrepRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error: fetchError } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setRecipe(data);
      const { data: rows } = await supabase.from("recipe_ingredients").select("id, cantidad, unidad, costo, ingredients(nombre)").eq("recipe_id", id);
      setItems(rows || []);
      const { data: parts, error: partsError } = await supabase.from("recipe_components").select("*").eq("recipe_id", id);
      if (partsError) {
        setError(partsError.message);
        return;
      }
      const ids = (parts || []).map((p) => p.component_recipe_id);
      const nombres: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: subs } = await supabase.from("recipes").select("id, nombre").in("id", ids);
        (subs || []).forEach((sub) => { nombres[sub.id] = sub.nombre; });
      }
      setPreps((parts || []).map((p) => ({
        id: p.id,
        cantidad: p.cantidad,
        costo: p.costo,
        nombre: nombres[p.component_recipe_id] || "Sub-receta",
      })));
    };
    load();
  }, [id]);

  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!recipe) return <div className="p-6 text-gray-500">Cargando ficha...</div>;

  return (
    <div className="max-w-3xl bg-white border rounded-xl p-8">
      <div className="flex justify-between mb-6 print:hidden">
        <button onClick={() => router.push("/dashboard/recetario")} className="text-sm text-gray-500">Volver al recetario</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg">Descargar PDF</button>
      </div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{esDueno ? "Ficha con costos" : "Ficha para cocina"} · {recipe.es_preparacion ? "Sub-receta" : "Plato"}</p>
      <h1 className="text-2xl font-bold mt-1">{recipe.nombre}</h1>
      <p className="text-gray-600 mb-4">{recipe.porciones} porcion(es)</p>
      {esDueno && (
        <div className="grid grid-cols-3 gap-3 border rounded-lg p-4 mb-4 text-sm">
          <div><p className="text-gray-500">Costo / porcion</p><p className="font-semibold">{formatCOP(recipe.costo_porcion)}</p></div>
          <div><p className="text-gray-500">Food cost</p><p className="font-semibold">{recipe.food_cost > 0 ? recipe.food_cost + "%" : "—"}</p></div>
          <div><p className="text-gray-500">Precio venta</p><p className="font-semibold">{recipe.precio_venta ? formatCOP(recipe.precio_venta) : "—"}</p></div>
        </div>
      )}
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Ingrediente</th>
            <th className="py-2">Cantidad</th>
            {esDueno && <th className="py-2">Costo</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.ingredients?.nombre || "—"}</td>
              <td className="py-2">{item.cantidad} {item.unidad}</td>
              {esDueno && <td className="py-2">{formatCOP(item.costo)}</td>}
            </tr>
          ))}
          {preps.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.nombre}</td>
              <td className="py-2">{item.cantidad} porcion</td>
              {esDueno && <td className="py-2">{formatCOP(item.costo)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
      {preps.length === 0 && <p className="text-sm text-gray-500 mb-3">Este plato no tiene sub-receta guardada.</p>}
      {recipe.instrucciones && <p className="text-sm whitespace-pre-line">{recipe.instrucciones}</p>}
    </div>
  );
}

export default function FichaPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando ficha...</div>}>
      <FichaInner />
    </Suspense>
  );
}