"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Receta = { id: string; nombre: string; porciones: number; costo_porcion: number; precio_venta: number | null };

export default function RecetasPage() {
  const [items, setItems] = useState<Receta[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("recipes")
        .select("id, nombre, porciones, costo_porcion, precio_venta")
        .eq("user_id", user.id)
        .eq("es_preparacion", false)
        .order("nombre");
      setItems(data || []);
    };
    load();
  }, []);

  const eliminar = async (id: string) => {
    await supabase.from("recipes").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const foodCost = (r: Receta) => r.precio_venta && r.costo_porcion ? Math.round((r.costo_porcion / r.precio_venta) * 100) : 0;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Paso 4</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Platos</h1>
          <p className="text-stone-500 mt-1 text-sm">Costea cada plato de la carta.</p>
        </div>
        <a href="/dashboard/recetas/nueva" className="px-4 py-2.5 bg-green-800 text-white text-sm rounded-xl text-center">+ Nueva</a>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">Aún no hay platos</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 last:border-0 gap-2">
              <div>
                <p className="font-medium">{item.nombre}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {item.porciones} {item.porciones === 1 ? "porción" : "porciones"}
                  {item.precio_venta ? ` · Food cost ${foodCost(item)}%` : ""}
                </p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <p className="font-semibold">{formatCOP(item.costo_porcion)}</p>
                <a href={"/dashboard/recetas/" + item.id + "/editar"} className="text-sm text-green-800">Corregir</a>
                <button onClick={() => eliminar(item.id)} className="text-sm text-stone-400">Quitar</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}