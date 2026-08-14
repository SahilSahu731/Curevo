import { Sprout } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
};

export function BrandLogo({ className, compact = false, inverse = false }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary text-primary-foreground shadow-sm",
          compact && "size-8",
          inverse && "border-white/25 bg-white/10 text-white shadow-none",
        )}
      >
        <Sprout className={cn("size-5", compact && "size-4")} strokeWidth={2} />
      </span>
      <span className="min-w-0 leading-none">
        <span
          className={cn(
            "block font-heading text-lg font-semibold tracking-[-0.035em] text-foreground",
            compact && "text-base",
            inverse && "text-white",
          )}
        >
          Curevo
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-1 block text-[10px] font-medium tracking-[0.08em] text-muted-foreground",
              inverse && "text-white/70",
            )}
          >
            Self-guided wellbeing
          </span>
        )}
      </span>
    </span>
  );
}
