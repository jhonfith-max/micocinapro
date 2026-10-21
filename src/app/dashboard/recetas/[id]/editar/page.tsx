"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number; unidad_compra: string };
type Prep = { id: string; nombre: string; costo_porcion: number };
type Row = { id: string; ingredient_id: string; nombre: string; cantidad: number; unidad: string; costo: number };
type PrepRow = { id: string; component_recipe_id: string; nombre: string; cantidad: number; unidad: string; costo: number };

const CATEGORIAS = [
  { id: "entradas", nombre: "Entrada o sopa" },
  { id: "fuertes", nombre: "Plato fuerte" },
  { id: "guarniciones", nombre: "Guarnición" },
  { id: "postres", nombre: "Postre" },
  { id: "jugos", nombre: "Jugo o gaseosa" },
  { id: "cerveza", nombre: "Cerveza" },
  { id: "coctel", nombre: "Cóctel" },
  { id: "vino", nombre: "Copa de vino" },
  { id: "nuevo", nombre: "Crear un tipo nuevo" },
];
const ALERGENOS = ["gluten", "lácteos", "huevo", "maní", "soya", "pescado", "mariscos"];

function costoIngrediente(ing: Ingredient, cantidad: number, unidad: string, rendimiento: number) {
  const base = ing.unidad_compra.toLowerCase();
  let precio = ing.precio_por_unidad;
  if (unidad === "g" && base === "kg") precio = ing.precio_por_unidad / 1000;
  if (unidad === "ml" && (base === "litro" || base === "l")) precio = ing.precio_por_unidad / 1000;
  if (unidad === "g" && base === "g") precio = ing.precio_por_unidad;
  if (unidad === "ml" && base === "ml") precio = ing.precio_por_unidad;
  if (rendimiento > 0 && rendimiento < 100 && (unidad === "g" || unidad === "ml")) precio = precio / (rendimiento / 100);
  return Math.round(cantidad * precio);
}

export default function EditarRecetaPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const [ids, setIds] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("fuertes");
  const [tipoNuevo, setTipoNuevo] = useState("");
  const [porciones, setPorciones] = useState("1");
  const [precio, setPrecio] = useState("");
  const [pesoPlato, setPesoPlato] = useState("");
  const [alergenos, setAlergenos] = useState<string[]>([]);
  const [instrucciones, setInstrucciones] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [prepRows, setPrepRows] = useState<PrepRow[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [rendimientos, setRendimientos] = useState<Record<string, number>>({});
  const [preps, setPreps] = useState<Prep[]>([]);
  const [selected, setSelected] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");
  const [selectedPrep, setSelectedPrep] = useState("");
  const [cantidadPrep, setCantidadPrep] = useState("1");
  const [unidadPrep, setUnidadPrep] = useState("porcion");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: lista } = await supabase.from("recipes").select("id").eq("user_id", user.id).eq("es_preparacion", false).order("nombre");
      setIds((lista || []).map((item) => item.id));
      const { data: recipe } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (recipe) {
        setNombre(recipe.nombre);
        const conocida = CATEGORIAS.some((c) => c.id === recipe.categoria);
        if (recipe.categoria && !conocida) { setCategoria("nuevo"); setTipoNuevo(recipe.categoria); }
        else setCategoria(recipe.categoria || "fuertes");
        setPorciones(String(recipe.porciones));
        setPrecio(recipe.precio_venta ? String(recipe.precio_venta) : "");
        setPesoPlato(recipe.peso_plato ? String(recipe.peso_plato) : "");
        setAlergenos(recipe.alergenos ? recipe.alergenos.split(", ").filter(Boolean) : []);
        setInstrucciones(recipe.instrucciones || "");
      }
      const { data: ings } = await supabase.from("ingredients").select("id, nombre, precio_por_unidad, unidad_compra").eq("user_id", user.id).order("nombre");
      setIngredients(ings || []);
      const { data: tests } = await supabase.from("yield_tests").select("ingredient_id, porcentaje_rendimiento").eq("user_id", user.id);
      const mapa: Record<string, number> = {};
      (tests || []).forEach((t) => { if (t.porcentaje_rendimiento) mapa[t.ingredient_id] = t.porcentaje_rendimiento; });
      setRendimientos(mapa);
      const { data: subs } = await supabase.from("recipes").select("id, nombre, costo_porcion").eq("user_id", user.id).eq("es_preparacion", true).order("nombre");
      setPreps(subs || []);
      const { data } = await supabase.from("recipe_ingredients").select("id, ingredient_id, cantidad, unidad, costo, ingredients(nombre)").eq("recipe_id", id);
      setRows((data || []).map((row) => ({ id: row.id, ingredient_id: row.ingredient_id, nombre: (row.ingredients as { nombre?: string } | null)?.nombre || "Producto", cantidad: row.cantidad, unidad: row.unidad, costo: row.costo })));
      const { data: parts } = await supabase.from("recipe_components").select("id, component_recipe_id, cantidad, costo, recipes:component_recipe_id(nombre)").eq("recipe_id", id);
      setPrepRows((parts || []).map((row) => ({ id: row.id, component_recipe_id: row.component_recipe_id, nombre: (row.recipes as { nombre?: string } | null)?.nombre || "Sub-receta", cantidad: row.cantidad, unidad: "porcion", costo: row.costo })));
    };
    if (id) load();
  }, [id]);

  const indice = ids.indexOf(id);
  const anterior = indice > 0 ? ids[indice - 1] : "";
  const siguiente = indice >= 0 && indice < ids.length - 1 ? ids[indice + 1] : "";
  const faltaCondimento = rows.length > 0 && !rows.some((r) => /aceite|sal|pimienta|ajo/.test(r.nombre.toLowerCase()));
  const quitar = async (rowId: string) => { await supabase.from("recipe_ingredients").delete().eq("id", rowId); setRows((prev) => prev.filter((row) => row.id !== rowId)); };
  const quitarPrep = async (rowId: string) => { await supabase.from("recipe_components").delete().eq("id", rowId); setPrepRows((prev) => prev.filter((row) => row.id !== rowId)); };
  const agregar = async () => {
    const ing = ingredients.find((i) => i.id === selected);
    const qty = parseFloat(cantidad);
    if (!ing || !qty) return;
    const costo = costoIngrediente(ing, qty, unidad, rendimientos[ing.id] || 100);
    const { data } = await supabase.from("recipe_ingredients").insert({ recipe_id: id, ingredient_id: ing.id, cantidad: qty, unidad, tipo_uso: "crudo", costo }).select().single();
    if (data) setRows((prev) => [...prev, { id: data.id, ingredient_id: ing.id, nombre: ing.nombre, cantidad: qty, unidad, costo }]);
    setSelected(""); setCantidad("");
  };
  const agregarPrep = async () => {
    const prep = preps.find((p) => p.id === selectedPrep);
    const qty = parseFloat(cantidadPrep);
    if (!prep || !qty) return;
    const costo = unidadPrep === "porcion" ? Math.round(qty * prep.costo_porcion) : Math.round(qty * (prep.costo_porcion / 100));
    const { data } = await supabase.from("recipe_components").insert({ recipe_id: id, component_recipe_id: prep.id, cantidad: qty, costo }).select().single();
    if (data) setPrepRows((prev) => [...prev, { id: data.id, component_recipe_id: prep.id, nombre: prep.nombre, cantidad: qty, unidad: unidadPrep, costo }]);
    setSelectedPrep(""); setCantidadPrep("1");
  };
  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const costoTotal = rows.reduce((sum, row) => sum + row.costo, 0) + prepRows.reduce((sum, row) => sum + row.costo, 0);
    const n = parseFloat(porciones) || 1;
    const venta = parseFloat(precio) || 0;
    const categoriaFinal = categoria === "nuevo" ? tipoNuevo.trim().toLowerCase() : categoria;
    const { error: updateError } = await supabase.from("recipes").update({
      nombre: nombre.trim(),
      categoria: categoriaFinal || "fuertes",
      porciones: n,
      precio_venta: venta || null,
      peso_plato: parseFloat(pesoPlato) || null,
      alergenos: alergenos.join(", "),
      instrucciones: instrucciones || null,
      costo_total: Math.round(costoTotal),
      costo_porcion: Math.round(costoTotal / n),
      food_cost: venta > 0 ? Math.round(((costoTotal / n) / (venta / 1.08)) * 100) : 0,
    }).eq("id", id);
    if (updateError) setError(updateError.message);
    else router.push("/dashboard/carta");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button type="button" disabled={!anterior} onClick={() => router.push("/dashboard/recetas/" + anterior + "/editar")} className="px-3 py-2 border border-stone-200 rounded-xl disabled:opacity-40 text-sm">Anterior</button>
        <p className="text-sm text-stone-400">{Math.max(indice + 1, 1)} de {ids.length}</p>
        <button type="button" disabled={!siguiente} onClick={() => router.push("/dashboard/recetas/" + siguiente + "/editar")} className="px-3 py-2 border border-stone-200 rounded-xl disabled:opacity-40 text-sm">Siguiente</button>
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Corregir</h1>
      <form onSubmit={guardar} className="space-y-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿Cómo se llama?</label>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿Qué tipo es?</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl">
              {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {categoria === "nuevo" && <input value={tipoNuevo} onChange={(e) => setTipoNuevo(e.target.value)} placeholder="Ejemplo: menú kids" className="w-full mt-2 px-4 py-3 border border-stone-200 rounded-xl" />}
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿Para cuántos platos alcanza?</label>
            <input required type="number" min="1" value={porciones} onChange={(e) => setPorciones(e.target.value)} className="w-full sm:max-w-xs px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿A cuánto lo vendes?</label>
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full sm:max-w-xs px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">¿Cuántos gramos salen en el plato?</label>
            <input type="number" value={pesoPlato} onChange={(e) => setPesoPlato(e.target.value)} placeholder="180" className="w-full sm:max-w-xs px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          <div>
            <p className="text-sm text-stone-600 mb-2">¿Qué alérgenos tiene?</p>
            <div className="flex flex-wrap gap-2">
              {ALERGENOS.map((a) => (
                <label key={a} className="text-sm border border-stone-200 rounded-lg px-3 py-2">
                  <input type="checkbox" checked={alergenos.includes(a)} onChange={() => setAlergenos((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])} className="mr-1" />
                  {a}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-3">
          <p className="font-medium">Productos</p>
          {rows.map((row) => (
            <div key={row.id} className="flex justify-between text-sm">
              <span>{row.nombre}: {row.cantidad} {row.unidad} · {formatCOP(row.costo)}</span>
              <button type="button" onClick={() => quitar(row.id)} className="text-stone-400">Quitar</button>
            </div>
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
          {faltaCondimento && <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-xl">Este plato no tiene aceite, sal, pimienta ni ajo. ¿Seguro que no lleva?</p>}
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-3">
          <p className="font-medium">Sub-receta</p>
          {prepRows.map((row) => (
            <div key={row.id} className="flex justify-between text-sm">
              <span>{row.nombre}: {row.cantidad} {row.unidad} · {formatCOP(row.costo)}</span>
              <button type="button" onClick={() => quitarPrep(row.id)} className="text-stone-400">Quitar</button>
            </div>
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select value={selectedPrep} onChange={(e) => setSelectedPrep(e.target.value)} className="px-3 py-3 border border-stone-200 rounded-xl">
              <option value="">Elegir</option>
              {preps.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <input type="number" min="0" value={cantidadPrep} onChange={(e) => setCantidadPrep(e.target.value)} className="px-3 py-3 border border-stone-200 rounded-xl" />
            <select value={unidadPrep} onChange={(e) => setUnidadPrep(e.target.value)} className="px-3 py-3 border border-stone-200 rounded-xl"><option value="porcion">porcion</option><option value="g">g</option><option value="ml">ml</option></select>
            <button type="button" onClick={agregarPrep} className="px-3 py-3 border border-stone-200 rounded-xl">Agregar</button>
          </div>
        </div>
        <textarea value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} rows={3} placeholder="Cómo se prepara" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
        <button disabled={loading} className="w-full sm:w-auto px-6 py-3.5 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar cambios"}</button>
      </form>
    </div>
  );
}