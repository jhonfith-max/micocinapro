"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type IngredientRow = { id: string; cantidad: number; unidad: string; costo: number; nombre: string };
type PrepRow = { id: string; cantidad: number; costo: number; nombre: string };
type Recipe = {
  id: string;
  nombre: string;
  porciones: number;
  precio_venta: number | null;
  costo_porcion: number;
  food_cost: number;
  instrucciones: string | null;
  es_preparacion: boolean;
  items: IngredientRow[];
  preps: PrepRow[];
};

function LibroInner() {
  const router = useRouter();
  const params = useSearchParams();
  const esDueno = params.get("tipo") === "dueno";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("No hay sesion activa");
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("recipes")
        .select("id, nombre, porciones, precio_venta, costo_porcion, food_cost, instrucciones, es_preparacion")
        .eq("user_id", user.id)
        .order("es_preparacion", { ascending: false })
        .order("nombre");
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      const nombres: Record<string, string> = {};
      (data || []).forEach((recipe) => { nombres[recipe.id] = recipe.nombre; });
      const withItems: Recipe[] = [];
      for (const recipe of data || []) {
        const { data: rows } = await supabase.from("recipe_ingredients").select("id, cantidad, unidad, costo, ingredients(nombre)").eq("recipe_id", recipe.id);
        const { data: parts } = await supabase.from("recipe_components").select("id, component_recipe_id, cantidad, costo").eq("recipe_id", recipe.id);
        withItems.push({
          ...recipe,
          items: (rows || []).map((row) => ({
            id: row.id,
            cantidad: row.cantidad,
            unidad: row.unidad,
            costo: row.costo,
            nombre: (row.ingredients as { nombre?: string } | null)?.nombre || "Producto",
          })),
          preps: (parts || []).map((part) => ({
            id: part.id,
            cantidad: part.cantidad,
            costo: part.costo,
            nombre: nombres[part.component_recipe_id] || "Sub-receta",
          })),
        });
      }
      setRecipes(withItems);
    };
    load();
  }, []);

  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (recipes.length === 0) return <div className="p-6 text-gray-500">Cargando recetario...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between mb-6 print:hidden">
        <button onClick={() => router.push("/dashboard/recetario")} className="text-sm text-gray-500">Volver al recetario</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg">Descargar PDF</button>
      </div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{esDueno ? "Libro con costos" : "Libro para cocina"}</p>
      <h1 className="text-2xl font-bold mb-8">MiCocinaPro</h1>
      {recipes.map((recipe) => (
        <section key={recipe.id} className="bg-white border rounded-xl p-6 mb-6">
          <p className="text-xs uppercase text-gray-500">{recipe.es_preparacion ? "Sub-receta" : "Plato"}</p>
          <h2 className="text-xl font-bold">{recipe.nombre}</h2>
          <p className="text-gray-600 mb-4">{recipe.porciones} porcion(es)</p>
          {esDueno && (
            <p className="text-sm mb-3">
              Costo porcion {formatCOP(recipe.costo_porcion)}
              {recipe.food_cost > 0 ? " · Food cost " + recipe.food_cost + "%" : ""}
              {recipe.precio_venta ? " · Venta " + formatCOP(recipe.precio_venta) : ""}
            </p>
          )}
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1">Ingrediente</th>
                <th className="py-1">Cantidad</th>
                {esDueno && <th className="py-1">Costo</th>}
              </tr>
            </thead>
            <tbody>
              {recipe.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-1">{item.nombre}</td>
                  <td className="py-1">{item.cantidad} {item.unidad}</td>
                  {esDueno && <td className="py-1">{formatCOP(item.costo)}</td>}
                </tr>
              ))}
              {recipe.preps.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-1">{item.nombre}</td>
                  <td className="py-1">{item.cantidad} porcion</td>
                  {esDueno && <td className="py-1">{formatCOP(item.costo)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {recipe.instrucciones && <p className="text-sm whitespace-pre-line text-gray-700">{recipe.instrucciones}</p>}
        </section>
      ))}
    </div>
  );
}

export default function LibroPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando recetario...</div>}>
      <LibroInner />
    </Suspense>
  );
}