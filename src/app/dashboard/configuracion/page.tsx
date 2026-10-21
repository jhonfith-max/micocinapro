"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Sugerencia = { id: string; mensaje: string; created_at: string };

export default function ConfiguracionPage() {
  const [mensaje, setMensaje] = useState("");
  const [avisos, setAvisos] = useState<Sugerencia[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("sugerencias").select("id, mensaje, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
    setAvisos(data || []);
  };

  useEffect(() => {
    cargar();
  }, []);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setLoading(true);
    setError(null);
    setAviso(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("No hay sesion activa");
      setLoading(false);
      return;
    }
    const { error: insertError } = await supabase.from("sugerencias").insert({
      user_id: user.id,
      mensaje: mensaje.trim(),
    });
    if (insertError) setError(insertError.message);
    else {
      setMensaje("");
      setAviso("Listo. Quedó guardada abajo.");
      cargar();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <p className="text-gray-600 mt-1 mb-6">Las sugerencias se guardan aquí, en tu cuenta. No se envían a un correo.</p>

      <form onSubmit={enviar} className="bg-white border rounded-xl p-6 space-y-3 mb-6">
        <label className="block text-sm font-medium">¿Qué le falta a la app, o qué cambiarías?</label>
        <p className="text-xs text-gray-500">Escríbelo como se lo dirías a un compañero.</p>
        <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={5} placeholder="Por ejemplo: no entendí el food cost del postre" className="w-full px-4 py-2.5 border rounded-lg" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {aviso && <p className="text-sm text-green-700">{aviso}</p>}
        <button disabled={loading} className="px-5 py-2.5 bg-green-700 text-white rounded-lg">{loading ? "Enviando..." : "Enviar sugerencia"}</button>
      </form>

      <div className="space-y-3">
        {avisos.map((item) => (
          <div key={item.id} className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-900">{item.mensaje}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(item.created_at).toLocaleString("es-CO")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}