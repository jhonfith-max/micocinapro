"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Menu = { id: string; nombre: string; costo_total: number; precio: number; foto: string | null };

export default function MenuFichaPage() {
  const [menu, setMenu] = useState<Menu | null>(null);

  useEffect(() => {
    const load = async () => {
      const id = window.location.pathname.split("/")[3];
      const { data } = await supabase.from("menus_corporativos").select("*").eq("id", id).single();
      setMenu(data);
    };
    load();
  }, []);

  if (!menu) return <div className="p-6">Cargando...</div>;

  const foodCost = Math.round((menu.costo_total / menu.precio) * 100);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-semibold">{menu.nombre}</h1>
        <button onClick={() => window.print()} className="px-4 py-2 border border-stone-200 rounded-xl text-sm print:hidden">Descargar PDF</button>
      </div>
      {menu.foto && <img src={menu.foto} alt="" className="w-full max-h-48 object-cover rounded-2xl mb-6" />}
      <div className="bg-stone-50 rounded-2xl p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Costo total</span><span>{formatCOP(menu.costo_total)}</span></div>
        <div className="flex justify-between"><span>Precio</span><span>{formatCOP(menu.precio)}</span></div>
        <div className="flex justify-between"><span>Food cost</span><span>{foodCost}%</span></div>
      </div>
    </div>
  );
}