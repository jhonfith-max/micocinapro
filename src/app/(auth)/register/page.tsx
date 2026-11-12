"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurante, setRestaurante] = useState("");
  const [telefono, setTelefono] = useState(""); // Nuevo estado para el celular
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // 1. Creamos el usuario en Supabase con el teléfono incluido
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { 
          nombre_restaurante: restaurante,
          telefono: telefono 
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // 2. Si todo sale bien, lo enviamos al dashboard
    if (data.user) {
      router.push("/dashboard");
    }
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

        {/* TARJETA DE REGISTRO */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative">
          
          {/* Detalle humano (cinta) */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#FDFBF7]/80 backdrop-blur-sm border border-[#E5DEC9] shadow-sm opacity-90" style={{ clipPath: "polygon(2% 0, 98% 5%, 100% 100%, 0 95%)", transform: "rotate(-2deg)" }} />

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#111827]">Crea tu cuenta</h1>
            <p className="text-sm text-gray-500 mt-1">Empieza a costear como un chef.</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-medium">{error}</div>}

          <form onSubmit={registrar} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre de tu restaurante</label>
              <input 
                required 
                type="text" 
                value={restaurante} 
                onChange={(e) => setRestaurante(e.target.value)} 
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                placeholder="Ej. Pizzeria Trizza"
              />
            </div>

            {/* NUEVO CAMPO: TELÉFONO */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                WhatsApp <span className="text-gray-400 font-normal">(para activar tu cuenta rápido)</span>
              </label>
              <input 
                required 
                type="tel" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} 
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                placeholder="Ej. 300 123 4567"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                placeholder="chef@restaurante.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] focus:outline-none transition-colors" 
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <button 
              disabled={loading} 
              className="w-full py-3 mt-2 rounded-lg text-white text-sm font-medium transition-all bg-[#4F46E5] hover:bg-[#4338CA] shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              ¿Ya tienes una cuenta? <Link href="/login" className="text-[#4F46E5] font-medium hover:underline">Entra aquí</Link>
            </p>
          </div>
        </div>

        {/* MENSAJE DE PAGO MANUAL (Actualizado para mencionar el WhatsApp) */}
        <div className="mt-6 text-center bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs text-indigo-900 leading-relaxed">
            <strong>Nota de lanzamiento:</strong> Al crear tu cuenta, te escribiremos a tu <strong>WhatsApp</strong> para activar tu prueba y darte los métodos de pago (Nequi / Daviplata).
          </p>
        </div>

      </div>
    </div>
  );
}