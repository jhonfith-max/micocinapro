"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; precio_venta: number; costo_total: number; category_id: string | null };

export default function CartaPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, precio_venta, costo_total, category_id").eq("user_id", user.id).eq("es_preparacion", false).order("nombre");
      setRecipes(data || []);
    };
    load();
  }, []);

  const foodCost = (r: Recipe) => r.precio_venta ? Math.round((r.costo_total / r.precio_venta) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">La carta</h1>
        <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">Imprimir</button>
      </div>
      <div className="space-y-4">
        {recipes.map((r) => (
          <div key={r.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{r.nombre}</p>
              <p className="text-xs text-stone-400">cuesta {formatCOP(r.costo_total)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{formatCOP(r.precio_venta)}</p>
              <p className={"text-sm " + (foodCost(r) > 30 ? "text-red-600" : "text-green-700")}>{foodCost(r)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}