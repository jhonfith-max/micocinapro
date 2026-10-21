-- =====================================================
-- MiCocinaPro - Esquema de Base de Datos (MVP)
-- =====================================================

-- 1. Tabla de perfiles de usuario (extiende auth.users de Supabase)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nombre_restaurante text not null,
  nombre_responsable text not null,
  telefono text,
  plan text default 'completo',
  fecha_compra timestamptz,
  activo boolean default true,
  created_at timestamptz default now()
);

-- 2. Categorías de recetas
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nombre text not null,
  orden integer default 0,
  food_cost_objetivo numeric(5,2) default 30.00, -- porcentaje
  created_at timestamptz default now()
);

-- 3. Ingredientes
create table if not exists public.ingredients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nombre text not null,
  unidad_compra text not null, -- 'kg', 'g', 'litro', 'ml', 'unidad', etc.
  precio_compra numeric(12,2) not null,
  cantidad_compra numeric(12,3) not null default 1,
  precio_por_unidad numeric(12,4), -- calculado
  tiene_rendimiento_limpieza boolean default false,
  tiene_rendimiento_coccion boolean default false,
  notas text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 4. Pruebas de rendimiento
create table if not exists public.yield_tests (
  id uuid default gen_random_uuid() primary key,
  ingredient_id uuid references public.ingredients(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tipo text not null check (tipo in ('limpieza', 'coccion')),
  peso_inicial numeric(12,3) not null,
  peso_desperdicio numeric(12,3),
  peso_final numeric(12,3) not null,
  porcentaje_merma numeric(7,2),
  porcentaje_rendimiento numeric(7,2),
  notas text,
  fecha date default current_date,
  created_at timestamptz default now()
);

-- 5. Recetas
create table if not exists public.recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  nombre text not null,
  porciones integer not null default 1,
  precio_venta numeric(12,2),
  instrucciones text,
  notas text,
  foto_url text,
  costo_total numeric(12,2) default 0,
  costo_porcion numeric(12,2) default 0,
  food_cost numeric(7,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Ingredientes de cada receta
create table if not exists public.recipe_ingredients (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  ingredient_id uuid references public.ingredients(id) on delete restrict not null,
  cantidad numeric(12,3) not null,
  unidad text not null,
  tipo_uso text not null check (tipo_uso in ('crudo', 'limpio', 'cocido')) default 'crudo',
  costo numeric(12,2) default 0,
  created_at timestamptz default now()
);

-- 7. Configuración del restaurante
create table if not exists public.restaurant_config (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  unidad_peso text default 'g' check (unidad_peso in ('g', 'kg')),
  unidad_volumen text default 'ml' check (unidad_volumen in ('ml', 'l')),
  mostrar_precio_sugerido boolean default true,
  incluir_costos_en_ficha boolean default true,
  food_cost_entradas numeric(5,2) default 24.00,
  food_cost_fuertes numeric(5,2) default 30.00,
  food_cost_acompanamientos numeric(5,2) default 23.00,
  food_cost_postres numeric(5,2) default 28.00,
  food_cost_bebidas numeric(5,2) default 18.00,
  food_cost_salsas numeric(5,2) default 22.00,
  food_cost_otros numeric(5,2) default 30.00,
  updated_at timestamptz default now()
);

-- =====================================================
-- Índices para mejor rendimiento
-- =====================================================
create index if not exists idx_ingredients_user on public.ingredients(user_id);
create index if not exists idx_yield_tests_ingredient on public.yield_tests(ingredient_id);
create index if not exists idx_recipes_user on public.recipes(user_id);
create index if not exists idx_recipe_ingredients_recipe on public.recipe_ingredients(recipe_id);
create index if not exists idx_categories_user on public.categories(user_id);

-- =====================================================
-- Row Level Security (RLS) - Cada usuario solo ve lo suyo
-- =====================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.ingredients enable row level security;
alter table public.yield_tests enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.restaurant_config enable row level security;

-- Políticas básicas (el usuario solo puede ver/editar sus propios datos)
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view own categories" on public.categories
  for all using (auth.uid() = user_id);

create policy "Users can view own ingredients" on public.ingredients
  for all using (auth.uid() = user_id);

create policy "Users can view own yield_tests" on public.yield_tests
  for all using (auth.uid() = user_id);

create policy "Users can view own recipes" on public.recipes
  for all using (auth.uid() = user_id);

create policy "Users can view own recipe_ingredients" on public.recipe_ingredients
  for all using (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
      and recipes.user_id = auth.uid()
    )
  );

create policy "Users can view own config" on public.restaurant_config
  for all using (auth.uid() = user_id);

-- =====================================================
-- Función para crear perfil automáticamente al registrarse
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nombre_restaurante, nombre_responsable)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre_restaurante', 'Mi Restaurante'),
    coalesce(new.raw_user_meta_data->>'nombre_responsable', 'Responsable')
  );

  -- Crear configuración por defecto
  insert into public.restaurant_config (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
