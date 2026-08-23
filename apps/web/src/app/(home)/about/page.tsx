import { BookHeart, Focus, Heart, Leaf, Lightbulb, ShieldCheck, Users } from "lucide-react";

import { PublicPageCta, PublicPageHero, SectionHeading } from "@/components/home/PublicPage";

const principles = [
  { icon: Focus, number: "01", title: "Attention with a stopping point", text: "Short focus blocks make room for one intention without turning the whole day into a performance." },
  { icon: Leaf, number: "02", title: "Routines that stay flexible", text: "Helpful cues can be paused, changed, or skipped. A routine should support the week, not judge it." },
  { icon: BookHeart, number: "03", title: "Reflection without scoring", text: "Private notes help members notice conditions and patterns without diagnostic labels or automated wellbeing scores." },
  { icon: ShieldCheck, number: "04", title: "Boundaries stated clearly", text: "Curevo is self-guided focus and wellbeing support. It does not provide diagnosis, treatment, therapy, or crisis response." },
];

const beliefs = [
  { icon: Heart, title: "Meet people where they are", text: "Not everyone needs more pressure. Sometimes a person needs permission to pause and approach the day differently." },
  { icon: Lightbulb, title: "Small practices over big promises", text: "Useful change can begin with a small action you can repeat—not a dramatic transformation you have to sustain." },
  { icon: Users, title: "Be honest about limitations", text: "Software can support self-guided practices, but it cannot provide therapy, diagnosis, or crisis care. We say that plainly." },
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      <PublicPageHero
        eyebrow="About Curevo"
        title={<>A practical place to <span className="font-serif italic font-normal text-[#bd624b] dark:text-[#ef9f88]">return to yourself.</span></>}
        description={<>Curevo is being built for people who feel stuck, distracted, overloaded, or caught in unhelpful loops. It offers small focus practices, flexible routines, and private reflection—without pretending everyday software can replace professional care.</>}
        aside={
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">The idea in one line</p>
            <p className="mt-5 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">Make the next step kinder, clearer, and small enough to begin.</p>
            <div className="mt-7 flex items-center gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-[#bd624b]" />
              No streaks. No diagnosis. No false promises.
            </div>
          </>
        }
      />

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[1300px]">
          <SectionHeading eyebrow="How we design" title="Four commitments, held all the way through." description="These principles shape the language, interactions, and boundaries of every Curevo feature." />
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {principles.map(({ icon: Icon, number, title, text }) => (
              <article key={title} className="group flex min-h-80 flex-col rounded-[2rem] border border-border bg-card p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-38px_rgba(32,60,45,.55)] motion-reduce:transform-none sm:p-8">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#dce9d7] text-[#315c49] dark:bg-emerald-950 dark:text-emerald-200"><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="font-mono text-xs font-bold text-muted-foreground">{number}</span>
                </div>
                <div className="mt-auto pt-14">
                  <h3 className="text-2xl font-semibold leading-tight tracking-tight">{title}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[#e7eddf]/55 px-5 py-24 dark:bg-emerald-950/20 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1300px] gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
          <SectionHeading eyebrow="What we believe" title="Support should feel human, even when it is digital." />
          <div className="divide-y divide-foreground/10 border-y border-foreground/10">
            {beliefs.map(({ icon: Icon, title, text }) => (
              <article key={title} className="grid gap-5 py-8 sm:grid-cols-[3.5rem_1fr] sm:py-10">
                <span className="grid size-11 place-items-center rounded-2xl bg-background text-[#bd624b] shadow-sm dark:bg-white/5 dark:text-[#ef9f88]"><Icon className="size-5" aria-hidden="true" /></span>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[1300px] rounded-[2.25rem] bg-[#284c3c] p-8 text-white sm:p-12 lg:grid lg:grid-cols-[.8fr_1.2fr] lg:gap-20 lg:p-16 dark:bg-emerald-950">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/65">Current status</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Still in review.</h2>
          </div>
          <div className="mt-7 lg:mt-0">
            <p className="text-lg leading-8 text-white/75">Public launch remains on hold until the operating entity, target jurisdictions, privacy ownership, accessibility evidence, security controls, crisis-language review, and support operations are approved.</p>
            <p className="mt-6 rounded-2xl border border-white/15 bg-white/[.06] px-5 py-4 text-sm font-semibold text-white/80">Review environments should use synthetic, non-real information only.</p>
          </div>
        </div>
      </section>

      <PublicPageCta eyebrow="A small place to begin" title="See how the approach feels in practice." description="Choose the moment that feels closest. Curevo will help you narrow it to one useful next move." secondaryHref="/contact" secondaryLabel="Talk to us" />
    </div>
  );
}
