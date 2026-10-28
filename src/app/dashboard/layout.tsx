"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/dashboard/ingredientes", label: "Ingredientes", icon: "📦" },
  { href: "/dashboard/rendimiento", label: "Pruebas", icon: "⚖️" },
  { href: "/dashboard/subrecetas", label: "Sub-recetas", icon: "🥣" },
  { href: "/dashboard/recetas", label: "Recetas", icon: "🍽️" },
  { href: "/dashboard/menus", label: "Corporativo", icon: "📋" },
  { href: "/dashboard/carta", label: "La carta", icon: "📄" },
  { href: "/dashboard/recetario", label: "Recetario", icon: "📚" },
  { href: "/dashboard/configuracion", label: "Configuración", icon: "⚙️" },
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
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${pathname === l.href ? "bg-green-800 text-white" : "text-stone-700 hover:bg-stone-100"}`}>
              <span>{l.icon}</span>
              <span>{l.label}</span>
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