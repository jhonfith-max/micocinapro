"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; costo_total: number };
type Menu = { id: string; nombre: string; costo_total: number; precio: number };

export default function MenusPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [nombre, setNombre] = useState("");
  const [entradas, setEntradas] = useState<string[]>([]);
  const [fuertes, setFuertes] = useState<string[]>([]);
  const [guarniciones, setGuarniciones] = useState<string[]>([]);
  const [postre, setPostre] = useState("");
  const [bebida, setBebida] = useState("");
  const [precio, setPrecio] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: recs } = await supabase.from("recipes").select("id, nombre, costo_total").eq("user_id", user.id).eq("es_preparacion", false);
      const { data: mens } = await supabase.from("menus_corporativos").select("id, nombre, costo_total, precio").eq("user_id", user.id);
      setRecipes(recs || []);
      setMenus(mens || []);
    };
    load();
  }, []);

  const costo = (ids: string[]) => ids.reduce((sum, id) => sum + (recipes.find((r) => r.id === id)?.costo_total || 0), 0);
  const costoBase = costo(entradas) + costo(fuertes) + costo(guarniciones) + (recipes.find((r) => r.id === postre)?.costo_total || 0) + (recipes.find((r) => r.id === bebida)?.costo_total || 0);
  const contingencia = Math.round(costoBase * 0.07);
  const costoTotal = costoBase + contingencia;
  const foodCost = precio ? Math.round((costoTotal / parseFloat(precio)) * 100) : 0;
  const precioRecomendado = Math.round(costoTotal / 0.32);

  const guardar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !nombre) return;
    let fotoUrl = null;
    if (foto) {
      const nombreArchivo = `${user.id}/${Date.now()}.jpg`;
      await supabase.storage.from("recetas").upload(nombreArchivo, foto);
      const { data } = supabase.storage.from("recetas").getPublicUrl(nombreArchivo);
      fotoUrl = data.publicUrl;
    }
    await supabase.from("menus_corporativos").insert({
      user_id: user.id,
      nombre,
      entrada_id: entradas[0] || null,
      fuerte_id: fuertes[0] || null,
      guarnicion_id: guarniciones[0] || null,
      postre_id: postre || null,
      bebida_id: bebida || null,
      precio: parseFloat(precio || "0"),
      costo_total: costoTotal,
      foto: fotoUrl,
    });
    setMostrarForm(false);
    window.location.reload();
  };

  const eliminar = async (id: string) => {
    await supabase.from("menus_corporativos").delete().eq("id", id);
    setMenus((prev) => prev.filter((m) => m.id !== id));
  };

  if (mostrarForm) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">Nuevo menú corporativo</h1>
        <div className="space-y-4">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del menú" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-1">Entradas <span className="text-xs text-stone-400">(puedes elegir varias)</span></p>
            <select onChange={(e) => e.target.value && setEntradas([...entradas, e.target.value])} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
              <option value="">Agregar entrada</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            {entradas.map((id) => <p key={id} className="text-sm mt-1">{recipes.find((r) => r.id === id)?.nombre} <button onClick={() => setEntradas(entradas.filter((x) => x !== id))} className="text-red-500">×</button></p>)}
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-1">Platos fuertes <span className="text-xs text-stone-400">(puedes elegir varias)</span></p>
            <select onChange={(e) => e.target.value && setFuertes([...fuertes, e.target.value])} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
              <option value="">Agregar fuerte</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            {fuertes.map((id) => <p key={id} className="text-sm mt-1">{recipes.find((r) => r.id === id)?.nombre} <button onClick={() => setFuertes(fuertes.filter((x) => x !== id))} className="text-red-500">×</button></p>)}
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-1">Guarniciones <span className="text-xs text-stone-400">(puedes elegir varias)</span></p>
            <select onChange={(e) => e.target.value && setGuarniciones([...guarniciones, e.target.value])} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
              <option value="">Agregar guarnición</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            {guarniciones.map((id) => <p key={id} className="text-sm mt-1">{recipes.find((r) => r.id === id)?.nombre} <button onClick={() => setGuarniciones(guarniciones.filter((x) => x !== id))} className="text-red-500">×</button></p>)}
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-1">Postre</p>
            <select value={postre} onChange={(e) => setPostre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
              <option value="">Elegir</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-1">Bebida</p>
            <select value={bebida} onChange={(e) => setBebida(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
              <option value="">Elegir</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-1">Precio del menú</p>
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="35000" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <label className="block text-sm text-stone-600 mb-1.5">Foto del menú</label>
            <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>
          {costoTotal > 0 && (
            <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Costo de platos</span><span>{formatCOP(Math.round(costoBase))}</span></div>
              <div className="flex justify-between"><span>Contingencia 7% <span className="text-xs text-stone-400">(merma y no-shows)</span></span><span>{formatCOP(contingencia)}</span></div>
              <div className="flex justify-between border-t border-stone-200 pt-2"><span>Costo total</span><span className="font-medium">{formatCOP(costoTotal)}</span></div>
              <div className="flex justify-between"><span>Precio recomendado (32%)</span><span className="font-semibold">{formatCOP(precioRecomendado)}</span></div>
              {precio && <div className="flex justify-between"><span>Food cost</span><span className={foodCost > 32 ? "text-red-600" : "text-green-700"}>{foodCost}%</span></div>}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={guardar} className="px-6 py-3 bg-green-800 text-white rounded-xl">Guardar</button>
            <button onClick={() => setMostrarForm(false)} className="px-6 py-3 border rounded-xl">Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-green-800">Si haces almuerzos</p>
      <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Corporativo</h1>
      <p className="text-stone-500 mt-1 text-sm">Entrada, fuerte y bebida. Un solo precio.</p>
      <button onClick={() => setMostrarForm(true)} className="mt-4 px-4 py-2 bg-green-800 text-white text-sm rounded-xl">+ Nuevo menú</button>
      <div className="mt-6 space-y-3">
        {menus.map((m) => (
          <div key={m.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{m.nombre}</p>
              <p className="text-sm text-stone-500">{formatCOP(m.costo_total)} · {formatCOP(m.precio)}</p>
            </div>
            <button onClick={() => eliminar(m.id)} className="text-sm text-stone-400">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}