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
    <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1C1B19] tracking-tight" style={{ fontFamily: "Playfair Display, serif" }}>Configuración</h1>
        <p className="text-sm text-[#6B6560] mt-1">Personaliza los datos que aparecerán en tu carta y recetario.</p>
      </div>
      
      <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E4DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <label className="block text-xs font-semibold text-[#6B6560] mb-2">Nombre del restaurante</label>
          <input 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
            className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E8E4DF] rounded-lg text-sm text-[#1C1B19] focus:bg-white focus:ring-2 focus:ring-[#C45C26]/20 focus:border-[#C45C26] focus:outline-none transition-colors" 
            placeholder="Ej. Pizzeria Trizza"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#6B6560] mb-2">Dirección</label>
          <input 
            value={direccion} 
            onChange={(e) => setDireccion(e.target.value)} 
            className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E8E4DF] rounded-lg text-sm text-[#1C1B19] focus:bg-white focus:ring-2 focus:ring-[#C45C26]/20 focus:border-[#C45C26] focus:outline-none transition-colors" 
            placeholder="Ej. Calle 13 #14b-9b"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#6B6560] mb-2">Logo de la marca</label>
          {logo && (
            <div className="mb-4 p-4 border border-[#E8E4DF] rounded-lg inline-block bg-[#F6F4F1]">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setArchivo(e.target.files?.[0] || null)} 
            className="w-full text-sm text-[#6B6560] file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#F6F4F1] file:text-[#1C1B19] hover:file:bg-[#E8E4DF] transition-colors" 
          />
        </div>
        
        <div className="pt-4 border-t border-[#E8E4DF]">
          <button 
            onClick={guardar} 
            disabled={guardando} 
            className="w-full sm:w-auto px-8 py-3 bg-[#C45C26] hover:bg-[#A34B1E] text-white text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}