"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = { id: string; nombre: string; costo_total: number };

export default function MenusPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [nombre, setNombre] = useState("");
  const [entrada, setEntrada] = useState("");
  const [fuerte, setFuerte] = useState("");
  const [guarnicion, setGuarnicion] = useState("");
  const [postre, setPostre] = useState("");
  const [bebida, setBebida] = useState("");
  const [precio, setPrecio] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("recipes").select("id, nombre, costo_total").eq("user_id", user.id).eq("es_preparacion", false);
      setRecipes(data || []);
    };
    load();
  }, []);

  const costo = (id: string) => recipes.find((r) => r.id === id)?.costo_total || 0;
  const costoBase = costo(entrada) + costo(fuerte) + costo(guarnicion) + costo(postre) + costo(bebida);
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
      entrada_id: entrada || null,
      fuerte_id: fuerte || null,
      guarnicion_id: guarnicion || null,
      postre_id: postre || null,
      bebida_id: bebida || null,
      precio: parseFloat(precio || "0"),
      costo_total: costoTotal,
      foto: fotoUrl,
    });
    setGuardado(true);
  };

  if (guardado) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">{nombre}</h1>
        {foto && <img src={URL.createObjectURL(foto)} alt="" className="w-full max-h-48 object-cover rounded-2xl mb-4" />}
        <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Costo total</span><span>{formatCOP(costoTotal)}</span></div>
          <div className="flex justify-between"><span>Precio</span><span>{formatCOP(parseFloat(precio || "0"))}</span></div>
          <div className="flex justify-between"><span>Food cost</span><span>{foodCost}%</span></div>
          <div className="flex justify-between"><span>Recomendado</span><span>{formatCOP(precioRecomendado)}</span></div>
        </div>
        <button onClick={() => setGuardado(false)} className="mt-4 px-4 py-2 border rounded-xl text-sm">Crear otro</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-green-800">Si haces almuerzos</p>
      <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Corporativo</h1>
      <p className="text-stone-500 mt-1 text-sm">Entrada, fuerte y bebida. Un solo precio.</p>
      <div className="mt-6 space-y-4">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del menú" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        {[
          { label: "1. Entrada o sopa", value: entrada, set: setEntrada },
          { label: "2. Plato fuerte", value: fuerte, set: setFuerte },
          { label: "3. Guarnición (opcional)", value: guarnicion, set: setGuarnicion },
          { label: "4. Postre (opcional)", value: postre, set: setPostre },
          { label: "5. Bebida", value: bebida, set: setBebida },
        ].map((step) => (
          <div key={step.label} className="bg-white border border-stone-200 rounded-2xl p-4">
            <p className="font-medium mb-2">{step.label}</p>
            <select value={step.value} onChange={(e) => step.set(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm bg-white">
              <option value="">Elegir</option>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre} · {formatCOP(r.costo_total)}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <p className="font-medium mb-2">Precio del menú</p>
          <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="35000" className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <label className="block text-sm text-stone-600 mb-1.5">Foto del menú</label>
          <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
        {costoTotal > 0 && (
          <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Costo de platos</span><span>{formatCOP(Math.round(costoBase))}</span></div>
            <div className="flex justify-between"><span>Contingencia 7%</span><span>{formatCOP(contingencia)}</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-2"><span>Costo total</span><span className="font-medium">{formatCOP(costoTotal)}</span></div>
            <div className="flex justify-between"><span>Precio recomendado (32%)</span><span className="font-semibold">{formatCOP(precioRecomendado)}</span></div>
            {precio && <div className="flex justify-between"><span>Food cost</span><span className={foodCost > 32 ? "text-red-600" : "text-green-700"}>{foodCost}%</span></div>}
          </div>
        )}
        <button onClick={guardar} className="px-6 py-3 bg-green-800 text-white rounded-xl">Guardar menú</button>
      </div>
    </div>
  );
}