// Utilidades generales de MiCocinaPro

export function formatCOP(value: number): string {
  if (value == null || isNaN(value)) return "$ 0";

  // Redondeamos a peso entero para evitar decimales raros
  const entero = Math.round(value);

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(entero);
}

/**
 * Calcula el precio por unidad base (gramo, ml, unidad)
 */
export function calculateUnitPrice(
  precioCompra: number,
  cantidadCompra: number
): number {
  if (cantidadCompra <= 0) return 0;
  return precioCompra / cantidadCompra;
}

/**
 * Calcula merma y rendimiento a partir de pesos
 */
export function calculateYield(
  pesoInicial: number,
  pesoFinal: number,
  pesoDesperdicio?: number
) {
  if (pesoInicial <= 0) {
    return { porcentajeMerma: 0, porcentajeRendimiento: 0 };
  }

  const merma = pesoInicial - pesoFinal;
  const porcentajeMerma = (merma / pesoInicial) * 100;
  const porcentajeRendimiento = (pesoFinal / pesoInicial) * 100;

  return {
    porcentajeMerma: Math.round(porcentajeMerma * 100) / 100,
    porcentajeRendimiento: Math.round(porcentajeRendimiento * 100) / 100,
    pesoMerma: merma,
    pesoDesperdicio: pesoDesperdicio ?? 0,
  };
}

/**
 * Calcula el food cost %
 */
export function calculateFoodCost(
  costoPorcion: number,
  precioVenta: number
): number {
  if (precioVenta <= 0) return 0;
  return Math.round((costoPorcion / precioVenta) * 10000) / 100;
}

/**
 * Calcula precio sugerido según food cost objetivo
 */
export function calculateSuggestedPrice(
  costoPorcion: number,
  foodCostObjetivo: number
): number {
  if (foodCostObjetivo <= 0 || foodCostObjetivo >= 100) return 0;
  const precio = costoPorcion / (foodCostObjetivo / 100);
  // Redondear a la centena más cercana (práctica común en restaurantes)
  return Math.ceil(precio / 100) * 100;
}
