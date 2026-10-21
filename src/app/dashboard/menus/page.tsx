"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Plato = { id: string; nombre: string; categoria: string; costo_porcion: number; precio_venta: number | null };

const PASOS = [
  { id: "entrada", numero: "1", nombre: "Entrada o sopa", categorias: ["entradas"], obligatorio: true },
  { id: "fuerte", numero: "2", nombre: "Plato fuerte", categorias: ["fuertes"], obligatorio: true },
  { id: "guarnicion", numero: "3", nombre: "Guarnición", categorias: ["guarniciones", "acompanamientos"], obligatorio: false },
  { id: "postre", numero: "4", nombre: "Postre", categorias: ["postres"], obligatorio: false },
  { id: "bebida", numero: "5", nombre: "Bebida", categorias: ["jugos", "cerveza", "coctel", "vino"], obligatorio: true },
];

export default function MenusPage() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [elegidos, setElegidos] = useState<Record<string, string>>({});
  const [cafe, setCafe] = useState("");
  const [precio, setPrecio] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, categoria, costo_porcion, precio_venta").eq("user_id", user.id).eq("es_preparacion", false).order("nombre");
      setPlatos(data || []);
    };
    load();
  }, []);

  const seleccionados = PASOS.map((paso) => platos.find((p) => p.id === elegidos[paso.id])).filter(Boolean) as Plato[];
  const costo = seleccionados.reduce((s, p) => s + p.costo_porcion, 0);
  const venta = parseFloat(precio) || 0;
  const foodCost = venta > 0 ? Math.round((costo / (venta / 1.08)) * 100) : 0;
  const sugerido = costo > 0 ? Math.ceil(costo / 0.32 / 1.08 / 1000) * 1000 : 0;

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-green-800">Si haces almuerzos</p>
      <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Corporativo</h1>
      <p className="text-stone-500 mt-1 mb-8 text-sm">Entrada, fuerte y bebida. Un solo precio.</p>
      <div className="space-y-3">
        {PASOS.map((paso) => {
          const opciones = platos.filter((p) => paso.categorias.includes(p.categoria));
          return (
            <div key={paso.id} className={"bg-white border rounded-2xl p-4 sm:p-5 " + (elegidos[paso.id] ? "border-green-200 bg-green-50/40" : "border-stone-200")}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-green-800 text-white text-sm flex items-center justify-center shrink-0">{paso.numero}</span>
                <div>
                  <p className="font-medium">{paso.nombre}</p>
                  {!paso.obligatorio && <p className="text-xs text-stone-400">Opcional</p>}
                </div>
              </div>
              <select value={elegidos[paso.id] || ""} onChange={(e) => setElegidos({ ...elegidos, [paso.id]: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white">
                <option value="">Elegir</option>
                {opciones.map((p) => <option key={p.id} value={p.id}>{p.nombre} · {formatCOP(p.costo_porcion)}</option>)}
              </select>
            </div>
          );
        })}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5">
          <label className="block text-sm text-stone-600 mb-1">Café, si lo incluyes</label>
          <input value={cafe} onChange={(e) => setCafe(e.target.value)} placeholder="Opcional" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6">
          <p className="text-sm text-stone-400">Cuesta</p>
          <p className="text-2xl font-semibold">{formatCOP(costo)}</p>
          <div className="mt-4">
            <label className="block text-sm text-stone-400 mb-1">¿A cuánto lo vendes?</label>
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full px-4 py-3 rounded-xl text-stone-900" />
          </div>
          {venta > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
              <span>Food cost {foodCost}%</span>
              <span>Sugerido {formatCOP(sugerido)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}