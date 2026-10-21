"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditarIngredientePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("kg");
  const [cantidad, setCantidad] = useState("1");
  const [precio, setPrecio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("ingredients").select("*").eq("id", id).single();
      if (data) {
        setNombre(data.nombre);
        setUnidad(data.unidad_compra);
        setCantidad(String(data.cantidad_compra));
        setPrecio(String(data.precio_compra || data.precio_por_unidad));
      }
    };
    if (id) load();
  }, [id]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const qty = parseFloat(cantidad) || 1;
    const price = parseFloat(precio) || 0;
    const { error: updateError } = await supabase.from("ingredients").update({
      nombre: nombre.trim().toLowerCase(),
      unidad_compra: unidad,
      cantidad_compra: qty,
      precio_compra: price,
      precio_por_unidad: Math.round(price / qty),
    }).eq("id", id);
    if (updateError) { setError(updateError.message); setLoading(false); return; }
    router.push("/dashboard/ingredientes");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Corregir producto</h1>
      <form onSubmit={guardar} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cómo se llama?</label>
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿En qué lo compras?</label>
          <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl">
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="litro">litro</option>
            <option value="ml">ml</option>
            <option value="unidad">unidad</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cuánto trae la presentación?</label>
          <input required type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cuánto pagas?</label>
          <input required type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full sm:w-auto px-6 py-3.5 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar"}</button>
      </form>
    </div>
  );
}