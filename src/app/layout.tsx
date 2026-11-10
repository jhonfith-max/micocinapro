"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", nombre: "Inicio" },
  { href: "/dashboard/ingredientes", nombre: "Ingredientes" },
  { href: "/dashboard/rendimientos", nombre: "Pruebas" },
  { href: "/dashboard/subrecetas", nombre: "Sub-recetas" },
  { href: "/dashboard/recetas", nombre: "Recetas" },
  { href: "/dashboard/menus", nombre: "Corporativo" },
  { href: "/dashboard/carta", nombre: "La carta" },
  { href: "/dashboard/recetario", nombre: "Recetario" },
  { href: "/dashboard/configuracion", nombre: "Configuración" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <aside className={`print:hidden fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-stone-200 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="p-4 border-b border-stone-100">
          <p className="font-semibold">MiCocinaPro</p>
        </div>
        <nav className="p-2 space-y-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${pathname === l.href ? "bg-green-800 text-white" : "text-stone-700 hover:bg-stone-100"}`}>
              {l.nombre}
            </Link>
          ))}
        </nav>
        <button onClick={() => setOpen(false)} className="lg:hidden absolute top-4 right-4 text-stone-400">×</button>
      </aside>
      <div className="flex-1">
        <header className="print:hidden lg:hidden p-4 border-b border-stone-200">
          <button onClick={() => setOpen(true)} className="text-stone-600">☰</button>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}