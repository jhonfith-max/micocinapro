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
    <div className="max-w-2xl mx-auto">
      <style>{`
        @media print {
          aside, nav, header, button { display: none !important; }
          body, html { margin: 0 !important; }
          main { width: 100% !important; margin: 0 !important; padding: 16px !important; }
        }
      `}</style>
      <div className="text-center mb-8">
        {logo && <img src={logo} alt="" className="w-16 h-16 object-contain mx-auto mb-3 print:w-12 print:h-12" />}
        <h1 className="text-2xl font-semibold">{nombre || "La carta"}</h1>
        {direccion && <p className="text-sm text-stone-400 mt-1">{direccion}</p>}
      </div>
      <div className="flex justify-center gap-2 mb-8">
        <button onClick={compartir} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-full">Compartir</button>
        <button onClick={() => window.print()} className="px-4 py-2 text-sm text-stone-600 border border-stone-200 rounded-full">Imprimir</button>
      </div>
      <div className="space-y-0">
        {recipes.map((r) => (
          <a href={"/dashboard/recetas/" + r.id} key={r.id} className="flex justify-between items-center py-4 border-b border-stone-100 hover:bg-stone-50 px-2">
            <div>
              <p className="font-medium">{r.nombre}</p>
              <p className="text-xs text-stone-400">{formatCOP(r.costo_total)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCOP(r.precio_venta)}</p>
              <span className={`text-xs ${foodCost(r) > 30 ? "text-red-500" : "text-green-600"}`}>{foodCost(r)}%</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}