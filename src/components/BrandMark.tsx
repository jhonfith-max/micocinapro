import { LogoMark } from "@/components/LogoMark";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark className="h-9 w-auto" />
      <div className="leading-tight">
        <p className="text-lg font-bold tracking-tight">
          <span className={light ? "text-cream" : "text-[#1C1B19]"}>MiCocina</span>
          <span className="text-[#C45C26]">Pro</span>
        </p>
        <p className={"text-[11px] uppercase tracking-[0.22em] " + (light ? "text-cream/60" : "text-ink/50")}>
          Costeo de carta
        </p>
      </div>
    </div>
  );
}
