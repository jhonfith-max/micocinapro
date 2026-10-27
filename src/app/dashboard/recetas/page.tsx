"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; precio_venta: number; costo_total: number; categoria: string | null };

export default function RecetasPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, precio_venta, costo_total, categoria").eq("user_id", user.id).eq("es_preparacion", false).order("nombre");
      setRecipes(data || []);
    };
    load();
  }, []);

  const eliminar = async (id: string) => {
    await supabase.from("recipes").delete().eq("id", id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const foodCost = (r: Recipe) => r.precio_venta ? Math.round((r.costo_total / r.precio_venta) * 100) : 0;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Paso 4</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Recetas</h1>
        </div>
        <a href="/dashboard/recetas/nueva" className="px-4 py-2.5 bg-green-800 text-white text-sm rounded-xl">+ Costear</a>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {recipes.map((item) => (
          <div key={item.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 last:border-0 gap-2">
            <div>
              <p className="font-medium">{item.nombre}</p>
              <p className="text-xs text-stone-400">cuesta {formatCOP(item.costo_total)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{formatCOP(item.precio_venta)}</p>
                <p className={"text-xs " + (foodCost(item) > 30 ? "text-red-600" : "text-green-700")}>{foodCost(item)}%</p>
              </div>
              <a href={"/dashboard/recetas/" + item.id} className="text-sm text-stone-500">Ver ficha</a>
              <a href={"/dashboard/recetas/" + item.id + "/editar"} className="text-sm text-green-800">Corregir</a>
              <button onClick={() => eliminar(item.id)} className="text-sm text-stone-400">Quitar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}