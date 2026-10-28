"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; precio_venta: number; costo_total: number; categoria: string | null };

export default function CartaPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, precio_venta, costo_total, categoria").eq("user_id", user.id).eq("es_preparacion", false);
      setRecipes(data || []);
      const { data: profile } = await supabase.from("profiles").select("nombre_restaurante, logo, direccion").eq("id", user.id).single();
      if (profile?.nombre_restaurante) setNombre(profile.nombre_restaurante);
      if (profile?.logo) setLogo(profile.logo);
      if (profile?.direccion) setDireccion(profile.direccion);
    };
    load();
  }, []);

  const foodCost = (r: Recipe) => Math.round((r.costo_total / r.precio_venta) * 100);

  const compartir = async () => {
    if (navigator.share) {
      await navigator.share({ title: nombre || "La carta", url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 print:p-4">
      <div className="flex justify-between items-start mb-6 print:mb-4">
        <div>
          {logo && <img src={logo} alt="" className="w-14 h-14 object-contain mb-2" />}
          <h1 className="text-2xl font-semibold">{nombre || "La carta"}</h1>
          {direccion && <p className="text-sm text-stone-500 mt-1">{direccion}</p>}
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={compartir} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">Compartir</button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">Imprimir</button>
        </div>
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