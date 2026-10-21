"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Test = { id: string; nombre: string; peso_compra: number; peso_limpio: number; porcentaje_rendimiento: number };

export default function RendimientosPage() {
  const [items, setItems] = useState<Test[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: tests, error: testError } = await supabase.from("yield_tests").select("*").eq("user_id", user.id);
      if (testError) { setError(testError.message); return; }
      const { data: ings } = await supabase.from("ingredients").select("id, nombre").eq("user_id", user.id);
      const nombres: Record<string, string> = {};
      (ings || []).forEach((ing) => { nombres[ing.id] = ing.nombre; });
      setItems((tests || []).map((t) => ({
        id: t.id,
        nombre: nombres[t.ingredient_id] || "Producto",
        peso_compra: t.peso_compra || t.peso_inicial || 0,
        peso_limpio: t.peso_limpio || t.peso_util || 0,
        porcentaje_rendimiento: t.porcentaje_rendimiento || 0,
      })));
    };
    load();
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Paso 2</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Lo que se usa</h1>
          <p className="text-stone-500 mt-1 text-sm">Pesa lo que llega y lo que queda.</p>
        </div>
        <a href="/dashboard/rendimientos/nueva" className="px-4 py-2.5 bg-green-800 text-white text-sm rounded-xl text-center">+ Nueva prueba</a>
      </div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {items.length === 0 && !error && <p className="text-stone-400">Todavía no hay pruebas.</p>}
      <div className="space-y-3">
        {items.map((item) => (
          <a key={item.id} href={"/dashboard/rendimientos/" + item.id} className="block bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-medium capitalize">{item.nombre}</p>
              <p className="text-2xl font-semibold">{item.porcentaje_rendimiento}%</p>
            </div>
            <p className="text-sm text-stone-500 mt-1">De {item.peso_compra} g quedan {item.peso_limpio} g en el plato.</p>
          </a>
        ))}
      </div>
    </div>
  );
}