import Link from "next/link";
import {
  ArrowRight,
  Asterisk,
  BookOpenText,
  Check,
  CircleDashed,
  CloudSun,
  Focus,
  Layers3,
  MousePointer2,
  Pause,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import LandingPathfinder from "@/components/home/LandingPathfinder";

const paths = [
  {
    number: "01",
    title: "Begin when you feel stuck",
    copy: "Turn the task you keep avoiding into one visible action small enough to begin badly.",
    note: "Procrastination · activation",
    icon: MousePointer2,
    tone: "bg-[#dce9d7] text-[#244c3a] dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    number: "02",
    title: "Come back to one thing",
    copy: "Set a short focus container, quiet one distraction, and decide what ‘enough’ means today.",
    note: "Attention · boundaries",
    icon: Focus,
    tone: "bg-[#f7dfb8] text-[#70471e] dark:bg-amber-950 dark:text-amber-200",
  },
  {
    number: "03",
    title: "Make overwhelm smaller",
    copy: "Sort the loud pile into now, later, and not mine—without pretending everything is urgent.",
    note: "Overload · prioritising",
    icon: Layers3,
    tone: "bg-[#eadcf0] text-[#5c3c68] dark:bg-violet-950 dark:text-violet-200",
  },
  {
    number: "04",
    title: "Soften a thought loop",
    copy: "Use grounding and reflection prompts to create a little distance from a mind that keeps circling.",
    note: "Worry · decompression",
    icon: CloudSun,
    tone: "bg-[#f1d5ca] text-[#713e32] dark:bg-rose-950 dark:text-rose-200",
  },
];

const approach = [
  {
    step: "Notice",
    title: "Name what is here",
    copy: "Choose the feeling that is closest. No score, diagnosis, or perfect label required.",
  },
  {
    step: "Narrow",
    title: "Find the smallest useful move",
    copy: "Curevo turns a heavy moment into a short practice with a clear stopping point.",
  },
  {
    step: "Learn",
    title: "Keep what actually helped",
    copy: "Reflect without judgement, adapt the practice, and leave the rest behind.",
  },
];

const principles = [
  "No streaks designed to make you feel behind",
  "No clinical labels or automated risk scores",
  "Short practices with a clear beginning and end",
  "Honest boundaries around what the product cannot do",
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      <section className="landing-grid relative isolate border-b border-border/70">
        <div className="pointer-events-none absolute -left-40 top-10 size-[28rem] rounded-full bg-[#e6b98e]/25 blur-3xl dark:bg-amber-900/10" />
        <div className="pointer-events-none absolute -right-40 bottom-0 size-[34rem] rounded-full bg-[#9fbea6]/30 blur-3xl dark:bg-emerald-900/10" />

        <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1500px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:px-12 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#315c49]/20 bg-white/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#315c49] shadow-sm backdrop-blur dark:border-emerald-300/20 dark:bg-white/5 dark:text-emerald-200">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Self-guided support for real life
            </div>

            <h1 className="max-w-4xl text-balance text-[clamp(3.5rem,7.4vw,7.7rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
              When your <span className="block sm:inline">mind</span>
              <span className="mt-2 block font-serif italic font-normal tracking-[-0.045em] text-[#bd624b] dark:text-[#ef9f88]">
                won&apos;t cooperate.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              Curevo helps you meet procrastination, focus drift, everyday overwhelm, and looping thoughts with one small practice you can actually start.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#check-in"
                className="group inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#315c49] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_-20px_rgba(35,73,55,.8)] transition hover:-translate-y-0.5 hover:bg-[#264b3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transform-none dark:bg-emerald-200 dark:text-emerald-950 dark:hover:bg-emerald-100"
              >
                Find my next small step
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
              </a>
              <a
                href="#approach"
                className="inline-flex min-h-13 items-center justify-center rounded-full border border-foreground/15 bg-background/60 px-7 py-3.5 text-sm font-bold text-foreground backdrop-blur transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                See how it feels
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" />No judgement</span>
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" />No diagnosis</span>
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" />Start in two minutes</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mr-0">
            <div className="absolute -left-8 -top-8 hidden rounded-full border border-foreground/10 bg-[#f6d79f] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#5f4424] shadow-lg sm:block dark:bg-amber-900 dark:text-amber-100">
              No perfect mood required
            </div>
            <div className="landing-shadow relative rotate-[1.5deg] overflow-hidden rounded-[2.25rem] border border-white/60 bg-[#f9f5eb]/90 p-3 backdrop-blur dark:border-white/10 dark:bg-[#17231e]/95">
              <div className="rounded-[1.7rem] border border-[#264b3b]/12 bg-white/80 p-6 sm:p-8 dark:border-white/10 dark:bg-white/[.035]">
                <div className="flex items-center justify-between border-b border-border/80 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">A small reset</p>
                    <p className="mt-1 font-heading text-lg font-bold">Right now</p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#dce9d7] text-[#315c49] dark:bg-emerald-950 dark:text-emerald-200">
                    <Pause className="size-4" fill="currentColor" aria-hidden="true" />
                  </span>
                </div>

                <div className="grid gap-7 py-8 sm:grid-cols-[8.5rem_1fr] sm:items-center">
                  <div className="relative mx-auto flex size-32 items-center justify-center rounded-full border-[10px] border-[#e9e4d9] dark:border-white/10">
                    <div className="absolute -inset-[10px] rotate-45 rounded-full border-[10px] border-transparent border-r-[#bd624b] border-t-[#bd624b]" />
                    <div className="text-center">
                      <span className="block text-3xl font-semibold tracking-tight">03:00</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">minutes</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#bd624b] dark:text-[#ef9f88]">Before you solve the day</p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">Put both feet down. Let one exhale take a little longer.</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">Nothing to master. Just make enough room to choose what comes next.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl bg-[#edf1e8] p-4 dark:bg-white/[.055]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm dark:bg-white/10">01</span>
                    <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Now</p><p className="truncate font-semibold">Arrive where you are</p></div>
                    <Check className="ml-auto size-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-[#bd624b]/25 bg-[#fff8f2] p-4 dark:bg-[#bd624b]/10">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#bd624b] text-xs font-bold text-white">02</span>
                    <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-[#bd624b] dark:text-[#ef9f88]">Next</p><p className="truncate font-semibold">Name one visible action</p></div>
                    <CircleDashed className="ml-auto size-4 text-[#bd624b]" />
                  </div>
                </div>

                <p className="mt-6 text-center text-xs font-semibold text-muted-foreground">No streaks. No guilt. Come back when you need it.</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-5 -rotate-3 rounded-2xl bg-[#315c49] px-5 py-4 text-sm font-semibold text-white shadow-xl dark:bg-emerald-200 dark:text-emerald-950">
              Begin before you feel ready.
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-[#315c49] text-white dark:bg-emerald-950">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-x-9 gap-y-3 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white/75 sm:px-8">
          <span className="text-white">Small steps for</span>
          <span>Procrastination</span><Asterisk className="size-3 text-[#f6c66e]" />
          <span>Focus drift</span><Asterisk className="size-3 text-[#f6c66e]" />
          <span>Overwhelm</span><Asterisk className="size-3 text-[#f6c66e]" />
          <span>Thought loops</span>
        </div>
      </div>

      <section id="paths" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Choose what feels closest</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
                Different hard days need different doors in.
              </h2>
            </div>
            <p className="max-w-md text-pretty text-base leading-7 text-muted-foreground lg:pb-2">
              Start with the shape of the moment—not a label. Each path offers a short practice and a clear place to stop.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {paths.map(({ number, title, copy, note, icon: Icon, tone }) => (
              <article key={number} className="group flex min-h-[27rem] flex-col rounded-[1.75rem] border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-38px_rgba(32,60,45,.55)] motion-reduce:transform-none sm:p-7">
                <div className="flex items-start justify-between">
                  <span className={`flex size-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span>
                  <span className="font-mono text-xs font-bold text-muted-foreground">{number}</span>
                </div>
                <div className="mt-auto pt-16">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{note}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{title}</h3>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{copy}</p>
                  <a href="#check-in" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Try this path <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LandingPathfinder />

      <section id="approach" className="scroll-mt-24 border-y border-border bg-[#e7eddf]/55 px-5 py-24 dark:bg-emerald-950/20 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-[1300px]">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">The Curevo approach</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">Gentle doesn&apos;t mean vague.</h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">Every practice gives you something clear to do, without turning your wellbeing into another performance metric.</p>
            </div>

            <ol className="divide-y divide-foreground/10 border-y border-foreground/10">
              {approach.map((item, index) => (
                <li key={item.step} className="grid gap-5 py-8 sm:grid-cols-[4rem_1fr] sm:py-10">
                  <span className="font-mono text-sm font-bold text-[#bd624b] dark:text-[#ef9f88]">0{index + 1}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{item.step}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{item.title}</h3>
                    <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="inside" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-24">
          <div className="relative order-2 lg:order-1">
            <div className="landing-shadow rounded-[2rem] border border-border bg-card p-4 sm:p-6">
              <div className="rounded-[1.4rem] bg-[#f2eee4] p-5 dark:bg-white/[.045] sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Today&apos;s space</p><p className="mt-1 text-xl font-semibold">Good afternoon, you.</p></div>
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground">Thursday · no streak</span>
                </div>

                <div className="mt-7 rounded-2xl bg-[#315c49] p-6 text-white dark:bg-emerald-900">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.15em] text-white/65">Your next practice</span><Sparkles className="size-4 text-[#f6c66e]" /></div>
                  <h3 className="mt-7 max-w-md text-3xl font-semibold leading-tight tracking-tight">The deliberately tiny start</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Choose the first physical action. Do only that for five minutes. Continuing is optional.</p>
                  <div className="mt-6 flex items-center gap-3"><span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#315c49]">Begin 5 min</span><span className="text-xs font-semibold text-white/60">Low energy friendly</span></div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <BookOpenText className="size-5 text-primary" />
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">A note from yesterday</p>
                    <p className="mt-2 font-semibold leading-6">“Starting with the outline made the rest less loud.”</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between"><Focus className="size-5 text-[#bd624b]" /><span className="text-xs font-bold text-muted-foreground">2 of 3</span></div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Things that helped</p>
                    <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">Phone away</span><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">Rough first pass</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Inside Curevo</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">A quiet space. Not another dashboard judging you.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Practices, reflections, and patterns are arranged around returning—not winning. Miss a day, a week, or a month. You are still welcome.</p>
            <ul className="mt-9 space-y-4">
              {principles.map((principle) => (
                <li key={principle} className="flex items-start gap-3 text-sm font-semibold leading-6"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#dce9d7] text-[#315c49] dark:bg-emerald-950 dark:text-emerald-200"><Check className="size-3" /></span>{principle}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="safety" className="scroll-mt-24 px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#1f382d] text-white dark:bg-[#12251c]">
          <div className="grid lg:grid-cols-[.8fr_1.2fr]">
            <div className="relative overflow-hidden border-b border-white/10 p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-14">
              <div className="absolute -bottom-24 -left-24 size-72 rounded-full border-[55px] border-white/[.035]" />
              <ShieldCheck className="size-9 text-[#f6c66e]" aria-hidden="true" />
              <p className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-white/55">An honest boundary</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Everyday support is not emergency support.</h2>
            </div>
            <div className="p-8 sm:p-12 lg:p-14">
              <p className="max-w-3xl text-lg leading-8 text-white/78">Curevo is designed for general wellbeing, habits, and focus. It cannot assess your safety, diagnose a condition, provide therapy, or replace a qualified professional.</p>
              <div className="mt-8 rounded-2xl border border-[#f6c66e]/25 bg-[#f6c66e]/10 p-5 sm:p-6">
                <p className="font-bold text-[#ffe0a3]">If you may harm yourself or someone else, or you are in immediate danger:</p>
                <p className="mt-2 text-sm leading-7 text-white/75">Call your local emergency number or go to the nearest emergency department now. If it is safe to do so, contact someone you trust and do not stay alone. Do not wait for this website.</p>
              </div>
              <p className="mt-6 text-sm leading-6 text-white/55">For ongoing or worsening distress, consider speaking with a licensed mental health professional who can understand your situation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border px-5 py-24 text-center sm:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f1d5ca] text-[#9b4d3a] dark:bg-rose-950 dark:text-rose-200"><Sparkles className="size-5" /></span>
          <h2 className="mt-7 text-balance text-5xl font-semibold leading-[.98] tracking-[-0.05em] sm:text-7xl">You can start smaller than you think.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Try a two-minute check-in now, or browse the journal for practical ways to meet a difficult day.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#check-in" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Start a check-in <ArrowRight className="size-4" /></a>
            <Link href="/blog" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-bold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Browse the journal <BookOpenText className="size-4" /></Link>
          </div>
          <p className="mt-6 text-xs font-semibold text-muted-foreground">Self-guided wellbeing support. Not medical or crisis care.</p>
        </div>
      </section>
    </div>
  );
}
