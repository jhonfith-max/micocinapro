"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number; unidad_compra: string };
type Row = { ingredient_id: string; nombre: string; cantidad: number; unidad: string; costo: number };

function costoIngrediente(ing: Ingredient, cantidad: number, unidad: string) {
  const base = ing.unidad_compra.toLowerCase();
  let precio = ing.precio_por_unidad;
  if (unidad === "g" && base === "kg") precio = ing.precio_por_unidad / 1000;
  if (unidad === "ml" && (base === "litro" || base === "l")) precio = ing.precio_por_unidad / 1000;
  return Math.round(cantidad * precio);
}

export default function NuevaSubPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [porciones, setPorciones] = useState("1");
  const [rows, setRows] = useState<Row[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selected, setSelected] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("ingredients").select("id, nombre, precio_por_unidad, unidad_compra").eq("user_id", user.id).order("nombre");
      setIngredients(data || []);
    };
    load();
  }, []);

  const agregar = () => {
    const ing = ingredients.find((i) => i.id === selected);
    const qty = parseFloat(cantidad);
    if (!ing || !qty) return;
    setRows((prev) => [...prev, { ingredient_id: ing.id, nombre: ing.nombre, cantidad: qty, unidad, costo: costoIngrediente(ing, qty, unidad) }]);
    setSelected("");
    setCantidad("");
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const costoTotal = rows.reduce((s, r) => s + r.costo, 0);
    const n = parseFloat(porciones) || 1;
    const { data, error: insertError } = await supabase.from("recipes").insert({
      user_id: user.id,
      nombre: nombre.trim(),
      porciones: n,
      costo_total: Math.round(costoTotal),
      costo_porcion: Math.round(costoTotal / n),
      es_preparacion: true,
    }).select().single();
    if (insertError || !data) { setError(insertError?.message || "No se guardó"); setLoading(false); return; }
    if (rows.length) await supabase.from("recipe_ingredients").insert(rows.map((r) => ({ recipe_id: data.id, ingredient_id: r.ingredient_id, cantidad: r.cantidad, unidad: r.unidad, tipo_uso: "crudo", costo: r.costo })));
    router.push("/dashboard/subrecetas");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Nueva sub-receta</h1>
      <form onSubmit={guardar} className="space-y-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿Cómo se llama?</label>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿Para cuántos platos alcanza?</label>
            <input required type="number" min="1" value={porciones} onChange={(e) => setPorciones(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-3">
          <p className="font-medium">Qué lleva</p>
          {rows.map((row, i) => (
            <div key={i} className="flex justify-between text-sm"><span>{row.nombre}: {row.cantidad} {row.unidad}</span><span>{formatCOP(row.costo)}</span></div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="px-3 py-3 border border-stone-200 rounded-xl">
              <option value="">Agregar</option>
              {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.nombre}</option>)}
            </select>
            <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Cantidad" className="px-3 py-3 border border-stone-200 rounded-xl" />
            <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className="px-3 py-3 border border-stone-200 rounded-xl"><option value="g">g</option><option value="ml">ml</option><option value="unidad">unidad</option></select>
            <button type="button" onClick={agregar} className="px-3 py-3 border border-stone-200 rounded-xl">Agregar</button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full sm:w-auto px-6 py-3.5 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar"}</button>
      </form>
    </div>
  );
}