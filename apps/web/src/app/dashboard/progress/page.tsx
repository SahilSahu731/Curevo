"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Clock3, Focus, Leaf, Lightbulb, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { focusService } from "@/lib/services/focusService";

export default function ProgressPage() {
  const { data: overview } = useQuery({ queryKey: ["focus-overview"], queryFn: focusService.getOverview });
  const { data: sessions = [] } = useQuery({ queryKey: ["focus-sessions", 100], queryFn: () => focusService.getSessions(100) });
  const { data: reflections = [] } = useQuery({ queryKey: ["reflections", 100], queryFn: () => focusService.getReflections(100) });

  const insights = useMemo(() => {
    const completed = sessions.filter((session) => session.status === "completed");
    const average = completed.length ? Math.round(completed.reduce((sum, session) => sum + session.durationMinutes, 0) / completed.length) : 0;
    const quietest = completed.length ? Math.min(...completed.map((session) => session.distractionCount)) : 0;
    const feelingCounts = reflections.reduce<Record<string, number>>((counts, reflection) => ({ ...counts, [reflection.feeling]: (counts[reflection.feeling] || 0) + 1 }), {});
    const commonFeeling = Object.entries(feelingCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return { average, quietest, commonFeeling };
  }, [reflections, sessions]);

  const daily = overview?.daily || [];
  const max = Math.max(30, ...daily.map((item) => item.minutes));
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Progress</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Look for conditions, not perfection.</h1><p className="mt-3 max-w-2xl text-muted-foreground">This view describes what you recorded. It does not score your mental health, productivity, or worth.</p></div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Minutes this week", value: overview?.summary.weekMinutes || 0, suffix: "min", icon: Clock3 },
          { label: "Completed blocks", value: overview?.summary.completedSessions || 0, suffix: "this week", icon: Focus },
          { label: "Typical block", value: insights.average, suffix: "min", icon: BarChart3 },
          { label: "Active routines", value: overview?.summary.activeRoutines || 0, suffix: "right now", icon: Leaf },
        ].map((item) => <Card key={item.label} className="rounded-3xl"><CardContent className="p-5"><item.icon className="size-5 text-primary" /><p className="mt-5 text-sm text-muted-foreground">{item.label}</p><p className="mt-1 text-3xl font-semibold">{item.value}</p><p className="text-xs text-muted-foreground">{item.suffix}</p></CardContent></Card>)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Card className="rounded-[2rem]"><CardHeader><CardTitle>Last seven days</CardTitle><p className="text-sm text-muted-foreground">Focused minutes recorded each day.</p></CardHeader><CardContent><div className="grid h-72 grid-cols-7 items-end gap-2 sm:gap-4">{Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = date.toISOString().slice(0, 10); const item = daily.find((day) => day._id === key); const minutes = item?.minutes || 0; return <div key={key} className="flex h-full flex-col justify-end gap-2"><span className="text-center text-xs font-semibold">{minutes || "·"}</span><div className="relative h-52 overflow-hidden rounded-2xl bg-muted"><div className="absolute inset-x-0 bottom-0 rounded-2xl bg-gradient-to-t from-primary to-emerald-300 transition-all" style={{ height: `${Math.max(3, (minutes / max) * 100)}%` }} /></div><span className="text-center text-xs font-semibold text-muted-foreground">{date.toLocaleDateString("en", { weekday: "short" })}</span></div>; })}</div></CardContent></Card>
        <div className="space-y-6">
          <Card className="rounded-[2rem] bg-[#284c3c] text-white"><CardHeader><Sparkles className="size-5 text-[#f4c66f]" /><CardTitle className="mt-3 text-white">Patterns worth noticing</CardTitle></CardHeader><CardContent className="space-y-5 text-sm"><div className="border-b border-white/10 pb-4"><p className="text-white/55">Common reflection word</p><p className="mt-1 text-xl font-semibold capitalize">{insights.commonFeeling || "Not enough notes yet"}</p></div><div className="border-b border-white/10 pb-4"><p className="text-white/55">Fewest distractions noticed</p><p className="mt-1 text-xl font-semibold">{sessions.length ? insights.quietest : "—"}</p></div><p className="leading-6 text-white/65">A pattern is a question to explore, not a rule about what you should do.</p></CardContent></Card>
          <Card className="rounded-[2rem]"><CardHeader><Lightbulb className="size-5 text-primary" /><CardTitle className="mt-3">Try asking</CardTitle></CardHeader><CardContent><ul className="space-y-3 text-sm leading-6 text-muted-foreground"><li>What was different before the easiest block?</li><li>Which routine still feels supportive?</li><li>What can be made smaller next week?</li></ul></CardContent></Card>
        </div>
      </div>

      <Card className="rounded-[2rem]"><CardHeader><CardTitle>Recent completed blocks</CardTitle></CardHeader><CardContent>{sessions.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sessions.slice(0, 12).map((session) => <div key={session._id} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><p className="truncate font-semibold">{session.intention}</p><span className="shrink-0 text-sm font-bold text-primary">{session.durationMinutes}m</span></div><p className="mt-2 text-xs text-muted-foreground">{new Date(session.startedAt).toLocaleDateString()} · {session.distractionCount} distractions noticed</p></div>)}</div> : <p className="py-10 text-center text-muted-foreground">Complete a focus block to begin seeing your patterns.</p>}</CardContent></Card>
    </div>
  );
}
