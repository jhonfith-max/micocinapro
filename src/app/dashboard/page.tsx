"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const tecla = "block bg-white border border-[#E8E4DF] rounded-2xl p-5 shadow-[0_4px_0_0_#E8E4DF] active:translate-y-1 active:shadow-none transition-all";

export default function DashboardPage() {
  const [counts, setCounts] = useState({ productos: 0, pruebas: 0, sub: 0, recetas: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [ing, tests, subs, rec] = await Promise.all([
        supabase.from("ingredients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("yield_tests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("es_preparacion", true),
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("es_preparacion", false),
      ]);
      setCounts({ productos: ing.count || 0, pruebas: tests.count || 0, sub: subs.count || 0, recetas: rec.count || 0 });
    };
    load();
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-semibold">Costea tu carta en orden</h1>
      <p className="text-[#6B6560] mt-1 mb-8 text-sm">Empieza por lo que compras. Luego pesa lo que se pierde. Así sabes el costo real de cada plato.</p>
      <div className="space-y-3">
        <a href="/dashboard/ingredientes" className={tecla}>
          <p className="text-xs text-[#C45C26]">Paso 1</p>
          <div className="flex justify-between items-baseline"><p className="font-medium">Carga lo que compras</p><p className="text-[#6B6560] text-sm">{counts.productos}</p></div>
          <p className="text-sm text-[#6B6560]">El costo empieza en la factura.</p>
        </a>
        <a href="/dashboard/rendimientos" className={tecla}>
          <p className="text-xs text-[#C45C26]">Paso 2</p>
          <div className="flex justify-between items-baseline"><p className="font-medium">Pesa lo que se pierde</p><p className="text-[#6B6560] text-sm">{counts.pruebas}</p></div>
          <p className="text-sm text-[#6B6560]">Lo que se pierde también se paga.</p>
        </a>
        <a href="/dashboard/subrecetas" className={tecla}>
          <p className="text-xs text-[#C45C26]">Paso 3</p>
          <div className="flex justify-between items-baseline"><p className="font-medium">Arma la salsa o la guarnición</p><p className="text-[#6B6560] text-sm">{counts.sub}</p></div>
          <p className="text-sm text-[#6B6560]">Las salsas y bases tienen costo.</p>
        </a>
        <a href="/dashboard/recetas" className={tecla}>
          <p className="text-xs text-[#C45C26]">Paso 4</p>
          <div className="flex justify-between items-baseline"><p className="font-medium">Costea cocina y barra</p><p className="text-[#6B6560] text-sm">{counts.recetas}</p></div>
          <p className="text-sm text-[#6B6560]">El plato completo, con todo.</p>
        </a>
        <a href="/dashboard/menus" className={tecla}>
          <p className="text-xs text-[#C45C26]">Si haces almuerzos</p>
          <p className="font-medium">Arma el menú corporativo</p>
          <p className="text-sm text-[#6B6560]">Un menú con varios platos. Un solo precio.</p>
        </a>
        <a href="/dashboard/carta" className={tecla}>
          <p className="text-xs text-[#C45C26]">Al final</p>
          <p className="font-medium">Mira e imprime la carta</p>
          <p className="text-sm text-[#6B6560]">Tu oferta lista para imprimir o compartir.</p>
        </a>
      </div>
    </div>
  );
}