"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Laptop },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function AppearanceControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <fieldset className={cn("space-y-2", className)}>
      <legend className="text-sm font-semibold text-foreground">Appearance</legend>
      <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1" role="radiogroup" aria-label="Appearance">
        {options.map(({ value, label, icon: Icon }) => {
          const selected = theme === value || (!theme && value === "light");
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(value)}
              className={cn(
                "flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected && "bg-background text-foreground shadow-sm",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
