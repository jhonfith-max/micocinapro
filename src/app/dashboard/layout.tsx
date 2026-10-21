"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const LINKS = [
  { href: "/dashboard", nombre: "Inicio", icono: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard/ingredientes", nombre: "Ingredientes", icono: "M4 6h16M4 12h16M4 18h7" },
  { href: "/dashboard/rendimientos", nombre: "Pruebas", icono: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
  { href: "/dashboard/subrecetas", nombre: "Sub-recetas", icono: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { href: "/dashboard/recetas", nombre: "Recetas", icono: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/menus", nombre: "Corporativo", icono: "M4 6h16v4H4zM4 12h10M4 16h16" },
  { href: "/dashboard/carta", nombre: "La carta", icono: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/dashboard/recetario", nombre: "Recetario", icono: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/dashboard/configuracion", nombre: "Configuración", icono: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setNombre(user.email || "");
    };
    load();
  }, []);

  useEffect(() => { setAbierto(false); }, [pathname]);

  const salir = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const menu = (
    <nav className="flex-1 py-4 space-y-1">
      {LINKS.map((link) => {
        const activo = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        return (
          <a key={link.href} href={link.href} className={"flex items-center gap-3 px-4 py-3 rounded-xl mx-2 " + (activo ? "bg-green-800 text-white" : "text-stone-700 hover:bg-stone-100")}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icono} />
            </svg>
            <span className="text-sm">{link.nombre}</span>
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30">
        <button onClick={() => setAbierto(true)} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold">MiCocinaPro</span>
        <div className="w-10" />
      </div>
      {abierto && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAbierto(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100">
              <span className="font-semibold">MiCocinaPro</span>
              <button onClick={() => setAbierto(false)} className="p-2 text-stone-400">Cerrar</button>
            </div>
            {menu}
            <button onClick={salir} className="mx-4 mb-4 text-sm text-stone-400 text-left">Cerrar sesión</button>
          </div>
        </div>
      )}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-stone-200 flex-col z-20">
        <div className="px-4 py-5 font-semibold">MiCocinaPro</div>
        {menu}
        <button onClick={salir} className="mx-4 mb-4 text-sm text-stone-400 text-left">{nombre ? "Cerrar sesión" : "Salir"}</button>
      </aside>
      <main className="lg:ml-56 p-4 lg:p-8">{children}</main>
    </div>
  );
}