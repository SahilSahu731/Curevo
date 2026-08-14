"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookHeart, Check, Clock3, Focus, Leaf, ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageLoader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { focusService } from "@/lib/services/focusService";
import { useAuthStore } from "@/store/authStore";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function FocusOverview() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["focus-overview"], queryFn: focusService.getOverview });
  const complete = useMutation({
    mutationFn: (id: string) => focusService.completeRoutine(id),
    onSuccess: () => { toast.success("Routine recorded"); queryClient.invalidateQueries({ queryKey: ["focus-overview"] }); },
    onError: () => toast.error("Could not record that routine"),
  });

  if (isLoading) return <PageLoader text="Gathering your space..." />;
  if (isError || !data) return <div className="mx-auto max-w-xl rounded-3xl border bg-card p-8 text-center"><h1 className="text-2xl font-semibold">Your space could not load</h1><p className="mt-2 text-muted-foreground">Nothing was lost. Try the connection again.</p><Button className="mt-5" onClick={() => refetch()}>Try again</Button></div>;

  const maxMinutes = Math.max(30, ...data.daily.map((day) => day.minutes));
  const firstName = user?.name?.split(" ")[0] || "there";
  const summary = data.summary;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#284c3c] p-7 text-white shadow-[0_28px_70px_-38px_rgba(22,57,40,.9)] sm:p-10">
        <div className="absolute -right-20 -top-24 size-80 rounded-full border-[48px] border-white/[.045]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/70">{greeting()}, {firstName}</p>
            <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">What deserves your attention next?</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Choose one clear intention. The rest of the day does not need to be solved before you begin.</p>
          </div>
          <Button asChild size="lg" className="h-13 rounded-full bg-[#f4c66f] px-6 text-[#2d3d2f] hover:bg-[#ffda8c]"><Link href="/dashboard/focus">Start a focus block <ArrowRight className="ml-2 size-4" /></Link></Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="This week at a glance">
        {[
          { label: "Focused today", value: `${summary.todayMinutes} min`, note: "Only completed blocks", icon: Focus, tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
          { label: "This week", value: `${summary.weekMinutes} min`, note: `${summary.completedSessions} finished sessions`, icon: Clock3, tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
          { label: "Active routines", value: summary.activeRoutines, note: "Built around your week", icon: ListChecks, tone: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" },
          { label: "Reflections", value: summary.reflectionsThisWeek, note: "Notes, never scores", icon: BookHeart, tone: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200" },
        ].map((item) => (
          <Card key={item.label} className="rounded-3xl border-border/70 shadow-sm"><CardContent className="p-5"><div className={`flex size-10 items-center justify-center rounded-2xl ${item.tone}`}><item.icon className="size-4" /></div><p className="mt-5 text-sm font-medium text-muted-foreground">{item.label}</p><p className="mt-1 text-3xl font-semibold tracking-tight">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.note}</p></CardContent></Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="rounded-[2rem]">
          <CardHeader className="flex-row items-start justify-between gap-4"><div><CardTitle>Focus rhythm</CardTitle><p className="mt-1 text-sm text-muted-foreground">Minutes you intentionally protected over the last seven days.</p></div><Button asChild variant="ghost" size="sm"><Link href="/dashboard/progress">Details <ArrowRight className="ml-1 size-4" /></Link></Button></CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-2 sm:gap-4">
              {Array.from({ length: 7 }, (_, index) => {
                const date = new Date(); date.setDate(date.getDate() - (6 - index));
                const key = date.toISOString().slice(0, 10);
                const minutes = data.daily.find((day) => day._id === key)?.minutes || 0;
                return <div key={key} className="flex h-full flex-1 flex-col justify-end gap-2"><span className="text-center text-xs font-semibold text-muted-foreground">{minutes || "·"}</span><div className="min-h-1 rounded-t-xl bg-primary/15"><div className="w-full rounded-t-xl bg-primary transition-all" style={{ height: `${Math.max(4, (minutes / maxMinutes) * 170)}px` }} /></div><span className="text-center text-[10px] font-bold uppercase text-muted-foreground">{date.toLocaleDateString("en", { weekday: "short" }).slice(0, 2)}</span></div>;
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] bg-[#f3efe3] dark:bg-card">
          <CardHeader className="flex-row items-start justify-between"><div><CardTitle>Today&apos;s routines</CardTitle><p className="mt-1 text-sm text-muted-foreground">Invitations, not obligations.</p></div><Leaf className="size-5 text-primary" /></CardHeader>
          <CardContent className="space-y-3">
            {data.routines.length ? data.routines.slice(0, 4).map((routine) => (
              <div key={routine._id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/75 p-3.5">
                <button aria-label={`Complete ${routine.title}`} disabled={complete.isPending} onClick={() => complete.mutate(routine._id)} className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/30 text-primary transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50"><Check className="size-4" /></button>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{routine.title}</p><p className="text-xs text-muted-foreground">{routine.preferredTime} · {routine.durationMinutes} min</p></div>
              </div>
            )) : <div className="rounded-2xl border border-dashed p-6 text-center"><Sparkles className="mx-auto size-5 text-primary" /><p className="mt-3 font-semibold">Build your first gentle routine</p><p className="mt-1 text-sm text-muted-foreground">Give a helpful action a reliable cue.</p></div>}
            <Button asChild variant="outline" className="w-full rounded-full"><Link href="/dashboard/routines">Manage routines</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[2rem]"><CardHeader><CardTitle>Recent focus blocks</CardTitle></CardHeader><CardContent className="space-y-3">{data.recentSessions.length ? data.recentSessions.map((session) => <div key={session._id} className="flex items-center gap-4 border-b border-border/60 py-3 last:border-0"><div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Focus className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{session.intention}</p><p className="text-xs text-muted-foreground">{new Date(session.startedAt).toLocaleDateString()} · {session.distractionCount} distractions noticed</p></div><span className="text-sm font-semibold">{session.durationMinutes}m</span></div>) : <p className="py-8 text-center text-sm text-muted-foreground">Your completed focus blocks will appear here.</p>}</CardContent></Card>
        <Card className="rounded-[2rem]"><CardHeader><CardTitle>Latest reflection</CardTitle></CardHeader><CardContent>{data.latestReflection ? <div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold capitalize text-primary">Feeling {data.latestReflection.feeling}</span><p className="mt-5 text-lg font-medium leading-8">{data.latestReflection.win || data.latestReflection.nextStep || "You paused long enough to notice what was here."}</p>{data.latestReflection.nextStep && <p className="mt-4 border-l-2 border-primary pl-4 text-sm text-muted-foreground">Next small step: {data.latestReflection.nextStep}</p>}</div> : <div className="py-8 text-center"><BookHeart className="mx-auto size-6 text-primary" /><p className="mt-3 font-semibold">Close the loop gently</p><p className="mt-1 text-sm text-muted-foreground">A reflection takes about a minute.</p></div>}<Button asChild variant="outline" className="mt-6 w-full rounded-full"><Link href="/dashboard/reflections">Open reflections</Link></Button></CardContent></Card>
      </div>
    </div>
  );
}
