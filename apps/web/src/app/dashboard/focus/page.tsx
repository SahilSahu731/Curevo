"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Focus, Pause, Play, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { focusService } from "@/lib/services/focusService";

const presets = [10, 25, 45];

export default function FocusPage() {
  const queryClient = useQueryClient();
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [intention, setIntention] = useState("");
  const [closingNote, setClosingNote] = useState("");
  const [distractions, setDistractions] = useState(0);

  const { data: sessions = [] } = useQuery({ queryKey: ["focus-sessions"], queryFn: () => focusService.getSessions(20) });
  const save = useMutation({
    mutationFn: () => {
      const elapsed = Math.max(1, Math.round((minutes * 60 - secondsLeft) / 60));
      return focusService.createSession({ intention: intention.trim(), durationMinutes: elapsed, status: "completed", startedAt: (startedAt || new Date()).toISOString(), completedAt: new Date().toISOString(), distractionCount: distractions, closingNote: closingNote.trim() || undefined });
    },
    onSuccess: () => {
      toast.success("Focus block recorded");
      setRunning(false); setStartedAt(null); setSecondsLeft(minutes * 60); setClosingNote(""); setDistractions(0); setIntention("");
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["focus-overview"] });
    },
    onError: () => toast.error("Could not record this focus block"),
  });
  const remove = useMutation({
    mutationFn: focusService.deleteSession,
    onSuccess: () => { toast.success("Session removed"); queryClient.invalidateQueries({ queryKey: ["focus-sessions"] }); queryClient.invalidateQueries({ queryKey: ["focus-overview"] }); },
  });

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => {
      if (value <= 1) { window.clearInterval(timer); setRunning(false); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const progress = 1 - secondsLeft / (minutes * 60);
  const display = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const canSave = intention.trim().length >= 2 && (secondsLeft < minutes * 60 || secondsLeft === 0);
  const totalThisList = useMemo(() => sessions.filter((item) => item.status === "completed").reduce((sum, item) => sum + item.durationMinutes, 0), [sessions]);

  function choosePreset(value: number) {
    if (running) return;
    setMinutes(value); setSecondsLeft(value * 60); setStartedAt(null);
  }

  function toggle() {
    if (!intention.trim()) return toast.error("Name the one thing you want to return to");
    if (!startedAt) setStartedAt(new Date());
    setRunning((value) => !value);
  }

  function reset() {
    setRunning(false); setStartedAt(null); setSecondsLeft(minutes * 60); setDistractions(0);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Focus space</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Protect one clear block.</h1><p className="mt-3 max-w-2xl text-muted-foreground">A timer is a boundary, not a test. Pause, notice a distraction, and return without starting over.</p></div><div className="rounded-full border bg-card px-4 py-2 text-sm"><span className="font-semibold">{totalThisList} min</span> <span className="text-muted-foreground">in recent history</span></div></div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <Card className="overflow-hidden rounded-[2rem] border-primary/15">
          <CardContent className="p-6 sm:p-10">
            <div className="mx-auto max-w-xl text-center">
              <div className="flex justify-center gap-2">{presets.map((value) => <Button key={value} size="sm" variant={minutes === value ? "default" : "outline"} className="rounded-full" disabled={running} onClick={() => choosePreset(value)}>{value} min</Button>)}</div>
              <div className="relative mx-auto mt-10 grid size-64 place-items-center rounded-full sm:size-72" style={{ background: `conic-gradient(var(--primary) ${progress * 360}deg, color-mix(in oklab, var(--muted) 90%, transparent) 0deg)` }}>
                <div className="grid size-[calc(100%_-_14px)] place-items-center rounded-full bg-card shadow-inner"><div><p className="font-mono text-6xl font-semibold tracking-[-0.07em] sm:text-7xl" aria-live="polite">{display}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{running ? "gently focused" : secondsLeft === 0 ? "block complete" : startedAt ? "paused" : "ready when you are"}</p></div></div>
              </div>
              <div className="mt-9 space-y-2 text-left"><Label htmlFor="intention">What are you returning to?</Label><Input id="intention" value={intention} disabled={running} onChange={(event) => setIntention(event.target.value)} maxLength={120} placeholder="For example: outline the first section" className="h-12 rounded-xl" /></div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button size="lg" className="min-w-36 rounded-full" onClick={toggle}>{running ? <><Pause className="mr-2 size-4" />Pause</> : <><Play className="mr-2 size-4" />{startedAt ? "Continue" : "Begin"}</>}</Button>
                <Button size="lg" variant="outline" className="rounded-full" onClick={reset}><RotateCcw className="mr-2 size-4" />Reset</Button>
                {startedAt && <Button size="lg" variant="outline" className="rounded-full" onClick={() => setDistractions((value) => value + 1)}><Sparkles className="mr-2 size-4" />Noticed a distraction · {distractions}</Button>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] bg-[#f2eee3] dark:bg-card"><CardHeader><CardTitle>Close the loop</CardTitle><p className="text-sm text-muted-foreground">Optional notes help you remember the conditions that worked.</p></CardHeader><CardContent><Label htmlFor="closing-note">What helped you return?</Label><Textarea id="closing-note" value={closingNote} onChange={(event) => setClosingNote(event.target.value)} maxLength={500} placeholder="Phone in another room; started with a rough version..." className="mt-2 min-h-32 rounded-xl bg-background" /><Button className="mt-4 w-full rounded-full" disabled={!canSave || save.isPending} onClick={() => save.mutate()}><CheckCircle2 className="mr-2 size-4" />{save.isPending ? "Recording..." : "Finish and record this block"}</Button></CardContent></Card>
          <div className="rounded-[2rem] border border-amber-300/40 bg-amber-100/55 p-6 text-amber-950 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-100"><Clock3 className="size-5" /><h2 className="mt-4 font-semibold">You can stop on purpose.</h2><p className="mt-2 text-sm leading-6 opacity-75">Finishing a short block is not giving up. It teaches your attention that focus has a safe ending.</p></div>
        </div>
      </div>

      <Card className="rounded-[2rem]"><CardHeader><CardTitle>Recent blocks</CardTitle></CardHeader><CardContent>{sessions.length ? <div className="divide-y divide-border">{sessions.map((session) => <div key={session._id} className="flex flex-wrap items-center gap-4 py-4"><div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Focus className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{session.intention}</p><p className="text-xs text-muted-foreground">{new Date(session.startedAt).toLocaleString()} · {session.distractionCount} distractions noticed{session.closingNote ? ` · ${session.closingNote}` : ""}</p></div><span className="font-semibold">{session.durationMinutes} min</span><Button size="icon" variant="ghost" aria-label={`Delete ${session.intention}`} onClick={() => remove.mutate(session._id)}><Trash2 className="size-4" /></Button></div>)}</div> : <div className="py-12 text-center text-muted-foreground"><Focus className="mx-auto size-6" /><p className="mt-3">Your completed focus blocks will collect here.</p></div>}</CardContent></Card>
    </div>
  );
}
