"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Parte = { nombre: string; gramos: string; se_usa: boolean; momento: "limpieza" | "porcion" };

export default function EditarPruebaPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const [producto, setProducto] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  const [pesoInicial, setPesoInicial] = useState("");
  const [pesoCorte, setPesoCorte] = useState("");
  const [coccion, setCoccion] = useState<"crudo" | "cocido">("crudo");
  const [pesoCocido, setPesoCocido] = useState("");
  const [pesoPorcion, setPesoPorcion] = useState("");
  const [partes, setPartes] = useState<Parte[]>([]);
  const [error, setError] = useState<string | null>(null);
  const tecla = "px-5 py-2.5 bg-green-700 text-white rounded-lg shadow-[0_4px_0_0_#166534] active:translate-y-1 active:shadow-none transition-all";
  const teclaSuave = "px-4 py-2.5 border border-gray-300 rounded-lg shadow-[0_4px_0_0_#d1d5db] active:translate-y-1 active:shadow-none transition-all disabled:opacity-40";

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: lista } = await supabase.from("yield_tests").select("id").eq("user_id", user.id).order("created_at");
      setIds((lista || []).map((item) => item.id));
      const { data } = await supabase.from("yield_tests").select("*").eq("id", id).single();
      if (data) {
        setPesoInicial(String(data.peso_inicial || ""));
        setPesoCorte(String(data.peso_final || ""));
        setCoccion(data.tipo === "cocido" ? "cocido" : "crudo");
        setPesoCocido(data.peso_cocido ? String(data.peso_cocido) : "");
        setPesoPorcion(data.peso_porcion ? String(data.peso_porcion) : "");
        if (data.ingredient_id) {
          const { data: ing } = await supabase.from("ingredients").select("nombre").eq("id", data.ingredient_id).single();
          setProducto(ing?.nombre || "Producto");
        }
      }
      const { data: parts } = await supabase.from("merma_parts").select("*").eq("yield_test_id", id);
      setPartes((parts || []).map((p) => ({
        nombre: p.nombre,
        gramos: String(p.gramos),
        se_usa: p.se_usa,
        momento: p.momento === "porcion" ? "porcion" : "limpieza",
      })));
    };
    if (id) load();
  }, [id]);

  const indice = ids.indexOf(id);
  const anterior = indice > 0 ? ids[indice - 1] : "";
  const siguiente = indice >= 0 && indice < ids.length - 1 ? ids[indice + 1] : "";
  const inicial = Number(pesoInicial) || 0;
  const corte = Number(pesoCorte) || 0;
  const cocido = Number(pesoCocido) || 0;
  const porcion = Number(pesoPorcion) || 0;
  const enPlato = porcion || (coccion === "cocido" ? cocido || corte : corte);
  const rendimiento = inicial > 0 ? Math.round((enPlato / inicial) * 100) : 0;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: updateError } = await supabase.from("yield_tests").update({
      tipo: coccion,
      peso_inicial: inicial,
      peso_final: corte,
      peso_cocido: coccion === "cocido" ? cocido || null : null,
      peso_porcion: porcion || null,
      porcentaje_rendimiento: rendimiento,
      porcentaje_merma: inicial > 0 ? 100 - rendimiento : 0,
    }).eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await supabase.from("merma_parts").delete().eq("yield_test_id", id);
    const filas = partes.filter((p) => p.nombre.trim() && Number(p.gramos) > 0).map((p) => ({
      yield_test_id: id,
      user_id: user.id,
      nombre: p.nombre.trim(),
      gramos: Number(p.gramos),
      se_usa: p.se_usa,
      momento: p.momento,
    }));
    if (filas.length > 0) {
      const { error: partsError } = await supabase.from("merma_parts").insert(filas);
      if (partsError) {
        setError(partsError.message);
        return;
      }
    }
    router.push("/dashboard/rendimientos");
  };

  const bloque = (momento: "limpieza" | "porcion", titulo: string) => (
    <div className="space-y-2">
      <p className="font-medium">{titulo}</p>
      {partes.filter((p) => p.momento === momento).map((parte) => {
        const idx = partes.indexOf(parte);
        return (
          <div key={momento + idx} className="grid grid-cols-3 gap-2">
            <input value={parte.nombre} onChange={(e) => setPartes(partes.map((p, i) => i === idx ? { ...p, nombre: e.target.value } : p))} placeholder="Hueso, piel, puntas" className="px-3 py-2.5 border rounded-lg" />
            <input type="number" value={parte.gramos} onChange={(e) => setPartes(partes.map((p, i) => i === idx ? { ...p, gramos: e.target.value } : p))} placeholder="Gramos" className="px-3 py-2.5 border rounded-lg" />
            <select value={parte.se_usa ? "si" : "no"} onChange={(e) => setPartes(partes.map((p, i) => i === idx ? { ...p, se_usa: e.target.value === "si" } : p))} className="px-3 py-2.5 border rounded-lg">
              <option value="si">La voy a usar</option>
              <option value="no">La boto</option>
            </select>
          </div>
        );
      })}
      <button type="button" onClick={() => setPartes([...partes, { nombre: "", gramos: "", se_usa: true, momento }])} className="text-sm text-green-800">+ Agregar parte</button>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button type="button" disabled={!anterior} onClick={() => router.push("/dashboard/rendimientos/" + anterior + "/editar")} className={teclaSuave}>Anterior</button>
        <p className="text-sm text-gray-500">{indice + 1} de {ids.length}</p>
        <button type="button" disabled={!siguiente} onClick={() => router.push("/dashboard/rendimientos/" + siguiente + "/editar")} className={teclaSuave}>Siguiente</button>
      </div>
      <p className="text-sm text-green-700">Prueba de</p>
      <h1 className="text-2xl font-bold mb-2">{producto || "Cargando..."}</h1>
      <p className="text-gray-600 mb-6">Puedes cambiar los pesos, si se cocina y lo que sobró.</p>
      <form onSubmit={guardar} className="bg-white border border-gray-300 rounded-xl p-6 space-y-5 shadow-[0_4px_0_0_#d1d5db]">
        <div>
          <label className="block text-sm font-medium mb-1">¿Cuánto pesaba al comprarlo?</label>
          <input required type="number" value={pesoInicial} onChange={(e) => setPesoInicial(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">¿Cuánto pesa después de limpiar?</label>
          <input required type="number" value={pesoCorte} onChange={(e) => setPesoCorte(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg" />
        </div>
        {bloque("limpieza", "Lo que sobró al limpiar")}
        <div>
          <p className="font-medium mb-2">¿Lo cocinas antes de utilizarlo?</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setCoccion("crudo")} className={"px-3 py-2.5 rounded-lg border " + (coccion === "crudo" ? "bg-green-700 text-white" : "bg-white")}>Lo utilizo crudo</button>
            <button type="button" onClick={() => setCoccion("cocido")} className={"px-3 py-2.5 rounded-lg border " + (coccion === "cocido" ? "bg-green-700 text-white" : "bg-white")}>Lo cocino y después lo utilizo</button>
          </div>
        </div>
        {coccion === "cocido" && (
          <div>
            <label className="block text-sm font-medium mb-1">¿Cuánto pesa después de cocinar?</label>
            <input type="number" value={pesoCocido} onChange={(e) => setPesoCocido(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">¿Cuánto pesa ya en porciones?</label>
          <input type="number" value={pesoPorcion} onChange={(e) => setPesoPorcion(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg" />
        </div>
        {bloque("porcion", "Lo que sobró al porcionar")}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <p>De lo que compraste, llega al plato el <strong>{rendimiento}%</strong>.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className={tecla}>Guardar prueba</button>
      </form>
    </div>
  );
}