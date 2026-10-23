import "./output.css";
import { Fraunces, Outfit } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "MiCocinaPro",
  description: "Costea tu carta",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}