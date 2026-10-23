import { BrandMark } from "@/components/BrandMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-herb text-cream p-12">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-copper/25 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-ember/20 blur-3xl" />
        <BrandMark light />
        <div className="relative max-w-md">
          <p className="text-xs uppercase tracking-[0.28em] text-ember">Para quien cocina de verdad</p>
          <h1 className="mt-4 text-5xl leading-[1.05] text-cream">
            El costo de cada plato, claro como un ticket de compra.
          </h1>
          <p className="mt-6 text-cream/70 text-lg leading-relaxed">
            Ingredientes, merma, recetas y carta. Sin tablas interminables. Con el pulso de una cocina profesional.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-sm">
          {[
            ["01", "Compras"],
            ["02", "Rendimiento"],
            ["03", "Carta viva"],
          ].map(([n, label]) => (
            <div key={n} className="border border-cream/15 rounded-2xl p-4 bg-cream/5">
              <p className="text-ember text-xs tracking-widest">{n}</p>
              <p className="mt-2">{label}</p>
            </div>
          ))}
        </div>
      </aside>
      <main className="paper-grain flex items-center justify-center p-6 sm:p-10">{children}</main>
    </div>
  );
}
