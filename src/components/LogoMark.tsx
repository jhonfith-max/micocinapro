export function LogoMark({ className = "h-6 w-auto" }: { className?: string }) {
  return <img src="/logo-m.png" alt="" className={className + " object-contain"} />;
}

export function LogoLockup({
  className = "",
  markClassName = "h-6 w-auto",
  wordClassName = "text-[15px]",
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={"inline-flex items-center gap-2 " + className}>
      <LogoMark className={markClassName + " shrink-0"} />
      <span className={"font-bold tracking-tight leading-none " + wordClassName}>
        <span className="text-[#1C1B19]">MiCocina</span>
        <span className="text-[#C45C26]">Pro</span>
      </span>
    </span>
  );
}
