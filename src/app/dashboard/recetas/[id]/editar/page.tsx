"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number; unidad_compra: string };
type Item = { ingredient_id: string; nombre: string; cantidad: number; unidad: string; costo: number };

export default function EditarRecetaPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [nombre, setNombre] = useState("");
  const [porciones, setPorciones] = useState("1");
  const [precioVenta, setPrecioVenta] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoActual, setFotoActual] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<Ingredient | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const id = window.location.pathname.split("/")[3];
      const { data: rec } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (rec) {
        setNombre(rec.nombre || "");
        setPorciones(String(rec.porciones || 1));
        setPrecioVenta(String(rec.precio_venta || ""));
        setInstrucciones(rec.instrucciones || "");
        setFotoActual(rec.foto || "");
      }
      const { data: ings } = await supabase.from("ingredients").select("id, nombre, precio_por_unidad, unidad_compra").eq("user_id", user.id).order("nombre");
      setIngredients(ings || []);
      const { data: recIngs } = await supabase.from("recipe_ingredients").select("ingredient_id, cantidad, costo, unidad").eq("recipe_id", id);
      if (recIngs) {
        setItems(recIngs.map((ri) => ({
          ingredient_id: ri.ingredient_id,
          nombre: ings?.find((i) => i.id === ri.ingredient_id)?.nombre || "",
          cantidad: ri.cantidad,
          unidad: ri.unidad || "g",
          costo: ri.costo,
        })));
      }
    };
    load();
  }, []);

  const filtrados = ingredients.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const agregar = () => {
    if (!seleccionado || !cantidad) return;
    const costo = seleccionado.precio_por_unidad * parseFloat(cantidad);
    setItems([...items, { ingredient_id: seleccionado.id, nombre: seleccionado.nombre, cantidad: parseFloat(cantidad), unidad: "g", costo }]);
    setSeleccionado(null);
    setCantidad("");
    setBusqueda("");
  };

  const eliminar = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const costoTotal = items.reduce((s, i) => s + i.costo, 0);
  const costoPorcion = costoTotal / parseFloat(porciones || "1");

  const guardar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const id = window.location.pathname.split("/")[3];
    let fotoUrl = fotoActual;
    if (foto) {
      const nombreArchivo = `${user.id}/${Date.now()}.jpg`;
      await supabase.storage.from("recetas").upload(nombreArchivo, foto);
      const { data } = supabase.storage.from("recetas").getPublicUrl(nombreArchivo);
      fotoUrl = data.publicUrl;
    }
    await supabase.from("recipes").update({
      nombre,
      porciones: parseFloat(porciones),
      precio_venta: parseFloat(precioVenta || "0"),
      costo_total: costoTotal,
      instrucciones,
      foto: fotoUrl,
    }).eq("id", id);
    await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
    for (const item of items) {
      await supabase.from("recipe_ingredients").insert({
        recipe_id: id,
        ingredient_id: item.ingredient_id,
        cantidad: item.cantidad,
        costo: item.costo,
        unidad: item.unidad,
      });
    }
    router.push("/dashboard/recetas");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Corregir receta</h1>
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        <input type="number" value={porciones} onChange={(e) => setPorciones(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        <div>
          <label className="block text-sm text-stone-600 mb-1.5">Foto del plato</label>
          {fotoActual && <img src={fotoActual} alt="" className="w-32 h-32 object-cover rounded-xl mb-2" />}
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
        <div>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar ingrediente" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
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
            <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Gramos" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm" />
            <button onClick={agregar} className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm">Agregar</button>
          </div>
        )}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-stone-100">
                <span>{item.nombre} · {item.cantidad} {item.unidad}</span>
                <div className="flex items-center gap-3">
                  <span>{formatCOP(item.costo)}</span>
                  <button onClick={() => eliminar(i)} className="text-red-400">×</button>
                </div>
              </div>
            ))}
            <p className="text-sm font-medium">Costo por porción: {formatCOP(costoPorcion)}</p>
          </div>
        )}
        <input type="number" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} placeholder="Precio de venta" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        <div>
          <label className="block text-sm text-stone-600 mb-1">Instrucciones</label>
          <textarea value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <button onClick={guardar} disabled={loading} className="px-6 py-3 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar"}</button>
      </div>
    </div>
  );
}