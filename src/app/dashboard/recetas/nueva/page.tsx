"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number; rendimiento?: number };
type PrepRecipe = { id: string; nombre: string; costo_porcion: number };
type RecipeItem = { ingredient_id: string; nombre: string; cantidad: number; unidad: string; costo: number; tipo_uso: string };
type PrepItem = { component_recipe_id: string; nombre: string; cantidad: number; costo: number };

export default function NuevaRecetaPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [preps, setPreps] = useState<PrepRecipe[]>([]);
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const [form, setForm] = useState({
    nombre: "", instrucciones: "", alergenos: "", pcc: "", precio_venta: "", peso_porcion: "", porciones: "1",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<Ingredient | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");
  const [tipoUso, setTipoUso] = useState<"crudo" | "limpio">("crudo");
  const [busquedaPrep, setBusquedaPrep] = useState("");
  const [seleccionadoPrep, setSeleccionadoPrep] = useState<PrepRecipe | null>(null);
  const [cantidadPrep, setCantidadPrep] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ings } = await supabase.from("ingredients").select("id, nombre, precio_por_unidad").eq("user_id", user.id);
      const { data: yields } = await supabase.from("yield_tests").select("ingredient_id, porcentaje_rendimiento").eq("user_id", user.id);
      const yieldMap: Record<string, number> = {};
      yields?.forEach((y: any) => { if (y.ingredient_id && y.porcentaje_rendimiento) yieldMap[y.ingredient_id] = y.porcentaje_rendimiento; });
      setIngredients((ings || []).map((i: any) => ({ ...i, rendimiento: yieldMap[i.id] })));
      const { data: pr } = await supabase.from("recipes").select("id, nombre, costo_porcion").eq("user_id", user.id).eq("es_preparacion", true);
      setPreps(pr || []);
    };
    load();
  }, []);

  const filtrados = ingredients.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const filtradosPrep = preps.filter((p) => p.nombre.toLowerCase().includes(busquedaPrep.toLowerCase()));
  const costoTotal = items.reduce((s, i) => s + i.costo, 0) + prepItems.reduce((s, i) => s + i.costo, 0);
  const foodCost = form.precio_venta ? Math.round((costoTotal / Number(form.precio_venta)) * 100) : 0;

  const agregarIng = () => {
    if (!seleccionado || !cantidad) return;
    const factor = unidad === "g" || unidad === "ml" ? 1000 : 1;
    let precio = seleccionado.precio_por_unidad / factor;
    if (tipoUso === "limpio" && seleccionado.rendimiento) precio = precio / (seleccionado.rendimiento / 100);
    const costo = Number(cantidad) * precio;
    setItems([...items, { ingredient_id: seleccionado.id, nombre: seleccionado.nombre, cantidad: Number(cantidad), unidad, costo, tipo_uso: tipoUso }]);
    setSeleccionado(null); setCantidad(""); setBusqueda(""); setTipoUso("crudo");
  };

  const agregarPrep = () => {
    if (!seleccionadoPrep) return;
    setPrepItems([...prepItems, { component_recipe_id: seleccionadoPrep.id, nombre: seleccionadoPrep.nombre, cantidad: Number(cantidadPrep), costo: seleccionadoPrep.costo_porcion * Number(cantidadPrep) }]);
    setSeleccionadoPrep(null); setCantidadPrep("1"); setBusquedaPrep("");
  };

  const quitarIng = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const quitarPrep = (i: number) => setPrepItems(prepItems.filter((_, idx) => idx !== i));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let fotoUrl = null;
    if (foto) {
      const path = `${user.id}/${Date.now()}-${foto.name}`;
      const { data: upload } = await supabase.storage.from("fotos").upload(path, foto);
      if (upload) {
        const { data: url } = supabase.storage.from("fotos").getPublicUrl(path);
        fotoUrl = url.publicUrl;
      }
    }
    const { data: rec } = await supabase.from("recipes").insert({
      user_id: user.id, nombre: form.nombre, instrucciones: form.instrucciones, alergenos: form.alergenos, pcc: form.pcc,
      precio_venta: form.precio_venta ? Number(form.precio_venta) : null, peso_porcion: form.peso_porcion ? Number(form.peso_porcion) : null,
      porciones: Number(form.porciones) || 1, costo_total: costoTotal, costo_porcion: costoTotal / (Number(form.porciones) || 1),
      es_preparacion: false, foto: fotoUrl,
    }).select().single();
    if (rec && items.length) {
      await supabase.from("recipe_ingredients").insert(items.map((i) => ({ recipe_id: rec.id, ingredient_id: i.ingredient_id, cantidad: i.cantidad, unidad: i.unidad, costo: i.costo, tipo_uso: i.tipo_uso })));
    }
    if (rec && prepItems.length) {
      await supabase.from("recipe_components").insert(prepItems.map((p) => ({ recipe_id: rec.id, component_recipe_id: p.component_recipe_id, cantidad: p.cantidad, costo: p.costo })));
    }
    setLoading(false);
    router.push("/dashboard/recetas");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Nueva receta</h1>
      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">Nombre</label>
          <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Porciones</label>
          <input type="number" value={form.porciones} onChange={(e) => setForm({ ...form, porciones: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Precio de venta</label>
          <input type="number" value={form.precio_venta} onChange={(e) => setForm({ ...form, precio_venta: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Peso final aproximado (g)</label>
          <input type="number" value={form.peso_porcion} onChange={(e) => setForm({ ...form, peso_porcion: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Foto del plato</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Agregar ingrediente</label>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar ingrediente..." className="w-full px-4 py-2.5 border rounded-lg" />
          {busqueda && filtrados.length > 0 && (
            <div className="border rounded-lg mt-1 max-h-40 overflow-auto">
              {filtrados.map((i) => (
                <button type="button" key={i.id} onClick={() => { setSeleccionado(i); setBusqueda(i.nombre); }} className="block w-full text-left px-3 py-2 hover:bg-stone-50 text-sm">{i.nombre}{i.rendimiento ? ` (${i.rendimiento}%)` : ""}</button>
              ))}
            </div>
          )}
          {seleccionado && seleccionado.rendimiento && (
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setTipoUso("crudo")} className={`px-3 py-1 text-sm rounded ${tipoUso === "crudo" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Como lo compré</button>
              <button type="button" onClick={() => setTipoUso("limpio")} className={`px-3 py-1 text-sm rounded ${tipoUso === "limpio" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Ya limpio ({seleccionado.rendimiento}%)</button>
            </div>
          )}
          {seleccionado && (
            <div className="flex gap-2 mt-2">
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Cantidad" className="flex-1 px-3 py-2 border rounded-lg" />
              <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="g">g</option><option value="ml">ml</option><option value="unidad">unidad</option>
              </select>
              <button type="button" onClick={agregarIng} className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm">Agregar</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Agregar subreceta</label>
          <input value={busquedaPrep} onChange={(e) => setBusquedaPrep(e.target.value)} placeholder="Buscar subreceta..." className="w-full px-4 py-2.5 border rounded-lg" />
          {busquedaPrep && filtradosPrep.length > 0 && (
            <div className="border rounded-lg mt-1 max-h-40 overflow-auto">
              {filtradosPrep.map((p) => (
                <button type="button" key={p.id} onClick={() => { setSeleccionadoPrep(p); setBusquedaPrep(p.nombre); }} className="block w-full text-left px-3 py-2 hover:bg-stone-50 text-sm">{p.nombre}</button>
              ))}
            </div>
          )}
          {seleccionadoPrep && (
            <div className="flex gap-2 mt-2">
              <input type="number" value={cantidadPrep} onChange={(e) => setCantidadPrep(e.target.value)} placeholder="Porciones" className="flex-1 px-3 py-2 border rounded-lg" />
              <button type="button" onClick={agregarPrep} className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm">Agregar</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Qué lleva</label>
          {items.map((item, i) => (
            <div key={"i" + i} className="flex justify-between items-center py-1 text-sm border-b">
              <span>{item.nombre}: {item.cantidad} {item.unidad} {item.tipo_uso === "limpio" ? "(limpio)" : ""}</span>
              <div className="flex items-center gap-2"><span>{formatCOP(item.costo)}</span><button type="button" onClick={() => quitarIng(i)} className="text-stone-400">×</button></div>
            </div>
          ))}
          {prepItems.map((item, i) => (
            <div key={"p" + i} className="flex justify-between items-center py-1 text-sm border-b">
              <span>{item.nombre}: {item.cantidad} porción</span>
              <div className="flex items-center gap-2"><span>{formatCOP(item.costo)}</span><button type="button" onClick={() => quitarPrep(i)} className="text-stone-400">×</button></div>
            </div>
          ))}
          <p className="mt-2 text-sm font-medium">Costo total: {formatCOP(costoTotal)}</p>
          {form.precio_venta && <p className="text-sm">Food cost: {foodCost}%</p>}
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Instrucciones</label>
          <textarea value={form.instrucciones} onChange={(e) => setForm({ ...form, instrucciones: e.target.value })} rows={4} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Alérgenos</label>
          <input type="text" value={form.alergenos} onChange={(e) => setForm({ ...form, alergenos: e.target.value })} placeholder="Ej: Contiene lácteos, gluten" className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Puntos Críticos (PCC)</label>
          <input type="text" value={form.pcc} onChange={(e) => setForm({ ...form, pcc: e.target.value })} placeholder="Ej: Centro de la carne a 75°C" className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <button disabled={loading} className="px-6 py-3 bg-green-800 text-white rounded-lg">{loading ? "Guardando..." : "Guardar"}</button>
      </form>
    </div>
  );
}