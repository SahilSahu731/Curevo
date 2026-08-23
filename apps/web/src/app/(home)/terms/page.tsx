import { AlertTriangle, BadgeCheck, CircleOff, FileText, ShieldAlert, Wrench } from "lucide-react";

import { PublicPageCta, PublicPageHero } from "@/components/home/PublicPage";

const terms = [
  { icon: Wrench, title: "Prototype status", text: "Curevo is a review-only prototype for self-guided focus, habits, and everyday wellbeing. No operating entity, launch jurisdiction, customer contract, or governing law has been approved." },
  { icon: BadgeCheck, title: "Permitted use", text: "Use the service only with information you control and, while launch remains blocked, only synthetic information. You must be at least 18 and must not upload another person’s data, malicious files, unlawful content, or credentials you do not own." },
  { icon: ShieldAlert, title: "No medical or emergency service", text: "Curevo does not provide medical advice, diagnosis, treatment, therapy, clinical triage, prescriptions, or emergency response. If you may be in immediate danger, contact the emergency service for your location and do not wait for this website." },
  { icon: CircleOff, title: "Accounts and acceptable use", text: "Keep your credentials confidential. Do not bypass access controls, probe other accounts, scrape private content, overload the service, or use its output to make medical or safety-critical decisions." },
  { icon: FileText, title: "Your content", text: "You remain responsible for routine names, reflections, feedback, and profile information you submit. Avoid content you would not place in a prototype environment." },
  { icon: AlertTriangle, title: "Availability and changes", text: "Features may change, pause, or be removed during review. No uptime, outcome, productivity, or wellbeing guarantee is made." },
];

export default function TermsPage() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      <PublicPageHero
        eyebrow="Terms · interim prototype notice"
        title={<>Use Curevo with <span className="font-serif italic font-normal text-[#bd624b] dark:text-[#ef9f88]">clear expectations.</span></>}
        description="These terms describe the current review build. They are not final launch terms or a substitute for jurisdiction-specific legal review."
        aside={
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Before you continue</p>
            <p className="mt-5 text-2xl font-semibold leading-tight tracking-tight">Use synthetic information only while Curevo remains under review.</p>
            <div className="mt-6 rounded-2xl bg-[#f1d5ca] px-4 py-3 text-sm font-semibold text-[#713e32] dark:bg-rose-950 dark:text-rose-200">Curevo is for adults aged 18 and over.</div>
          </>
        }
      />

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-4">
            {terms.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="group grid gap-6 rounded-[1.75rem] border border-border bg-card p-6 transition hover:border-primary/30 md:grid-cols-[4rem_14rem_1fr] md:items-start md:p-8">
                <div className="flex items-center justify-between md:block"><span className="grid size-12 place-items-center rounded-2xl bg-[#edf1e8] text-[#315c49] dark:bg-emerald-950 dark:text-emerald-200"><Icon className="size-5" aria-hidden="true" /></span><span className="font-mono text-xs font-bold text-muted-foreground md:mt-5 md:block">0{index + 1}</span></div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h2>
                <p className="leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[#284c3c] px-5 py-16 text-white dark:bg-emerald-950 sm:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/65">The boundary that matters most</p>
          <p className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">Everyday self-guided support is not medical care, therapy, or emergency help.</p>
        </div>
      </section>

      <PublicPageCta eyebrow="Questions about these terms?" title="Clarity is part of feeling safe here." description="Send a support request if any part of this interim notice is unclear." primaryHref="/contact" primaryLabel="Contact support" secondaryHref="/privacy" secondaryLabel="Read the privacy notice" />
    </div>
  );
}
