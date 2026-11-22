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
      const { data } = await supabase
        .from("recipes")
        .select("id, nombre, porciones, costo_porcion")
        .eq("user_id", user.id)
        .eq("es_preparacion", true)
        .order("nombre");
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
          <p className="text-xs uppercase tracking-widest text-[#C45C26]">Paso 3</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Salsas y fondos</h1>
          <p className="text-[#6B6560] mt-1 text-sm">Arma salsas y bases. Su costo se suma solo en el plato.</p>
        </div>
        <a href="/dashboard/subrecetas/nueva" className="px-4 py-2.5 bg-[#C45C26] text-white hover:bg-[#A34B1E] text-sm rounded-xl text-center">+ Nueva</a>
      </div>
      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-[#6B6560] text-sm">Aún no hay subrecetas</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E4DF] last:border-0 gap-2">
              <div>
                <p className="font-medium">{item.nombre}</p>
                <p className="text-xs text-[#6B6560] mt-0.5">alcanza para {item.porciones} {item.porciones === 1 ? "plato" : "platos"}</p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <p className="text-lg font-bold text-[#1C1B19]">{formatCOP(item.costo_porcion)}</p>
                <a href={"/dashboard/subrecetas/" + item.id} className="text-sm font-medium text-[#C45C26]">Corregir</a>
                <button onClick={() => eliminar(item.id)} className="text-sm font-medium text-[#C45C26]">Quitar</button>
              </div>
            </div>
          ))
        )}
      </div>
      <a href="/dashboard/recetas/nueva" className="block mt-6 bg-[#F6F4F1] border border-[#E8E4DF] rounded-2xl p-5">
        <p className="text-sm text-[#C45C26]">Siguiente</p>
        <p className="font-medium">Ya puedes costear el plato.</p>
      </a>
    </div>
  );
}