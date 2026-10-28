"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; costo_total: number; es_preparacion: boolean };
type Menu = { id: string; nombre: string; costo_total: number; precio: number; entrada_id: string; fuerte_id: string; guarnicion_id: string };

export default function MenusPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [paso, setPaso] = useState(1);
  const [editando, setEditando] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [entradas, setEntradas] = useState<string[]>([]);
  const [fuertes, setFuertes] = useState<string[]>([]);
  const [guarniciones, setGuarniciones] = useState<string[]>([]);
  const [postre, setPostre] = useState("");
  const [bebida, setBebida] = useState("");
  const [precio, setPrecio] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarOpcional, setMostrarOpcional] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: recs } = await supabase.from("recipes").select("id, nombre, costo_total, es_preparacion").eq("user_id", user.id);
      const { data: mens } = await supabase.from("menus_corporativos").select("*").eq("user_id", user.id);
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
    const datos = {
      user_id: user.id,
      nombre,
      entrada_id: entradas.join(","),
      fuerte_id: fuertes.join(","),
      guarnicion_id: guarniciones.join(","),
      postre_id: postre || null,
      bebida_id: bebida || null,
      precio: parseFloat(precio || "0"),
      costo_total: costoTotal,
      foto: fotoUrl,
    };
    if (editando) {
      await supabase.from("menus_corporativos").update(datos).eq("id", editando);
    } else {
      await supabase.from("menus_corporativos").insert(datos);
    }
    setMostrarForm(false);
    setEditando(null);
    window.location.reload();
  };

  const editar = (m: Menu) => {
    setEditando(m.id);
    setNombre(m.nombre);
    setEntradas(m.entrada_id ? m.entrada_id.split(",") : []);
    setFuertes(m.fuerte_id ? m.fuerte_id.split(",") : []);
    setGuarniciones(m.guarnicion_id ? m.guarnicion_id.split(",") : []);
    setPrecio(String(m.precio));
    setMostrarForm(true);
    setPaso(1);
  };

  const eliminar = async (id: string) => {
    await supabase.from("menus_corporativos").delete().eq("id", id);
    setMenus((prev) => prev.filter((m) => m.id !== id));
  };

  if (mostrarForm) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${paso >= n ? "bg-green-800 text-white" : "bg-stone-200 text-stone-500"}`}>{n}</div>
          ))}
        </div>
        <h1 className="text-2xl font-semibold mb-2">{editando ? "Editar" : "Nuevo"} menú corporativo</h1>
        <p className="text-sm text-stone-500 mb-4">Paso {paso} de 4</p>

        {paso === 1 && (
          <div className="space-y-4">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del menú" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              Si las cantidades son diferentes a la carta, crea un plato nuevo.
            </div>
            <a href="/dashboard/recetas/nueva" className="inline-block px-4 py-2 bg-green-800 text-white text-sm rounded-xl">+ Crear plato</a>
            <button onClick={() => setPaso(2)} className="block w-full px-4 py-3 bg-green-800 text-white rounded-xl">Siguiente</button>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-4">
              <p className="font-medium mb-2">Entrada</p>
              <select onChange={(e) => e.target.value && !entradas.includes(e.target.value) && setEntradas([...entradas, e.target.value])} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
                <option value="">Agregar entrada</option>
                {recipes.filter((r) => r.es_preparacion).map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {entradas.map((id) => <p key={id} className="text-sm mt-2">{recipes.find((r) => r.id === id)?.nombre} <button onClick={() => setEntradas(entradas.filter((x) => x !== id))} className="text-red-500">×</button></p>)}
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4">
              <p className="font-medium mb-2">Plato fuerte</p>
              <select onChange={(e) => e.target.value && !fuertes.includes(e.target.value) && setFuertes([...fuertes, e.target.value])} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
                <option value="">Agregar fuerte</option>
                {recipes.filter((r) => !r.es_preparacion).map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {fuertes.map((id) => <p key={id} className="text-sm mt-2">{recipes.find((r) => r.id === id)?.nombre} <button onClick={() => setFuertes(fuertes.filter((x) => x !== id))} className="text-red-500">×</button></p>)}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPaso(1)} className="px-4 py-3 border rounded-xl">Anterior</button>
              <button onClick={() => setPaso(3)} className="px-4 py-3 bg-green-800 text-white rounded-xl">Siguiente</button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="space-y-4">
            <button onClick={() => setMostrarOpcional(!mostrarOpcional)} className="text-sm text-green-800">
              {mostrarOpcional ? "Ocultar" : "Agregar"} guarnición, postre o bebida
            </button>
            {mostrarOpcional && (
              <>
                <div className="bg-white border border-stone-200 rounded-2xl p-4">
                  <p className="font-medium mb-2">Guarnición</p>
                  <select onChange={(e) => e.target.value && !guarniciones.includes(e.target.value) && setGuarniciones([...guarniciones, e.target.value])} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
                    <option value="">Agregar</option>
                    {recipes.filter((r) => r.es_preparacion).map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                  {guarniciones.map((id) => <p key={id} className="text-sm mt-2">{recipes.find((r) => r.id === id)?.nombre} <button onClick={() => setGuarniciones(guarniciones.filter((x) => x !== id))} className="text-red-500">×</button></p>)}
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-4">
                  <p className="font-medium mb-2">Postre</p>
                  <select value={postre} onChange={(e) => setPostre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
                    <option value="">Elegir</option>
                    {recipes.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl p-4">
                  <p className="font-medium mb-2">Bebida</p>
                  <select value={bebida} onChange={(e) => setBebida(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm">
                    <option value="">Elegir</option>
                    {recipes.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="flex gap-3">
              <button onClick={() => setPaso(2)} className="px-4 py-3 border rounded-xl">Anterior</button>
              <button onClick={() => setPaso(4)} className="px-4 py-3 bg-green-800 text-white rounded-xl">Siguiente</button>
            </div>
          </div>
        )}

        {paso === 4 && (
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-2xl p-4 space-y-1 text-sm">
              <p className="font-medium mb-2">Resumen</p>
              {entradas.map((id) => <p key={id}>Entrada: {recipes.find((r) => r.id === id)?.nombre}</p>)}
              {fuertes.map((id) => <p key={id}>Fuerte: {recipes.find((r) => r.id === id)?.nombre}</p>)}
              {guarniciones.map((id) => <p key={id}>Guarnición: {recipes.find((r) => r.id === id)?.nombre}</p>)}
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4">
              <p className="font-medium mb-2">Precio del menú</p>
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="35000" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4">
              <label className="block text-sm text-stone-600 mb-1.5">Foto</label>
              <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
            {costoTotal > 0 && (
              <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Costo de platos</span><span>{formatCOP(Math.round(costoBase))}</span></div>
                <div className="flex justify-between"><span>Contingencia 7% <span className="text-xs text-stone-400">(extra por merma y personas que no llegan)</span></span><span>{formatCOP(contingencia)}</span></div>
                <div className="flex justify-between border-t border-stone-200 pt-2"><span>Costo total</span><span className="font-medium">{formatCOP(costoTotal)}</span></div>
                <div className="flex justify-between"><span>Precio recomendado (32%)</span><span className="font-semibold">{formatCOP(precioRecomendado)}</span></div>
                {precio && <div className="flex justify-between"><span>Food cost</span><span className={foodCost > 32 ? "text-red-600" : "text-green-700"}>{foodCost}%</span></div>}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setPaso(3)} className="px-4 py-3 border rounded-xl">Anterior</button>
              <button onClick={guardar} className="px-4 py-3 bg-green-800 text-white rounded-xl">Guardar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-green-800">Si haces almuerzos</p>
      <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Corporativo</h1>
      <p className="text-stone-500 mt-1 text-sm">Entrada, fuerte y bebida. Un solo precio.</p>
      <button onClick={() => { setMostrarForm(true); setEditando(null); setNombre(""); setEntradas([]); setFuertes([]); setGuarniciones([]); setPaso(1); }} className="mt-4 px-4 py-2 bg-green-800 text-white text-sm rounded-xl">+ Nuevo menú</button>
      <div className="mt-6 space-y-3">
        {menus.map((m) => (
          <div key={m.id} className="bg-white border border-stone-200 rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{m.nombre}</p>
                <p className="text-sm text-stone-500">Costo: {formatCOP(m.costo_total)}</p>
                <p className="text-sm text-stone-500">Precio: {formatCOP(m.precio)}</p>
              </div>
              <div className="flex gap-2">
                <a href={"/dashboard/menus/" + m.id} className="text-sm text-green-800">Ver ficha</a>
                <button onClick={() => editar(m)} className="text-sm text-green-800">Editar</button>
                <button onClick={() => eliminar(m.id)} className="text-sm text-stone-400">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}