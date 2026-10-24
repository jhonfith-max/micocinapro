"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = { id: string; nombre: string; precio_por_unidad: number; unidad_compra: string };
type YieldTest = { ingredient_id: string; porcentaje_rendimiento: number; tipo: string; notas: string | null };
type Item = { ingredient_id: string; nombre: string; cantidad: number; unidad: string; costo: number; uso: string };

export default function NuevaRecetaPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [yields, setYields] = useState<YieldTest[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [nombre, setNombre] = useState("");
  const [porciones, setPorciones] = useState("1");
  const [precioVenta, setPrecioVenta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<Ingredient | null>(null);
  const [cantidad, setCantidad] = useState("");
  const [uso, setUso] = useState("compra");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: ings } = await supabase.from("ingredients").select("id, nombre, precio_por_unidad, unidad_compra").eq("user_id", user.id).order("nombre");
      const { data: yld } = await supabase.from("yield_tests").select("ingredient_id, porcentaje_rendimiento, tipo, notas").eq("user_id", user.id);
      setIngredients(ings || []);
      setYields(yld || []);
    };
    load();
  }, []);

  const filtrados = ingredients.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const yieldDelProducto = yields.filter((y) => y.ingredient_id === seleccionado?.id);

  const agregar = () => {
    if (!seleccionado || !cantidad) return;
    let costo = seleccionado.precio_por_unidad * parseFloat(cantidad);
    let nombreUso = seleccionado.nombre;
    if (uso === "limpio" || uso === "cocido") {
      const y = yieldDelProducto.find((x) => x.tipo === (uso === "limpio" ? "limpieza" : "coccion"));
      if (y) {
        costo = costo / (y.porcentaje_rendimiento / 100);
        nombreUso = `${seleccionado.nombre} · ${y.notas || uso}`;
      }
    }
    setItems([...items, { ingredient_id: seleccionado.id, nombre: nombreUso, cantidad: parseFloat(cantidad), unidad: "g", costo, uso }]);
    setSeleccionado(null);
    setCantidad("");
    setUso("compra");
    setBusqueda("");
  };

  const costoTotal = items.reduce((s, i) => s + i.costo, 0);
  const costoPorcion = costoTotal / parseFloat(porciones || "1");
  const foodCost = precioVenta ? Math.round((costoPorcion / parseFloat(precioVenta)) * 100) : 0;

  const guardar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: rec } = await supabase.from("recipes").insert({
      user_id: user.id,
      nombre,
      porciones: parseFloat(porciones),
      precio_venta: parseFloat(precioVenta || "0"),
      costo_total: costoTotal,
    }).select().single();
    if (rec) {
      for (const item of items) {
        await supabase.from("recipe_ingredients").insert({
          recipe_id: rec.id,
          ingredient_id: item.ingredient_id,
          cantidad: item.cantidad,
          costo: item.costo,
        });
      }
    }
    router.push("/dashboard/recetas");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Nueva receta</h1>
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del plato" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        <input type="number" value={porciones} onChange={(e) => setPorciones(e.target.value)} placeholder="Porciones" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
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
            <div>
              <label className="block text-sm text-stone-600 mb-1">¿Cómo lo vas a usar?</label>
              <select value={uso} onChange={(e) => setUso(e.target.value)} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm">
                <option value="compra">Como lo compré</option>
                {yieldDelProducto.some((y) => y.tipo === "limpieza") && <option value="limpio">Ya limpio</option>}
                {yieldDelProducto.some((y) => y.tipo === "coccion") && <option value="cocido">Ya cocido</option>}
              </select>
            </div>
            <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Gramos" className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm" />
            <button onClick={agregar} className="px-4 py-2 bg-green-800 text-white rounded-lg text-sm">Agregar</button>
          </div>
        )}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-2 border-b border-stone-100">
                <span>{item.nombre} · {item.cantidad} g</span>
                <span>{formatCOP(item.costo)}</span>
              </div>
            ))}
            <p className="text-sm font-medium">Costo por porción: {formatCOP(costoPorcion)}</p>
          </div>
        )}
        <input type="number" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} placeholder="Precio de venta" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        {foodCost > 0 && <p className="text-sm">Food cost: <span className="font-semibold">{foodCost}%</span></p>}
        <button onClick={guardar} disabled={loading} className="px-6 py-3 bg-green-800 text-white rounded-xl">{loading ? "Guardando..." : "Guardar receta"}</button>
      </div>
    </div>
  );
}