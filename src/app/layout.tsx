import type { Metadata } from "next";
import "./globals.css";

// METADATOS SEO (Lo que lee Google y cuando compartes el link por WhatsApp)
export const metadata: Metadata = {
  title: "MiCocinaPro | Costeo de cartas para restaurantes",
  description: "La herramienta de costeo que usan los chefs. Controla compras, mermas, recetas y food cost sin Excel. Diseñado para la cocina real.",
  keywords: ["costeo de recetas", "food cost", "restaurantes", "chef", "software gastronómico", "Colombia"],
  authors: [{ name: "MiCocinaPro" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Fuentes globales cargadas una sola vez para toda la app */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans antialiased text-gray-900 bg-[#FAF9F6]">
        {children}
      </body>
    </html>
  );
}