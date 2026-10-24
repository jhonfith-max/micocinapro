"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type YieldTest = {
  id: string;
  ingredient_id: string;
  peso_inicial: number;
  peso_final: number;
  porcentaje_rendimiento: number;
  notas: string | null;
  ingredients: { nombre: string } | null;
};

export default function RendimientosPage() {
  const router = useRouter();
  const [tests, setTests] = useState<YieldTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("yield_tests")
        .select("id, ingredient_id, peso_inicial, peso_final, porcentaje_rendimiento, notas, ingredients(nombre)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTests(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400">Paso 2</p>
          <h1 className="text-2xl sm:text-3xl font-semibold">Lo que se usa</h1>
          <p className="text-stone-500 text-sm mt-1">Pesa lo que llega y lo que queda.</p>
        </div>
        <button onClick={() => router.push("/dashboard/rendimientos/nueva")} className="px-4 py-2.5 bg-green-800 text-white rounded-xl text-sm">
          + Nueva prueba
        </button>
      </div>
      {loading && <p className="text-stone-400">Cargando...</p>}
      {!loading && tests.length === 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center">
          <p className="text-stone-500">Aún no hay pruebas.</p>
        </div>
      )}
      <div className="space-y-3">
        {tests.map((t) => (
          <button
            key={t.id}
            onClick={() => router.push(`/dashboard/rendimientos/${t.id}`)}
            className="w-full bg-white border border-stone-200 rounded-2xl p-5 text-left hover:border-stone-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.ingredients?.nombre || "Producto"}{t.notas ? ` · ${t.notas}` : ""}</p>
                <p className="text-sm text-stone-500 mt-1">De {t.peso_inicial} g quedan {t.peso_final} g en el plato.</p>
              </div>
              <p className="text-2xl font-semibold">{t.porcentaje_rendimiento}%</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}