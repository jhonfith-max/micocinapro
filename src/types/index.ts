// Tipos principales de MiCocinaPro

export type YieldType = "limpieza" | "coccion";

export type UsageType = "crudo" | "limpio" | "cocido";

export interface User {
  id: string;
  email: string;
  nombre_restaurante: string;
  nombre_responsable: string;
  telefono?: string;
  plan: string;
  fecha_compra?: string;
  activo: boolean;
  created_at: string;
}

export interface Ingredient {
  id: string;
  user_id: string;
  nombre: string;
  unidad_compra: string;
  precio_compra: number;
  cantidad_compra: number;
  precio_por_unidad: number;
  tiene_rendimiento_limpieza: boolean;
  tiene_rendimiento_coccion: boolean;
  notas?: string;
  updated_at: string;
}

export interface YieldTest {
  id: string;
  ingredient_id: string;
  tipo: YieldType;
  peso_inicial: number;
  peso_desperdicio?: number;
  peso_final: number;
  porcentaje_merma: number;
  porcentaje_rendimiento: number;
  notas?: string;
  fecha: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  nombre: string;
  orden: number;
  food_cost_objetivo: number; // porcentaje, ej: 30
}

export interface Recipe {
  id: string;
  user_id: string;
  category_id?: string;
  nombre: string;
  porciones: number;
  precio_venta?: number;
  instrucciones?: string;
  notas?: string;
  foto_url?: string;
  costo_total: number;
  costo_porcion: number;
  food_cost: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  cantidad: number;
  unidad: string;
  tipo_uso: UsageType;
  costo: number;
}

// Configuración del restaurante
export interface RestaurantConfig {
  nombre_restaurante: string;
  nombre_responsable: string;
  telefono?: string;
  direccion?: string;
  logo_url?: string;
  unidad_peso: "g" | "kg";
  unidad_volumen: "ml" | "l";
  mostrar_precio_sugerido: boolean;
  incluir_costos_en_ficha: boolean;
  food_cost_por_categoria: {
    entradas: number;
    fuertes: number;
    acompanamientos: number;
    postres: number;
    bebidas: number;
    salsas: number;
    otros: number;
  };
}
