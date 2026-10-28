"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; precio_venta: number; costo_total: number; categoria: string | null };

export default function CartaPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, precio_venta, costo_total, categoria").eq("user_id", user.id).eq("es_preparacion", false);
      setRecipes(data || []);
    };
    load();
  }, []);

  const foodCost = (r: Recipe) => Math.round((r.costo_total / r.precio_venta) * 100);

  return (
    <div className="max-w-3xl mx-auto p-6 print:p-0 print:text-sm">
      <div className="flex justify-between items-center mb-6 print:mb-4">
        <h1 className="text-2xl font-semibold print:text-lg">La carta</h1>
        <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm print:hidden">Imprimir</button>
      </div>
      <div className="space-y-3 print:space-y-2">
        {recipes.map((r) => (
          <div key={r.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex justify-between items-center print:border-stone-100 print:p-2">
            <div>
              <p className="font-medium">{r.nombre}</p>
              <p className="text-xs text-stone-400">cuesta {formatCOP(r.costo_total)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCOP(r.precio_venta)}</p>
              <span className={`text-xs ${foodCost(r) > 30 ? "text-red-600" : "text-green-700"}`}>{foodCost(r)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}