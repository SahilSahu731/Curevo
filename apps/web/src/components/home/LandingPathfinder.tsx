"use client";

import { useState } from "react";
import { ArrowRight, CloudSun, Focus, Layers3, MousePointer2, Sparkles } from "lucide-react";

const options = [
  {
    id: "stuck",
    label: "I keep avoiding one thing",
    short: "Stuck",
    icon: MousePointer2,
    title: "Make the doorway tiny.",
    intro: "You do not need to finish it. Create a start so small your resistance has less to argue with.",
    duration: "5-minute start",
    steps: ["Open only the file, page, or tool you need", "Write one deliberately rough first line", "Stop after five minutes—or continue if it feels easier"],
    closing: "Starting counts, even when it is messy.",
  },
  {
    id: "scattered",
    label: "My attention is everywhere",
    short: "Scattered",
    icon: Focus,
    title: "Give one thing a small container.",
    intro: "Focus does not have to last all afternoon. Decide what deserves the next ten quiet minutes.",
    duration: "10-minute return",
    steps: ["Move one visible distraction out of reach", "Write the single outcome for this block", "Set ten minutes and stop when the timer ends"],
    closing: "A short return is still a return.",
  },
  {
    id: "overloaded",
    label: "Everything feels like too much",
    short: "Overloaded",
    icon: Layers3,
    title: "Take the pile out of your head.",
    intro: "Overwhelm makes everything sound equally urgent. Put the noise somewhere you can see it.",
    duration: "3-minute sort",
    steps: ["Write every loud task as a plain list", "Circle one item that affects the next hour", "Mark one item ‘later’ and let it stay there"],
    closing: "You are choosing an order, not solving your whole life.",
  },
  {
    id: "looping",
    label: "My thoughts keep circling",
    short: "Looping",
    icon: CloudSun,
    title: "Create a little distance.",
    intro: "You do not have to win an argument with your mind. Start by returning to the room around you.",
    duration: "2-minute grounding",
    steps: ["Name three neutral things you can see", "Notice where your body meets the chair or floor", "Write the thought as: ‘My mind is telling me…’"],
    closing: "A thought can be present without giving the next instruction.",
  },
] as const;

type OptionId = (typeof options)[number]["id"];

export default function LandingPathfinder() {
  const [selected, setSelected] = useState<OptionId>("stuck");
  const active = options.find((option) => option.id === selected) ?? options[0];
  const ActiveIcon = active.icon;

  return (
    <section id="check-in" className="scroll-mt-24 bg-[#1f382d] px-5 py-24 text-white dark:bg-[#12251c] sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-14 lg:grid-cols-[.88fr_1.12fr] lg:gap-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f6c66e]">Try it now · no account needed</p>
            <h2 className="mt-4 max-w-xl text-balance text-4xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-6xl">What is today feeling like?</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">Choose the closest answer. This is a reflective prompt, not an assessment, and nothing here is scored or saved.</p>

            <div className="mt-9 grid gap-3" role="radiogroup" aria-label="Choose how today feels">
              {options.map(({ id, label, icon: Icon }) => {
                const isActive = active.id === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelected(id)}
                    className={`group flex min-h-14 w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c66e] ${
                      isActive ? "border-[#f6c66e]/60 bg-white text-[#1f382d]" : "border-white/12 bg-white/[.045] text-white/75 hover:border-white/30 hover:bg-white/[.075]"
                    }`}
                  >
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-[#e6efe2] text-[#315c49]" : "bg-white/10 text-white"}`}><Icon className="size-4" aria-hidden="true" /></span>
                    <span>{label}</span>
                    <ArrowRight className={`ml-auto size-4 transition ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="self-start rounded-[2rem] bg-[#f8f3e9] p-3 text-[#20372d] shadow-[0_32px_90px_-50px_rgba(0,0,0,.8)] dark:bg-[#e9e5da]" aria-live="polite">
            <div className="rounded-[1.45rem] border border-[#20372d]/10 bg-white/70 p-6 sm:p-9">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#20372d]/10 pb-6">
                <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-[#dce9d7]"><ActiveIcon className="size-4" aria-hidden="true" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#617168]">Your small practice</p><p className="mt-0.5 text-sm font-bold">{active.short}</p></div></div>
                <span className="rounded-full bg-[#f0e5c9] px-3 py-1.5 text-xs font-bold text-[#705426]">{active.duration}</span>
              </div>

              <div className="py-8">
                <Sparkles className="size-5 text-[#bd624b]" aria-hidden="true" />
                <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">{active.title}</h3>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f6d66]">{active.intro}</p>
              </div>

              <ol className="space-y-3">
                {active.steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-4 rounded-2xl border border-[#20372d]/10 bg-white/75 p-4 sm:p-5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#315c49] text-xs font-bold text-white">{index + 1}</span>
                    <span className="pt-1 text-sm font-semibold leading-6 sm:text-base">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#e8eee3] p-4 text-sm font-semibold leading-6 text-[#315c49]">
                <Sparkles className="mt-1 size-4 shrink-0" aria-hidden="true" />
                {active.closing}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
