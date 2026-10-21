"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Ingredient = {
  id: string;
  nombre: string;
  unidad_compra: string;
  precio_compra: number;
  cantidad_compra: number;
  precio_por_unidad: number;
};

function precioCocina(item: Ingredient) {
  const unidad = (item.unidad_compra || "").toLowerCase();
  if (unidad === "kg") {
    return { precio: item.precio_por_unidad / 1000, unidad: "g" };
  }
  if (unidad === "g") {
    return { precio: item.precio_por_unidad, unidad: "g" };
  }
  if (unidad === "litro" || unidad === "l") {
    return { precio: item.precio_por_unidad / 1000, unidad: "ml" };
  }
  if (unidad === "ml") {
    return { precio: item.precio_por_unidad, unidad: "ml" };
  }
  return { precio: item.precio_por_unidad, unidad: "unidad" };
}

export default function ImprimirIngredientesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("No hay sesion activa");
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("ingredients")
        .select("*")
        .eq("user_id", user.id)
        .order("nombre");
      if (fetchError) setError(fetchError.message);
      else setItems(data || []);
    };
    load();
  }, []);

  if (error) return <div className="p-6 text-red-700">{error}</div>;

  return (
    <div className="max-w-3xl bg-white border rounded-xl p-8">
      <div className="flex justify-between mb-6 print:hidden">
        <button onClick={() => router.push("/dashboard/ingredientes")} className="text-sm text-gray-500">
          Volver a ingredientes
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg">
          Descargar PDF
        </button>
      </div>
      <p className="text-xs uppercase tracking-wide text-gray-500">Listado del restaurante</p>
      <h1 className="text-2xl font-bold mb-2">Todos los ingredientes</h1>
      <p className="text-gray-600 mb-6">{items.length} productos · precio para cocina en gramos o ml</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Producto</th>
            <th className="py-2">Como se compra</th>
            <th className="py-2">Precio compra</th>
            <th className="py-2">Precio en cocina</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const cocina = precioCocina(item);
            return (
              <tr key={item.id} className="border-b">
                <td className="py-2 font-medium">{item.nombre}</td>
                <td className="py-2">{item.cantidad_compra} {item.unidad_compra}</td>
                <td className="py-2">{formatCOP(item.precio_compra)}</td>
                <td className="py-2 font-medium">{formatCOP(cocina.precio)} / {cocina.unidad}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}