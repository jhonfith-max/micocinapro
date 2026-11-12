"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [restaurante, setRestaurante] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // Nuevo estado de éxito

  const enviarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Insertamos los datos en la tabla 'leads' (Prospectos)
    const { error } = await supabase.from("leads").insert([
      { 
        restaurante, 
        whatsapp: telefono, 
        email 
      }
    ]);

    if (error) {
      setError("Hubo un error al enviar tus datos. Por favor intenta de nuevo.");
      setLoading(false);
      return;
    }

    // Mostramos la pantalla de éxito
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 font-sans" 
      style={{ 
        backgroundColor: "#FAF9F6",
        backgroundImage: "radial-gradient(circle, #E8E6E1 1px, transparent 1px)", 
        backgroundSize: "24px 24px" 
      }}
    >
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* LOGO */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="w-8 h-8 rounded bg-[#111827] flex items-center justify-center text-white text-sm font-bold shadow-md hover:scale-105 transition-transform">M</Link>
          <p className="text-sm font-semibold tracking-widest text-[#4A4A4A] uppercase">MiCocinaPro</p>
        </div>

        {/* TARJETA PRINCIPAL */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
          
          {/* Detalle humano (cinta) */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#FDFBF7]/80 backdrop-blur-sm border border-[#E5DEC9] shadow-sm opacity-90" style={{ clipPath: "polygon(2% 0, 98% 5%, 100% 100%, 0 95%)", transform: "rotate(-2deg)" }} />

          {!success ? (
            // FORMULARIO
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#111827]">Solicita tu acceso</h1>
                <p className="text-sm text-gray-500 mt-1">Déjanos tus datos y te contactamos por WhatsApp para activar tu cuenta.</p>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-medium">{error}</div>}

              <form onSubmit={enviarDatos} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre de tu restaurante</label>
                  <input 
                    required type="text" value={restaurante} onChange={(e) => setRestaurante(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                    placeholder="Ej. Pizzeria Trizza"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tu WhatsApp</label>
                  <input 
                    required type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                    placeholder="Ej. 300 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
                  <input 
                    required type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                    placeholder="chef@restaurante.com"
                  />
                </div>

                <button 
                  disabled={loading} 
                  className="w-full py-3 mt-2 rounded-lg text-white text-sm font-medium transition-all bg-[#4F46E5] hover:bg-[#4338CA] shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando datos..." : "Quiero mi acceso a MiCocinaPro"}
                </button>
              </form>
            </>
          ) : (
            // PANTALLA DE ÉXITO
            <div className="text-center py-8 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                <span className="text-2xl text-green-600">✓</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">¡Datos recibidos!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Gracias, <strong>{restaurante}</strong>. Nuestro equipo se pondrá en contacto contigo por WhatsApp al <strong>{telefono}</strong> en las próximas horas para darte tu acceso.
              </p>
              <Link href="/" className="inline-block px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                Volver al inicio
              </Link>
            </div>
          )}

          {!success && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                ¿Ya tienes tu cuenta activa? <Link href="/login" className="text-[#4F46E5] font-medium hover:underline">Entra aquí</Link>
              </p>
            </div>
          )}
        </div>

        {/* MENSAJE DE PAGO MANUAL */}
        {!success && (
          <div className="mt-6 text-center bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs text-indigo-900 leading-relaxed">
              Sin pasarelas de pago todavía. Nosotros te activamos la cuenta manualmente y te damos los métodos de pago (Nequi / Daviplata).
            </p>
          </div>
        )}

      </div>
    </div>
  );
}