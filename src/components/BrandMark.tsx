export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          "relative grid h-11 w-11 place-items-center rounded-2xl text-lg font-semibold " +
          (light ? "bg-copper text-cream" : "bg-herb text-cream")
        }
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        M
        <span className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-ember" />
      </span>
      <div className="leading-tight">
        <p
          className={"text-lg " + (light ? "text-cream" : "text-ink")}
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          MiCocinaPro
        </p>
        <p className={"text-[11px] uppercase tracking-[0.22em] " + (light ? "text-cream/60" : "text-ink/50")}>
          Costeo de carta
        </p>
      </div>
    </div>
  );
}
