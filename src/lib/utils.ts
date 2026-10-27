export function formatCOP(value: number): string {
  if (value == null || isNaN(value)) return "$ 0";
  const entero = Math.round(value);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(entero);
}

export function calculateUnitPrice(precioCompra: number, cantidadCompra: number): number {
  return precioCompra / cantidadCompra;
}

export function calculateFoodCost(costo: number, precioVenta: number): number {
  if (!precioVenta) return 0;
  return Math.round((costo / precioVenta) * 100);
}

export function calculateSuggestedPrice(costo: number, foodCostObjetivo: number): number {
  return Math.round(costo / (foodCostObjetivo / 100));
}