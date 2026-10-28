"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConfiguracionPage() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [logo, setLogo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("nombre_restaurante, direccion, logo").eq("id", user.id).single();
      if (data) {
        setNombre(data.nombre_restaurante || "");
        setDireccion(data.direccion || "");
        setLogo(data.logo || "");
      }
    };
    load();
  }, []);

  const guardar = async () => {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let logoUrl = logo;
    if (archivo) {
      const nombreArchivo = `${user.id}/${Date.now()}.jpg`;
      await supabase.storage.from("recetas").upload(nombreArchivo, archivo);
      const { data } = supabase.storage.from("recetas").getPublicUrl(nombreArchivo);
      logoUrl = data.publicUrl;
    }
    await supabase.from("profiles").update({ nombre_restaurante: nombre, direccion, logo: logoUrl }).eq("id", user.id);
    setGuardando(false);
    alert("Guardado");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Configuración</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">Nombre del restaurante</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
        </div>
        <div>
          <label className="block text-sm text-stone-600 mb-1">Logo</label>
          {logo && <img src={logo} alt="" className="w-16 h-16 object-contain mb-2" />}
          <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
        <button onClick={guardar} disabled={guardando} className="px-6 py-3 bg-green-800 text-white rounded-xl">
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}