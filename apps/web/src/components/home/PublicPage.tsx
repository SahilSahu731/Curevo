import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type PublicPageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  aside?: ReactNode;
};

export function PublicPageHero({ eyebrow, title, description, aside }: PublicPageHeroProps) {
  return (
    <section className="landing-grid relative isolate overflow-hidden border-b border-border/70">
      <div className="pointer-events-none absolute -left-44 top-0 size-[30rem] rounded-full bg-[#e6b98e]/25 blur-3xl dark:bg-amber-900/10" />
      <div className="pointer-events-none absolute -right-40 bottom-[-12rem] size-[36rem] rounded-full bg-[#9fbea6]/30 blur-3xl dark:bg-emerald-900/10" />
      <div className={`relative mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32 ${aside ? "lg:grid-cols-[1.08fr_.72fr] lg:items-end" : ""}`}>
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-7 text-balance text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
            {title}
          </h1>
          <div className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
            {description}
          </div>
        </div>
        {aside && (
          <div className="landing-shadow rounded-[2rem] border border-white/60 bg-card/85 p-7 backdrop-blur dark:border-white/10 sm:p-8">
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl">{title}</h2>
      {description && <div className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</div>}
    </div>
  );
}

export function PublicPageCta({
  eyebrow,
  title,
  description,
  primaryHref = "/#paths",
  primaryLabel = "Find a guided path",
  secondaryHref = "/about",
  secondaryLabel = "About Curevo",
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="border-t border-border px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#bd624b] dark:text-[#ef9f88]">{eyebrow}</p>
        <h2 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-6xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={primaryHref} className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#315c49] px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#264b3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none dark:bg-emerald-200 dark:text-emerald-950 dark:hover:bg-emerald-100">
            {primaryLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
          </Link>
          <Link href={secondaryHref} className="inline-flex min-h-13 items-center justify-center rounded-full border border-foreground/15 bg-background/60 px-7 py-3.5 text-sm font-bold text-foreground transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
