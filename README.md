# MiCocinaPro

Herramienta profesional de **costeo de recetas**, **pruebas de rendimiento** y **fichas técnicas** diseñada para cocinas de restaurantes.

## Visión

- Pago único (sin mensualidades obligatorias)
- Actualizaciones mayores opcionales
- Extremadamente fácil de usar (pensada para personas que le tienen miedo a Excel)
- El usuario tiene control real de sus datos

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth) — por configurar
- **Vercel** (hosting)

## Estructura del proyecto

```
src/
├── app/                  # Rutas de la aplicación
│   ├── (auth)/           # Login y registro
│   ├── (dashboard)/      # Área privada
│   └── api/              # API routes
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades y clientes (Supabase, etc.)
└── types/                # Tipos TypeScript
```

## Fases de desarrollo (MVP)

1. **Cimientos** ← Estamos aquí
2. Configuración y Usuario
3. Ingredientes
4. Pruebas de Rendimiento
5. Recetas
6. PDFs y Recetario
7. Dashboard y Pulido
8. Preparación para pruebas con voluntarios

## Cómo correr en desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Notas

Este proyecto se está construyendo de forma ordenada, con puntos de control claros para poder ajustar fácilmente cuando sea necesario.
