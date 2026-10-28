"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/dashboard/ingredientes", label: "Ingredientes" },
  { href: "/dashboard/rendimiento", label: "Pruebas" },
  { href: "/dashboard/subrecetas", label: "Sub-recetas" },
  { href: "/dashboard/recetas", label: "Recetas" },
  { href: "/dashboard/menus", label: "Corporativo" },
  { href: "/dashboard/carta", label: "La carta" },
  { href: "/dashboard/recetario", label: "Recetario" },
  { href: "/dashboard/configuracion", label: "Configuración" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <aside className={`print:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="p-4">
          <p className="font-semibold text-lg">MiCocinaPro</p>
        </div>
        <nav className="px-2 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${pathname === l.href ? "bg-green-800 text-white" : "text-stone-700 hover:bg-stone-100"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => setOpen(false)} className="lg:hidden absolute top-4 right-4 text-stone-400">×</button>
      </aside>
      <div className="flex-1 lg:ml-0">
        <header className="print:hidden lg:hidden p-4 border-b border-stone-200">
          <button onClick={() => setOpen(true)} className="text-stone-600">☰</button>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}