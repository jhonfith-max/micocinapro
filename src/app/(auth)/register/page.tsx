"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-1">MiCocinaPro</h1>
        <p className="text-stone-500 text-sm mb-8">Crea tu cuenta.</p>
        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">Correo</label>
            <input id="email" required type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">Contraseña</label>
            <input id="password" required type="password" minLength={6} value={form.password} onChange={handleChange} className="w-full px-4 py-3 border border-stone-200 rounded-xl" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full py-3.5 bg-green-800 text-white rounded-xl">{loading ? "Creando..." : "Crear cuenta"}</button>
        </form>
        <p className="text-sm text-stone-500 mt-4 text-center">
          ¿Ya tienes cuenta? <a href="/login" className="text-green-800">Entra</a>
        </p>
      </div>
    </div>
  );
}