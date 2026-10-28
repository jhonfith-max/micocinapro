"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; costo_total: number; categoria: string | null };

export default function MenusPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [entrada, setEntrada] = useState("");
  const [fuerte, setFuerte] = useState("");
  const [guarnicion, setGuarnicion] = useState("");
  const [postre, setPostre] = useState("");
  const [bebida, setBebida] = useState("");
  const [precio, setPrecio] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, costo_total, categoria").eq("user_id", user.id).eq("es_preparacion", false);
      setRecipes(data || []);
    };
    load();
  }, []);

  const costo = (id: string) => recipes.find((r) => r.id === id)?.costo_total || 0;
  const costoBase = costo(entrada) + costo(fuerte) + costo(guarnicion) + costo(postre) + costo(bebida);
  const contingencia = Math.round(costoBase * 0.07);
  const costoTotal = costoBase + contingencia;
  const foodCost = precio ? Math.round((costoTotal / parseFloat(precio)) * 100) : 0;
  const precioRecomendado = Math.round(costoTotal / 0.32);

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-green-800">Si haces almuerzos</p>
      <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Corporativo</h1>
      <p className="text-stone-500 mt-1 text-sm">Entrada, fuerte y bebida. Un solo precio.</p>
      <a href="/dashboard/recetas/nueva" className="inline-block mt-4 px-4 py-2 bg-green-800 text-white text-sm rounded-xl">+ Crear receta</a>
      <div className="mt-6 space-y-4">
        {[
          { label: "1. Entrada o sopa", value: entrada, set: setEntrada },
          { label: "2. Plato fuerte", value: fuerte, set: setFuerte },
          { label: "3. Guarnición (opcional)", value: guarnicion, set: setGuarnicion },
          { label: "4. Postre (opcional)", value: postre, set: setPostre },
          { label: "5. Bebida", value: bebida, set: setBebida },
        ].map((step) => (
          <div key={step.label} className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-2">{step.label}</p>
            <select value={step.value} onChange={(e) => step.set(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm bg-white cursor-pointer">
              <option value="">Elegir</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre} · {formatCOP(r.costo_total)}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <p className="font-medium mb-2">Precio del menú</p>
          <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="35000" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        {costoTotal > 0 && (
          <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Costo de platos</span><span>{formatCOP(Math.round(costoBase))}</span></div>
            <div className="flex justify-between"><span>Contingencia 7%</span><span>{formatCOP(contingencia)}</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-2"><span>Costo total</span><span className="font-medium">{formatCOP(costoTotal)}</span></div>
            <div className="flex justify-between"><span>Precio recomendado (32%)</span><span className="font-semibold">{formatCOP(precioRecomendado)}</span></div>
            {precio && <div className="flex justify-between"><span>Food cost</span><span className={foodCost > 32 ? "text-red-600" : "text-green-700"}>{foodCost}%</span></div>}
          </div>
        )}
      </div>
    </div>
  );
}