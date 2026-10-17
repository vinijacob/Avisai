import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping-slow rounded-full bg-accent opacity-80" />
        <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
      </span>
      <span className="font-serif text-[26px] leading-none tracking-tight">
        Avisa<em>í</em>
      </span>
    </span>
  );
}
