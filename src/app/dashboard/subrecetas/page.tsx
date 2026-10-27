"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Sub = { id: string; nombre: string; porciones: number; costo_porcion: number };

export default function SubrecetasPage() {
  const [items, setItems] = useState<Sub[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, porciones, costo_porcion").eq("user_id", user.id).eq("es_preparacion", true).order("nombre");
      setItems(data || []);
    };
    load();
  }, []);
  const eliminar = async (id: string) => {
    await supabase.from("recipes").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Paso 3</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Salsas y fondos</h1>
          <p className="text-stone-500 mt-1 text-sm">Se arman una vez. Se suman solas en el plato.</p>
        </div>
        <a href="/dashboard/subrecetas/nueva" className="px-4 py-2.5 bg-green-800 text-white text-sm rounded-xl text-center">+ Nueva</a>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {items.map((item) => (
          <div key={item.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 last:border-0 gap-2">
            <div>
              <p className="font-medium">{item.nombre}</p>
              <p className="text-xs text-stone-400 mt-0.5">alcanza para {item.porciones} {item.porciones === 1 ? "plato" : "platos"}</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <p className="font-semibold">{formatCOP(item.costo_porcion)}</p>
              <a href={"/dashboard/subrecetas/" + item.id} className="text-sm text-green-800">Corregir</a>
              <button onClick={() => eliminar(item.id)} className="text-sm text-stone-400">Quitar</button>
            </div>
          </div>
        ))}
      </div>
      <a href="/dashboard/recetas/nueva" className="block mt-6 bg-green-50 border border-green-100 rounded-2xl p-5">
        <p className="text-sm text-green-800">Siguiente</p>
        <p className="font-medium">Ya puedes costear el plato.</p>
      </a>
    </div>
  );
}