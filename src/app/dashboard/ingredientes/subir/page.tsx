"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function precioPorUnidad(precio: number, cantidad: number) {
  if (!cantidad) return precio;
  return precio / cantidad;
}

export default function SubirIngredientesPage() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setMensaje(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("No hay sesion activa");
        setLoading(false);
        return;
      }
      const text = await file.text();
      const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
      const rows = lines.slice(1);
      const payload = rows.map((line) => {
        const [nombre, unidad, precio, cantidad] = line.split(";").map((c) => c.trim());
        const precioCompra = Number(precio);
        const cantidadCompra = Number(cantidad) || 1;
        return {
          user_id: user.id,
          nombre,
          unidad_compra: unidad || "kg",
          precio_compra: precioCompra,
          cantidad_compra: cantidadCompra,
          precio_por_unidad: precioPorUnidad(precioCompra, cantidadCompra),
        };
      }).filter((row) => row.nombre && !Number.isNaN(row.precio_compra));

      if (payload.length === 0) {
        setError("No encontre ingredientes. Revisa que el archivo tenga nombre, unidad, precio y cantidad.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("ingredients").insert(payload);
      if (insertError) setError(insertError.message);
      else {
        setMensaje("Se cargaron " + payload.length + " ingredientes.");
        setTimeout(() => router.push("/dashboard/ingredientes"), 800);
      }
    } catch {
      setError("No se pudo leer el archivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-sm text-green-700 font-medium">Paso 1 de 4</p>
      <h1 className="text-2xl font-bold mb-2">Subir ingredientes</h1>
      <p className="text-gray-600 mb-6">
        Descarga la plantilla, llenala en Excel y subela. Una fila por producto.
      </p>
      <a href="/dashboard/ingredientes" className="text-sm text-gray-500">Volver</a>
      <div className="bg-white border rounded-xl p-6 mt-4 space-y-4">
        <p className="text-sm text-gray-700">
          Columnas, separadas por punto y coma: nombre; unidad; precio; cantidad. Unidad: kg, g, litro, ml o unidad.
        </p>
        <p className="text-sm text-gray-500">Ejemplo: cebolla; kg; 7000; 1</p>
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="block w-full text-sm"
        />
        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {mensaje && <p className="text-sm text-green-700">{mensaje}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}