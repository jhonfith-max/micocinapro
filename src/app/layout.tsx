import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "MiCocinaPro",
  description: "Costea tu carta",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-stone-50 text-stone-900">{children}</body>
    </html>
  );
}