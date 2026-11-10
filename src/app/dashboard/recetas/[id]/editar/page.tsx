"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditarRecetaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState({
    nombre: "",
    instrucciones: "",
    alergenos: "",
    pcc: "",
    precio_venta: "",
    peso_porcion: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (data) {
        setForm({
          nombre: data.nombre || "",
          instrucciones: data.instrucciones || "",
          alergenos: data.alergenos || "",
          pcc: data.pcc || "",
          precio_venta: data.precio_venta || "",
          peso_porcion: data.peso_porcion || "",
        });
      }
    };
    load();
  }, [id]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from("recipes").update({
      nombre: form.nombre,
      instrucciones: form.instrucciones,
      alergenos: form.alergenos,
      pcc: form.pcc,
      precio_venta: form.precio_venta ? Number(form.precio_venta) : null,
      peso_porcion: form.peso_porcion ? Number(form.peso_porcion) : null,
    }).eq("id", id);
    setLoading(false);
    router.push("/dashboard/recetas");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Corregir receta</h1>
      <form onSubmit={guardar} className="space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">Nombre</label>
          <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2.5 border rounded-lg" />
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