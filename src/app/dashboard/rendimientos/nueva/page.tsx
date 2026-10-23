"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Ingredient = { id: string; nombre: string };

export default function NuevaPruebaPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientId, setIngredientId] = useState("");
  const [pesoCompra, setPesoCompra] = useState("");
  const [pesoLimpio, setPesoLimpio] = useState("");
  const [cocina, setCocina] = useState(false);
  const [pesoCocido, setPesoCocido] = useState("");
  const [mermaUtil, setMermaUtil] = useState(false);
  const [nombreMerma, setNombreMerma] = useState("");
  const [gramosMerma, setGramosMerma] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("ingredients").select("id, nombre").eq("user_id", user.id).order("nombre");
      setIngredients(data || []);
    };
    load();
  }, []);

  const pesoFinal = cocina ? parseFloat(pesoCocido || "0") : parseFloat(pesoLimpio || "0");
  const rendimiento = parseFloat(pesoCompra) > 0 ? Math.round((pesoFinal / parseFloat(pesoCompra)) * 100) : 0;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ingredientId) return;

    const { data: existing } = await supabase
      .from("yield_tests")
      .select("id")
      .eq("user_id", user.id)
      .eq("ingredient_id", ingredientId)
      .maybeSingle();

    if (existing) {
      setError("Este producto ya tiene una prueba. Edítala en la lista.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("yield_tests").insert({
      user_id: user.id,
      ingredient_id: ingredientId,
      tipo: cocina ? "coccion" : "limpieza",
      peso_inicial: parseFloat(pesoCompra),
      peso_final: pesoFinal,
      porcentaje_rendimiento: rendimiento,
      porcentaje_merma: 100 - rendimiento,
      merma_aprovechable: mermaUtil ? parseFloat(gramosMerma || "0") : 0,
      uso_merma: mermaUtil ? nombreMerma : null,
    });

    if (insertError) { setError(insertError.message); setLoading(false); return; }
    router.push("/dashboard/rendimientos");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Nueva prueba</h1>
      <form onSubmit={guardar} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Qué producto pesas?</label>
          <select required value={ingredientId} onChange={(e) => setIngredientId(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl">
            <option value="">Elegir</option>
            {ingredients.map((ing) => <option key={ing.id} value={ing.id}>{ing.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cuántos gramos compraste?</label>
          <input required type="number" value={pesoCompra} onChange={(e) => setPesoCompra(e.target.value)} placeholder="1000" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cuántos gramos quedan después de limpiar?</label>
          <input required type="number" value={pesoLimpio} onChange={(e) => setPesoLimpio(e.target.value)} placeholder="700" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="cocina" checked={cocina} onChange={(e) => setCocina(e.target.checked)} />
          <label htmlFor="cocina" className="text-sm">¿Lo cocinas antes de usar?</label>
        </div>
        {cocina && (
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿Cuántos gramos quedan después de cocinar?</label>
            <input required type="number" value={pesoCocido} onChange={(e) => setPesoCocido(e.target.value)} placeholder="600" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="merma" checked={mermaUtil} onChange={(e) => setMermaUtil(e.target.checked)} />
          <label htmlFor="merma" className="text-sm">¿Hay merma útil? (hueso, piel, etc.)</label>
        </div>
        {mermaUtil && (
          <>
            <div>
              <label className="block text-sm text-stone-600 mb-1">Nombre de la merma</label>
              <input required value={nombreMerma} onChange={(e) => setNombreMerma(e.target.value)} placeholder="Hueso de res" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm text-stone-600 mb-1">¿Cuántos gramos de merma útil?</label>
              <input required type="number" value={gramosMerma} onChange={(e) => setGramosMerma(e.target.value)} placeholder="150" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
            </div>
          </>
        )}
        {rendimiento > 0 && <p className="text-sm">Queda el <span className="font-semibold">{rendimiento}%</span></p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full sm:w-auto px-6 py-3.5 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar"}</button>
      </form>
    </div>
  );
}