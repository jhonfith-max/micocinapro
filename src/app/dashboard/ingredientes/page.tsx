"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number; unidad_compra: string; cantidad_compra: number };

function gramo(ing: Ingredient, rendimiento: number) {
  const base = ing.unidad_compra.toLowerCase();
  let precio = ing.precio_por_unidad;
  if (base === "kg") precio = ing.precio_por_unidad / 1000;
  if (base === "litro" || base === "l") precio = ing.precio_por_unidad / 1000;
  const con = rendimiento > 0 && rendimiento < 100 ? precio / (rendimiento / 100) : 0;
  return { sin: Math.round(precio), con: Math.round(con) };
}

export default function IngredientesPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [rendimientos, setRendimientos] = useState<Record<string, number>>({});
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("ingredients").select("*").eq("user_id", user.id).order("nombre");
      setItems(data || []);
      const { data: tests } = await supabase.from("yield_tests").select("ingredient_id, porcentaje_rendimiento").eq("user_id", user.id);
      const mapa: Record<string, number> = {};
      (tests || []).forEach((t) => { if (t.porcentaje_rendimiento) mapa[t.ingredient_id] = t.porcentaje_rendimiento; });
      setRendimientos(mapa);
    };
    load();
  }, []);

  const eliminar = async (id: string) => {
    await supabase.from("ingredients").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const actualizar = async () => {
    setActualizando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: ings } = await supabase.from("ingredients").select("*").eq("user_id", user.id);
    const { data: tests } = await supabase.from("yield_tests").select("ingredient_id, porcentaje_rendimiento").eq("user_id", user.id);
    const mapa: Record<string, number> = {};
    (tests || []).forEach((t) => { if (t.porcentaje_rendimiento) mapa[t.ingredient_id] = t.porcentaje_rendimiento; });
    const porId: Record<string, Ingredient> = {};
    (ings || []).forEach((i) => { porId[i.id] = i; });
    const { data: lineas } = await supabase.from("recipe_ingredients").select("id, recipe_id, ingredient_id, cantidad, unidad");
    for (const linea of lineas || []) {
      const ing = porId[linea.ingredient_id];
      if (!ing) continue;
      const base = ing.unidad_compra.toLowerCase();
      let precio = ing.precio_por_unidad;
      if (linea.unidad === "g" && base === "kg") precio = ing.precio_por_unidad / 1000;
      if (linea.unidad === "ml" && (base === "litro" || base === "l")) precio = ing.precio_por_unidad / 1000;
      const r = mapa[ing.id] || 100;
      if (r > 0 && r < 100 && (linea.unidad === "g" || linea.unidad === "ml")) precio = precio / (r / 100);
      await supabase.from("recipe_ingredients").update({ costo: Math.round(linea.cantidad * precio) }).eq("id", linea.id);
    }
    const { data: recetas } = await supabase.from("recipes").select("id, porciones, precio_venta").eq("user_id", user.id);
    for (const receta of recetas || []) {
      const { data: sus } = await supabase.from("recipe_ingredients").select("costo").eq("recipe_id", receta.id);
      const { data: comps } = await supabase.from("recipe_components").select("costo").eq("recipe_id", receta.id);
      const total = (sus || []).reduce((s, r) => s + r.costo, 0) + (comps || []).reduce((s, r) => s + r.costo, 0);
      const n = receta.porciones || 1;
      const venta = receta.precio_venta || 0;
      await supabase.from("recipes").update({
        costo_total: Math.round(total),
        costo_porcion: Math.round(total / n),
        food_cost: venta > 0 ? Math.round(((total / n) / (venta / 1.08)) * 100) : 0,
      }).eq("id", receta.id);
    }
    setActualizando(false);
    alert("Costos actualizados.");
  };

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Paso 1</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Lo que compras</h1>
          <p className="text-stone-500 mt-1 text-sm">Cuánto cuesta cada gramo.</p>
        </div>
        <a href="/dashboard/ingredientes/nuevo" className="px-4 py-2.5 bg-green-800 text-white text-sm rounded-xl text-center">+ Agregar</a>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <a href="/dashboard/ingredientes/plantilla" className="px-4 py-2 border border-stone-200 rounded-xl text-sm">Bajar plantilla</a>
        <a href="/dashboard/ingredientes/subir" className="px-4 py-2 border border-stone-200 rounded-xl text-sm">Subir datos</a>
        <button onClick={actualizar} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">{actualizando ? "Actualizando..." : "Actualizar costos"}</button>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {items.map((ing) => {
          const g = gramo(ing, rendimientos[ing.id] || 0);
          return (
            <div key={ing.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 last:border-0 gap-2">
              <div>
                <p className="font-medium capitalize">{ing.nombre}</p>
                <p className="text-xs text-stone-400 mt-0.5">Compras {ing.cantidad_compra} {ing.unidad_compra} por {formatCOP(ing.precio_por_unidad)}</p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="sm:text-right">
                  <p className="font-semibold">{formatCOP(g.sin)} <span className="font-normal text-stone-500 text-sm">cada gramo</span></p>
                  <p className="text-sm text-stone-500">{g.con ? formatCOP(g.con) + " cada gramo útil" : "Todavía no lo pesaste"}</p>
                </div>
                <a href={"/dashboard/ingredientes/" + ing.id + "/editar"} className="text-sm text-green-800">Corregir</a>
                <button onClick={() => eliminar(ing.id)} className="text-sm text-stone-400">Quitar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}