"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number; unidad_compra: string };
type Item = { ingredient_id: string; nombre: string; cantidad: number; unidad: string; costo: number };

export default function EditarSubrecetaPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [nombre, setNombre] = useState("");
  const [porciones, setPorciones] = useState("1");
  const [procedimiento, setProcedimiento] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<Ingredient | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [editando, setEditando] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const id = window.location.pathname.split("/").pop();
      const { data: rec } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (rec) {
        setNombre(rec.nombre || "");
        setPorciones(String(rec.porciones || 1));
        setProcedimiento(rec.instrucciones || "");
      }
      const { data: ings } = await supabase.from("ingredients").select("id, nombre, precio_por_unidad, unidad_compra").eq("user_id", user.id).order("nombre");
      setIngredients(ings || []);
      const { data: recIngs } = await supabase.from("recipe_ingredients").select("ingredient_id, cantidad, costo, ingredients(nombre)").eq("recipe_id", id);
      if (recIngs) {
        setItems(recIngs.map((ri: any) => ({
            ingredient_id: ri.ingredient_id,
            nombre: ri.ingredients?.nombre || "",
            cantidad: ri.cantidad,
            unidad: "g",
            costo: ri.costo,
          })));
      }
    };
    load();
  }, []);

  const filtrados = ingredients.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const unidadYPrecio = (ing: Ingredient) => {
    const u = ing.unidad_compra.toLowerCase();
    if (u === "kg") return { unidad: "g", precio: ing.precio_por_unidad / 1000 };
    if (u === "litro" || u === "l") return { unidad: "ml", precio: ing.precio_por_unidad / 1000 };
    return { unidad: u, precio: ing.precio_por_unidad };
  };

  const agregar = () => {
    if (!seleccionado || !cantidad) return;
    const { unidad, precio } = unidadYPrecio(seleccionado);
    const costo = precio * parseFloat(cantidad);
    const nuevo: Item = { ingredient_id: seleccionado.id, nombre: seleccionado.nombre, cantidad: parseFloat(cantidad), unidad, costo };
    if (editando !== null) {
      const copia = [...items];
      copia[editando] = nuevo;
      setItems(copia);
      setEditando(null);
    } else {
      setItems([...items, nuevo]);
    }
    setSeleccionado(null);
    setCantidad("");
    setBusqueda("");
  };

  const editar = (i: number) => {
    const item = items[i];
    const ing = ingredients.find((x) => x.id === item.ingredient_id);
    if (ing) { setSeleccionado(ing); setCantidad(String(item.cantidad)); setEditando(i); }
  };

  const eliminar = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const costoTotal = items.reduce((s, i) => s + i.costo, 0);
  const costoPorcion = costoTotal / parseFloat(porciones || "1");

  const guardar = async () => {
    setLoading(true);
    const id = window.location.pathname.split("/").pop();
    await supabase.from("recipes").update({
      nombre,
      porciones: parseFloat(porciones),
      costo_total: costoTotal,
      instrucciones: procedimiento,
    }).eq("id", id);
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    for (const item of items) {
      await supabase.from("recipe_ingredients").insert({
        recipe_id: id,
        ingredient_id: item.ingredient_id,
        cantidad: item.cantidad,
        costo: item.costo,
      });
    }
    router.push("/dashboard/subrecetas");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Corregir sub-receta</h1>
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-stone-600 mb-1.5">¿Cómo se llama?</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1.5">¿Para cuántos platos alcanza?</label>
          <input type="number" value={porciones} onChange={(e) => setPorciones(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1.5">Agregar ingrediente</label>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          {busqueda && (
            <div className="mt-2 border border-stone-200 rounded-xl overflow-hidden">
              {filtrados.map((ing) => (
                <button key={ing.id} onClick={() => { setSeleccionado(ing); setBusqueda(""); }} className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-sm">
                  {ing.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
        {seleccionado && (
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <p className="font-medium">{seleccionado.nombre}</p>
            <div className="flex gap-2">
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Cantidad" className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm" />
              <span className="px-4 py-2.5 bg-stone-100 rounded-xl text-sm">{unidadYPrecio(seleccionado).unidad}</span>
            </div>
            <button onClick={agregar} className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm">{editando !== null ? "Actualizar" : "Agregar"}</button>
          </div>
        )}
        {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-stone-600">Qué lleva</p>
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2.5 border-b border-stone-100">
                <span>{item.nombre}: {item.cantidad} {item.unidad}</span>
                <div className="flex items-center gap-3">
                  <span className="text-stone-500">{formatCOP(item.costo)}</span>
                  <button onClick={() => editar(i)} className="text-stone-400 hover:text-stone-600 text-xs">Editar</button>
                  <button onClick={() => eliminar(i)} className="text-red-400 hover:text-red-600">×</button>
                </div>
              </div>
            ))}
            <p className="text-sm font-medium pt-2">Costo por porción: {formatCOP(costoPorcion)}</p>
          </div>
        )}
        <div>
          <label className="block text-sm text-stone-600 mb-1.5">Procedimiento</label>
          <textarea value={procedimiento} onChange={(e) => setProcedimiento(e.target.value)} rows={4} placeholder="Cómo se prepara..." className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <button onClick={guardar} disabled={loading} className="px-6 py-3 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar"}</button>
      </div>
    </div>
  );
}