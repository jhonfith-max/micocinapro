"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCOP } from "@/lib/utils";

type Recipe = {
  id: string;
  nombre: string;
  instrucciones: string | null;
  es_preparacion: boolean;
  costo_porcion?: number;
  precio_venta?: number;
  costo_total?: number;
  porciones?: number;
  alergenos?: string | null;
  pcc?: string | null;
  peso_porcion?: number | null;
  foto?: string | null;
};
type Ing = { nombre: string; cantidad: number; unidad: string; costo: number; merma: number };
type Sub = { nombre: string; cantidad: number; costo: number };

export default function RecetarioPage() {
  const [recetas, setRecetas] = useState<Recipe[]>([]);
  const [ingredientes, setIngredientes] = useState<Record<string, Ing[]>>({});
  const [subrecetas, setSubrecetas] = useState<Record<string, Sub[]>>({});
  const [vista, setVista] = useState<"cocina" | "costeo">("cocina");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: recipes } = await supabase
        .from("recipes")
        .select("id, nombre, instrucciones, es_preparacion, costo_porcion, precio_venta, costo_total, porciones, alergenos, pcc, peso_porcion, foto")
        .eq("user_id", user.id);
      setRecetas(recipes || []);

      if (!recipes || recipes.length === 0) return;

      const ids = recipes.map((r) => r.id);

      const { data: ings } = await supabase
        .from("recipe_ingredients")
        .select("recipe_id, cantidad, unidad, costo, ingredient_id, ingredients(nombre)")
        .in("recipe_id", ids);

      const { data: yields } = await supabase
        .from("yield_tests")
        .select("ingredient_id, porcentaje_rendimiento")
        .eq("user_id", user.id);

      const yieldMap: Record<string, number> = {};
      yields?.forEach((y: any) => {
        yieldMap[y.ingredient_id] = y.porcentaje_rendimiento || 0;
      });

      const mapIng: Record<string, Ing[]> = {};
      if (ings) {
        ings.forEach((row: any) => {
          const rid = row.recipe_id;
          if (!mapIng[rid]) mapIng[rid] = [];
          const merma = yieldMap[row.ingredient_id] ? 100 - yieldMap[row.ingredient_id] : 0;
          mapIng[rid].push({
            nombre: row.ingredients?.nombre || "Ingrediente",
            cantidad: Number(row.cantidad) || 0,
            unidad: row.unidad || "",
            costo: Number(row.costo) || 0,
            merma,
          });
        });
      }
      setIngredientes(mapIng);

      const { data: subs } = await supabase
        .from("recipe_components")
        .select("recipe_id, cantidad, component_recipe_id")
        .in("recipe_id", ids);

      const subIds = subs?.map((s: any) => s.component_recipe_id).filter(Boolean) || [];
      const { data: subRecipes } = subIds.length
        ? await supabase.from("recipes").select("id, nombre, costo_porcion").in("id", subIds)
        : { data: [] };

      const subNameMap: Record<string, string> = {};
      const subCostoMap: Record<string, number> = {};
      subRecipes?.forEach((s: any) => {
        subNameMap[s.id] = s.nombre;
        subCostoMap[s.id] = s.costo_porcion || 0;
      });

      const mapSub: Record<string, Sub[]> = {};
      if (subs) {
        subs.forEach((row: any) => {
          const rid = row.recipe_id;
          if (!mapSub[rid]) mapSub[rid] = [];
          const costoActual = (subCostoMap[row.component_recipe_id] || 0) * (Number(row.cantidad) || 1);
          const costoFinal = costoActual * 1.08;
          mapSub[rid].push({
            nombre: subNameMap[row.component_recipe_id] || "Subreceta",
            cantidad: Number(row.cantidad) || 0,
            costo: costoFinal,
          });
        });
      }
      setSubrecetas(mapSub);
    };
    load();
  }, []);

  const foodCost = (r: Recipe) => r.precio_venta && r.costo_total ? Math.round((r.costo_total / r.precio_venta) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <style>{`@media print { aside, nav, header, button, .no-print { display: none !important; } body, html { margin: 0; padding: 0; background: white; } main { margin: 0; padding: 12mm; width: 100%; } .ficha { page-break-inside: avoid; } }`}</style>

      <div className="no-print flex justify-between items-center mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-green-800">Recetario</p>
          <h1 className="text-2xl font-semibold">Fichas técnicas</h1>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 border rounded-lg text-sm">Imprimir</button>
      </div>
      <div className="no-print flex gap-2 mb-6">
        <button onClick={() => setVista("cocina")} className={`px-4 py-2 rounded-full text-sm ${vista === "cocina" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Ficha de cocina</button>
        <button onClick={() => setVista("costeo")} className={`px-4 py-2 rounded-full text-sm ${vista === "costeo" ? "bg-green-800 text-white" : "bg-stone-100"}`}>Ficha de costeo</button>
      </div>

      <div className="space-y-8">
        {recetas.map((r) => {
          const ings = ingredientes[r.id] || [];
          const subs = subrecetas[r.id] || [];
          const pesoNeta = ings.reduce((s, i) => s + i.cantidad, 0);
          const subtotalIng = ings.reduce((s, i) => s + (i.costo || 0), 0);
          const subtotalSub = subs.reduce((s, i) => s + (i.costo || 0), 0);
          const subtotal = subtotalIng + subtotalSub;
          const indirecto = subtotal * 0.08;
          const total = subtotal + indirecto;
          return (
            <div key={r.id} className="ficha border border-stone-300 p-6 bg-white text-sm">
              {r.foto && <img src={r.foto} alt="" className="w-full max-h-48 object-cover rounded mb-4" />}
              <div className="flex justify-between border-b border-stone-300 pb-3 mb-4">
                <div>
                  <p className="text-xs text-stone-500">{r.es_preparacion ? "SUB-RECETA" : "PLATO"}</p>
                  <h2 className="text-xl font-semibold mt-1">{r.nombre}</h2>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <p>Código: {r.id.slice(0, 8).toUpperCase()}</p>
                  <p>Porciones: {r.porciones || 1}</p>
                  <p>Peso final aprox.: {pesoNeta} g</p>
                </div>
              </div>

              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-stone-300 text-stone-500">
                    <th className="text-left py-1">Ingrediente / Subreceta</th>
                    <th className="text-right">Cant. Neta</th>
                    <th className="text-right">Unidad</th>
                    <th className="text-right">Merma</th>
                    <th className="text-right">Cant. Bruta</th>
                    {vista === "costeo" && <th className="text-right">Costo</th>}
                  </tr>
                </thead>
                <tbody>
                  {ings.map((ing, i) => {
                    const bruta = ing.merma > 0 ? Math.round(ing.cantidad / (1 - ing.merma / 100)) : ing.cantidad;
                    return (
                      <tr key={"i" + i} className="border-b border-stone-100">
                        <td className="py-1">{ing.nombre}</td>
                        <td className="text-right">{ing.cantidad}</td>
                        <td className="text-right">{ing.unidad}</td>
                        <td className="text-right">{ing.merma > 0 ? ing.merma + "%" : "-"}</td>
                        <td className="text-right">{bruta}</td>
                        {vista === "costeo" && <td className="text-right">{formatCOP(ing.costo)}</td>}
                      </tr>
                    );
                  })}
                  {subs.map((sub, i) => (
                    <tr key={"s" + i} className="border-b border-stone-100">
                      <td className="py-1">{sub.nombre}</td>
                      <td className="text-right">{sub.cantidad}</td>
                      <td className="text-right">porción</td>
                      <td className="text-right">-</td>
                      <td className="text-right">-</td>
                      {vista === "costeo" && <td className="text-right">{formatCOP(sub.costo)}</td>}
                    </tr>
                  ))}
                  {ings.length === 0 && subs.length === 0 && (
                    <tr><td colSpan={6} className="py-2 text-stone-400">Sin ingredientes</td></tr>
                  )}
                </tbody>
              </table>

              {vista === "costeo" && (
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-stone-300 pt-3">
                  <div>
                    <p>Subtotal materia prima: <span className="font-medium">{formatCOP(subtotal)}</span></p>
                    <p>Impoconsumo (8%): <span className="font-medium">{formatCOP(indirecto)}</span></p>
                    <p>Costo total: <span className="font-medium">{formatCOP(total)}</span></p>
                  </div>
                  <div className="text-right">
                    <p>Costo por porción: <span className="font-medium">{formatCOP(total / (r.porciones || 1))}</span></p>
                    {r.precio_venta ? <p>Precio venta: <span className="font-medium">{formatCOP(r.precio_venta)}</span></p> : null}
                    {r.precio_venta ? <p className="font-semibold">Food cost: {foodCost(r)}%</p> : null}
                  </div>
                </div>
              )}

              {r.instrucciones && (
                <div className="mt-4 pt-3 border-t border-stone-200">
                  <p className="text-xs font-medium text-stone-500 mb-1">Producción</p>
                  <p className="text-xs text-stone-700 whitespace-pre-wrap">{r.instrucciones}</p>
                </div>
              )}

              {(r.alergenos || r.pcc) && (
                <div className="mt-3 text-xs text-stone-600 space-y-1">
                  {r.alergenos && <p><span className="font-medium">Alérgenos:</span> {r.alergenos}</p>}
                  {r.pcc && <p><span className="font-medium">Puntos Críticos (PCC):</span> {r.pcc}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}