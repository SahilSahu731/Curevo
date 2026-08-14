import Link from "next/link";

import { BrandLogo } from "@/components/brand/BrandLogo";

const exploreLinks = [
  { label: "Guided paths", href: "/#paths" },
  { label: "Our approach", href: "/#approach" },
  { label: "What is inside", href: "/#inside" },
  { label: "Journal", href: "/blog" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const footerLinkClass =
  "rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-muted/35 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-14 md:grid-cols-[1.35fr_1fr_1fr] md:py-16">
          <div className="space-y-5">
            <Link
              href="/"
              aria-label="Curevo home"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BrandLogo />
            </Link>
            <p className="max-w-md text-sm leading-6">
              A self-guided space for meeting distraction, heavy days, and stuck moments with one practical next step.
            </p>
          </div>

          <nav aria-label="Explore Curevo">
            <h2 className="mb-5 text-sm font-semibold tracking-wide text-foreground">Explore</h2>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company and policies">
            <h2 className="mb-5 text-sm font-semibold tracking-wide text-foreground">Curevo</h2>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/#safety" className={footerLinkClass}>Safety &amp; support</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mb-8 rounded-2xl border border-border bg-card/75 px-5 py-4 text-sm leading-6 text-card-foreground sm:flex sm:items-center sm:justify-between sm:gap-8">
          <p>
            Curevo is a self-guided wellbeing and focus companion. It does not provide medical care or crisis support.
          </p>
          <Link
            href="/#safety"
            className="mt-2 inline-flex shrink-0 font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mt-0"
          >
            Read safety guidance
          </Link>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/70 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Curevo. Small steps, at your pace.</p>
          <p>If you may be in immediate danger, contact local emergency services.</p>
        </div>
      </div>
    </footer>
  );
}
