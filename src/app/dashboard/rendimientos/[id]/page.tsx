"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DetallePruebaPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const [nombre, setNombre] = useState("");
  const [pesoCompra, setPesoCompra] = useState("");
  const [pesoLimpio, setPesoLimpio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("yield_tests").select("*, ingredients(nombre)").eq("id", id).single();
      if (data) {
        setNombre((data.ingredients as { nombre?: string } | null)?.nombre || "Producto");
        setPesoCompra(String(data.peso_compra || data.peso_inicial || ""));
        setPesoLimpio(String(data.peso_limpio || data.peso_util || ""));
      }
    };
    if (id) load();
  }, [id]);

  const rendimiento = parseFloat(pesoCompra) > 0 ? Math.round((parseFloat(pesoLimpio || "0") / parseFloat(pesoCompra)) * 100) : 0;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("yield_tests").update({
      peso_compra: parseFloat(pesoCompra),
      peso_limpio: parseFloat(pesoLimpio),
      porcentaje_rendimiento: rendimiento,
    }).eq("id", id);
    router.push("/dashboard/rendimientos");
  };

  const eliminar = async () => {
    await supabase.from("yield_tests").delete().eq("id", id);
    router.push("/dashboard/rendimientos");
  };

  return (
    <div className="max-w-xl">
      <p className="text-xs uppercase tracking-widest text-green-800">Prueba</p>
      <h1 className="text-2xl sm:text-3xl font-semibold mt-1 mb-6 capitalize">{nombre}</h1>
      <form onSubmit={guardar} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cuántos gramos compraste?</label>
          <input required type="number" value={pesoCompra} onChange={(e) => setPesoCompra(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cuántos gramos quedan para el plato?</label>
          <input required type="number" value={pesoLimpio} onChange={(e) => setPesoLimpio(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        {rendimiento > 0 && <p className="text-sm">Queda el <span className="font-semibold">{rendimiento}%</span></p>}
        <div className="flex flex-col sm:flex-row gap-2">
          <button disabled={loading} className="px-6 py-3.5 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar"}</button>
          <button type="button" onClick={eliminar} className="px-6 py-3.5 border border-stone-200 rounded-xl text-stone-500">Eliminar</button>
        </div>
      </form>
    </div>
  );
}