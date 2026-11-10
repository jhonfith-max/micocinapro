"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number };
type Item = { ingredient_id: string; nombre: string; cantidad: number; unidad: string; costo: number };

export default function EditarSubrecetaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [nombre, setNombre] = useState("");
  const [porciones, setPorciones] = useState("1");
  const [pesoPorcion, setPesoPorcion] = useState("");
  const [procedimiento, setProcedimiento] = useState("");
  const [alergenos, setAlergenos] = useState("");
  const [pcc, setPcc] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<Ingredient | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ings } = await supabase.from("ingredients").select("id, nombre, precio_por_unidad").eq("user_id", user.id);
      setIngredients(ings || []);
      const { data: rec } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (rec) {
        setNombre(rec.nombre || "");
        setPorciones(String(rec.porciones || 1));
        setPesoPorcion(String(rec.peso_porcion || ""));
        setProcedimiento(rec.instrucciones || "");
        setAlergenos(rec.alergenos || "");
        setPcc(rec.pcc || "");
      }
      const { data: recIngs } = await supabase.from("recipe_ingredients").select("ingredient_id, cantidad, unidad, costo, ingredients(nombre)").eq("recipe_id", id);
      if (recIngs) {
        setItems(recIngs.map((r: any) => ({
          ingredient_id: r.ingredient_id,
          nombre: r.ingredients?.nombre || "",
          cantidad: r.cantidad,
          unidad: r.unidad,
          costo: r.costo,
        })));
      }
    };
    load();
  }, [id]);

  const filtrados = ingredients.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const costoTotal = items.reduce((s, i) => s + i.costo, 0);
  const costoPorcion = costoTotal / (Number(porciones) || 1);

  const agregar = () => {
    if (!seleccionado || !cantidad) return;
    const costo = (Number(cantidad) * seleccionado.precio_por_unidad) / (unidad === "g" || unidad === "ml" ? 1000 : 1);
    setItems([...items, { ingredient_id: seleccionado.id, nombre: seleccionado.nombre, cantidad: Number(cantidad), unidad, costo }]);
    setSeleccionado(null);
    setCantidad("");
    setBusqueda("");
  };

  const quitar = (index: number) => setItems(items.filter((_, i) => i !== index));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("recipes").update({
      nombre,
      porciones: Number(porciones) || 1,
      peso_porcion: Number(pesoPorcion) || null,
      instrucciones: procedimiento,
      alergenos,
      pcc,
    }).eq("id", id);
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    if (items.length) {
      await supabase.from("recipe_ingredients").insert(items.map((i) => ({
        recipe_id: id,
        ingredient_id: i.ingredient_id,
        cantidad: i.cantidad,
        unidad: i.unidad,
        costo: i.costo,
      })));
    }
    setLoading(false);
    router.push("/dashboard/subrecetas");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Corregir sub-receta</h1>
      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Cómo se llama?</label>
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">¿Para cuántos platos alcanza?</label>
          <input type="number" value={porciones} onChange={(e) => setPorciones(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Peso final aproximado (g)</label>
          <input type="number" value={pesoPorcion} onChange={(e) => setPesoPorcion(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Agregar ingrediente</label>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-2.5 border rounded-lg" />
          {busqueda && filtrados.length > 0 && (
            <div className="border rounded-lg mt-1 max-h-40 overflow-auto">
              {filtrados.map((i) => (
                <button type="button" key={i.id} onClick={() => { setSeleccionado(i); setBusqueda(i.nombre); }} className="block w-full text-left px-3 py-2 hover:bg-stone-50 text-sm">{i.nombre}</button>
              ))}
            </div>
          )}
          {seleccionado && (
            <div className="flex gap-2 mt-2">
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Cantidad" className="flex-1 px-3 py-2 border rounded-lg" />
              <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="unidad">unidad</option>
              </select>
              <button type="button" onClick={agregar} className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm">Agregar</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Qué lleva</label>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b text-sm">
              <span>{item.nombre}: {item.cantidad} {item.unidad}</span>
              <div className="flex items-center gap-3">
                <span>{formatCOP(item.costo)}</span>
                <button type="button" onClick={() => quitar(i)} className="text-stone-400">×</button>
              </div>
            </div>
          ))}
          <p className="mt-2 text-sm">Costo por porción: {formatCOP(costoPorcion)}</p>
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Procedimiento</label>
          <textarea value={procedimiento} onChange={(e) => setProcedimiento(e.target.value)} rows={4} className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Alérgenos</label>
          <input type="text" value={alergenos} onChange={(e) => setAlergenos(e.target.value)} placeholder="Ej: Contiene lácteos, gluten" className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Puntos Críticos (PCC)</label>
          <input type="text" value={pcc} onChange={(e) => setPcc(e.target.value)} placeholder="Ej: Freír a 180°C" className="w-full px-4 py-2.5 border rounded-lg" />
        </div>
        <button disabled={loading} className="px-6 py-3 bg-green-800 text-white rounded-lg">{loading ? "Guardando..." : "Guardar"}</button>
      </form>
    </div>
  );
}