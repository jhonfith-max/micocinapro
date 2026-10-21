"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
type PrepRow = { id: string; cantidad: number; costo: number; recipes: { nombre: string } | null };

export default function RecetaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const [ids, setIds] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [items, setItems] = useState<IngredientRow[]>([]);
  const [preps, setPreps] = useState<PrepRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tecla = "px-4 py-2.5 border border-gray-300 rounded-lg shadow-[0_4px_0_0_#d1d5db] active:translate-y-1 active:shadow-none transition-all disabled:opacity-40";

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("No hay sesion activa");
        return;
      }
      const { data: lista } = await supabase.from("recipes").select("id").eq("user_id", user.id).eq("es_preparacion", false).order("nombre");
      setIds((lista || []).map((item) => item.id));
      const { data } = await supabase.from("recipes").select("*").eq("id", id).eq("user_id", user.id).single();
      setRecipe(data);
      const { data: rows } = await supabase.from("recipe_ingredients").select("id, cantidad, unidad, costo, ingredients(nombre)").eq("recipe_id", id);
      setItems(rows || []);
      const { data: parts } = await supabase.from("recipe_components").select("id, cantidad, costo, recipes:component_recipe_id(nombre)").eq("recipe_id", id);
      setPreps(parts || []);
    };
    if (id) load();
  }, [id]);

  if (error) return <div className="text-red-700">{error}</div>;
  if (!recipe) return <div className="text-gray-500">Cargando...</div>;

  const indice = ids.indexOf(id);
  const anterior = indice > 0 ? ids[indice - 1] : "";
  const siguiente = indice >= 0 && indice < ids.length - 1 ? ids[indice + 1] : "";
  const alto = recipe.food_cost > 35;

  return (
    <div className="max-w-3xl">
      {!recipe.es_preparacion && (
        <div className="flex items-center justify-between mb-4">
          <button type="button" disabled={!anterior} onClick={() => router.push("/dashboard/recetas/" + anterior)} className={tecla}>Anterior</button>
          <p className="text-sm text-gray-500">{Math.max(indice + 1, 1)} de {ids.length}</p>
          <button type="button" disabled={!siguiente} onClick={() => router.push("/dashboard/recetas/" + siguiente)} className={tecla}>Siguiente</button>
        </div>
      )}
      <p className="text-sm text-green-700 font-medium">{recipe.es_preparacion ? "Sub-receta" : "Paso 3 de 4"}</p>
      <div className="flex items-center justify-between mt-1 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{recipe.nombre}</h1>
          <p className="text-gray-600">{recipe.porciones} plato(s)</p>
        </div>
        <a href={"/dashboard/recetas/" + recipe.id + "/editar"} className={tecla}>Corregir</a>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 text-sm">
        <p>Te cuesta: <strong>{formatCOP(recipe.costo_porcion)}</strong></p>
        {!recipe.es_preparacion && <p>Lo vendes a: <strong>{recipe.precio_venta ? formatCOP(recipe.precio_venta) : "todavía no tiene precio"}</strong></p>}
        {!recipe.es_preparacion && <p>Food cost: <strong>{recipe.food_cost > 0 ? recipe.food_cost + "%" : "—"}</strong></p>}
        {!recipe.es_preparacion && (
          <p className="text-gray-600 mt-2">{alto ? "Este porcentaje está alto. Puedes subir el precio o bajar un ingrediente caro." : "El food cost es la parte del precio que se va en ingredientes."}</p>
        )}
      </div>
      <div className="bg-white border rounded-xl p-5 mb-6">
        <p className="font-medium mb-3">Lo que lleva</p>
        {items.map((item) => (
          <p key={item.id} className="text-sm py-1">{item.ingredients?.nombre || "Producto"}: {item.cantidad} {item.unidad} · {formatCOP(item.costo)}</p>
        ))}
        {preps.map((item) => (
          <p key={item.id} className="text-sm py-1">{item.recipes?.nombre || "Sub-receta"}: {item.cantidad} porción · {formatCOP(item.costo)}</p>
        ))}
        {recipe.instrucciones && <p className="text-sm text-gray-700 mt-4 whitespace-pre-line">{recipe.instrucciones}</p>}
      </div>
      <a href={"/dashboard/recetario/ficha?id=" + recipe.id + "&tipo=cocina"} className="block bg-green-50 border border-green-200 rounded-xl p-5">
        <p className="text-sm text-green-700">Paso 4</p>
        <p className="font-semibold">¿Lo dejamos listo para la cocina?</p>
        <p className="text-sm text-gray-600 mt-1">La ficha de cocina no lleva precios. La de costos es solo para ti.</p>
        <p className="text-sm text-green-800 mt-2">Ver ficha para cocina</p>
      </a>
    </div>
  );
}