"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; precio_venta: number; costo_total: number };

export default function CartaPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [nombre, setNombre] = useState("");
  const [logo, setLogo] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, precio_venta, costo_total").eq("user_id", user.id).eq("es_preparacion", false);
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
    <div className="max-w-3xl mx-auto p-6">
      <style>{`
        @media print {
          aside, nav, header, button { display: none !important; }
          body, main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        }
      `}</style>
      <div className="flex justify-between items-start mb-8">
        <div>
          {logo && <img src={logo} alt="" className="w-16 h-16 object-contain mb-3" />}
          <h1 className="text-3xl font-bold">{nombre || "La carta"}</h1>
          {direccion && <p className="text-sm text-stone-500 mt-1">{direccion}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={compartir} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">Compartir</button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm">Imprimir</button>
        </div>
      </div>
      <div className="space-y-2">
        {recipes.map((r) => (
          <div key={r.id} className="flex justify-between items-center py-3 border-b border-stone-100">
            <div>
              <p className="font-medium">{r.nombre}</p>
              <p className="text-xs text-stone-400">costo {formatCOP(r.costo_total)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{formatCOP(r.precio_venta)}</p>
              <span className={`text-xs ${foodCost(r) > 30 ? "text-red-600" : "text-green-700"}`}>{foodCost(r)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}