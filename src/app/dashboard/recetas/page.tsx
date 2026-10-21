"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; categoria: string | null; costo_porcion: number; precio_venta: number | null; food_cost: number };

const BARRA = ["jugos", "cerveza", "coctel", "vino"];

function fcReal(item: Recipe) {
  if (!item.precio_venta || !item.costo_porcion) return 0;
  return Math.round((item.costo_porcion / (item.precio_venta / 1.08)) * 100);
}
function color(fc: number) {
  if (!fc) return "text-stone-400";
  if (fc <= 30) return "text-green-700";
  if (fc <= 35) return "text-yellow-600";
  return "text-red-600";
}

function Lista({ items, onDelete }: { items: Recipe[]; onDelete: (id: string) => void }) {
  if (items.length === 0) return <p className="text-sm text-stone-400 px-1 py-6">Todavía no hay nada aquí.</p>;
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {items.map((item) => {
        const fc = fcReal(item);
        return (
          <div key={item.id} className="px-5 py-4 flex items-center justify-between border-b border-stone-100 last:border-0">
            <div>
              <p className="font-medium">{item.nombre}</p>
              <p className="text-xs text-stone-400 mt-0.5">cuesta {formatCOP(item.costo_porcion)}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-semibold">{item.precio_venta ? formatCOP(item.precio_venta) : "sin precio"}</p>
                <p className={"text-sm " + color(fc)}>{fc ? fc + "%" : "—"}</p>
              </div>
              <a href={"/dashboard/recetas/" + item.id + "/editar"} className="text-sm text-green-800">Corregir</a>
              <button onClick={() => onDelete(item.id)} className="text-sm text-stone-400">Quitar</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RecetasPage() {
  const [items, setItems] = useState<Recipe[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, categoria, costo_porcion, precio_venta, food_cost").eq("user_id", user.id).eq("es_preparacion", false).order("nombre");
      setItems(data || []);
    };
    load();
  }, []);
  const eliminar = async (id: string) => {
    await supabase.from("recipes").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  const cocina = items.filter((item) => !BARRA.includes(item.categoria || ""));
  const barra = items.filter((item) => BARRA.includes(item.categoria || ""));

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Paso 4</p>
          <h1 className="text-3xl font-semibold mt-1">Recetas</h1>
          <p className="text-stone-500 mt-1">Cocina y barra. El porcentaje ya descuenta el 8%.</p>
        </div>
        <a href="/dashboard/recetas/nueva" className="px-4 py-2.5 bg-green-800 text-white text-sm rounded-xl">+ Costear</a>
      </div>
      <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-2">Cocina</h2>
      <div className="mb-8"><Lista items={cocina} onDelete={eliminar} /></div>
      <h2 className="text-sm uppercase tracking-widest text-stone-400 mb-2">Barra</h2>
      <Lista items={barra} onDelete={eliminar} />
    </div>
  );
}