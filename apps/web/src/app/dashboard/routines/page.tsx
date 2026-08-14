"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, Leaf, Plus, Power, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { focusService, type Routine } from "@/lib/services/focusService";

const week = [
  ["mon", "M"], ["tue", "T"], ["wed", "W"], ["thu", "T"], ["fri", "F"], ["sat", "S"], ["sun", "S"],
];
const tones: Record<Routine["color"], string> = {
  forest: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  clay: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  plum: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
};

export default function RoutinesPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [cue, setCue] = useState("");
  const [duration, setDuration] = useState("25");
  const [time, setTime] = useState("09:00");
  const [color, setColor] = useState<Routine["color"]>("forest");
  const [days, setDays] = useState(["mon", "tue", "wed", "thu", "fri"]);
  const { data: routines = [], isLoading } = useQuery({ queryKey: ["routines"], queryFn: focusService.getRoutines });
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ["routines"] }); queryClient.invalidateQueries({ queryKey: ["focus-overview"] }); };

  const create = useMutation({
    mutationFn: () => focusService.createRoutine({ title: title.trim(), cue: cue.trim() || undefined, durationMinutes: Number(duration), days, preferredTime: time, color }),
    onSuccess: () => { toast.success("Routine created"); setTitle(""); setCue(""); refresh(); },
    onError: () => toast.error("Could not create that routine"),
  });
  const update = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Routine> }) => focusService.updateRoutine(id, data), onSuccess: refresh, onError: () => toast.error("Could not update routine") });
  const complete = useMutation({ mutationFn: (id: string) => focusService.completeRoutine(id), onSuccess: () => { toast.success("Routine recorded"); refresh(); }, onError: () => toast.error("Could not record routine") });
  const remove = useMutation({ mutationFn: focusService.deleteRoutine, onSuccess: () => { toast.success("Routine removed"); refresh(); }, onError: () => toast.error("Could not remove routine") });

  const toggleDay = (day: string) => setDays((current) => current.includes(day) ? (current.length === 1 ? current : current.filter((item) => item !== day)) : [...current, day]);

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Routines</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Make the helpful thing easier to find.</h1><p className="mt-3 max-w-2xl text-muted-foreground">A routine pairs a small action with a reliable cue. It stays flexible when the day changes.</p></div>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <Card className="h-fit rounded-[2rem] border-primary/15 xl:sticky xl:top-24">
          <CardHeader><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Plus className="size-5" /></div><CardTitle className="mt-3">Create a routine</CardTitle><p className="text-sm text-muted-foreground">Keep it concrete enough to begin on a low-energy day.</p></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2"><Label htmlFor="routine-title">Small action</Label><Input id="routine-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} placeholder="Clear the desk for five minutes" /></div>
            <div className="space-y-2"><Label htmlFor="routine-cue">When or after what?</Label><Textarea id="routine-cue" value={cue} onChange={(event) => setCue(event.target.value)} maxLength={160} placeholder="After I make my morning drink..." className="min-h-20" /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="routine-duration">Minutes</Label><Input id="routine-duration" type="number" min={1} max={180} value={duration} onChange={(event) => setDuration(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="routine-time">Preferred time</Label><Input id="routine-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} /></div></div>
            <fieldset><legend className="text-sm font-medium">Days</legend><div className="mt-2 grid grid-cols-7 gap-1">{week.map(([key, label]) => <button type="button" key={key} aria-pressed={days.includes(key)} onClick={() => toggleDay(key)} className="aspect-square rounded-full border text-xs font-bold transition aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">{label}</button>)}</div></fieldset>
            <div className="space-y-2"><Label>Colour cue</Label><Select value={color} onValueChange={(value) => setColor(value as Routine["color"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="forest">Forest</SelectItem><SelectItem value="clay">Clay</SelectItem><SelectItem value="amber">Amber</SelectItem><SelectItem value="sky">Sky</SelectItem><SelectItem value="plum">Plum</SelectItem></SelectContent></Select></div>
            <Button className="w-full rounded-full" disabled={create.isPending || title.trim().length < 2 || days.length === 0} onClick={() => create.mutate()}>{create.isPending ? "Creating..." : "Create routine"}</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><h2 className="text-2xl font-semibold">Your routines</h2><p className="text-sm text-muted-foreground">{routines.filter((routine) => routine.active).length} active</p></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">No streak penalties</span></div>
          {isLoading ? <div className="rounded-[2rem] border p-10 text-center text-muted-foreground">Loading routines...</div> : routines.length ? routines.map((routine) => (
            <Card key={routine._id} className={`rounded-[2rem] transition ${routine.active ? "" : "opacity-60"}`}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <button disabled={!routine.active || complete.isPending} onClick={() => complete.mutate(routine._id)} aria-label={`Complete ${routine.title}`} className={`grid size-14 shrink-0 place-items-center rounded-2xl transition hover:scale-105 disabled:hover:scale-100 ${tones[routine.color]}`}><Check className="size-6" /></button>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold">{routine.title}</h3>{!routine.active && <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase">Paused</span>}</div>{routine.cue && <p className="mt-1 text-sm text-muted-foreground">{routine.cue}</p>}<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3" />{routine.preferredTime} · {routine.durationMinutes} min</span><span>{routine.days.map((day) => day[0].toUpperCase()).join(" · ")}</span><span>{routine.completionCount} times completed</span></div></div>
                  <div className="flex gap-2"><Button variant="outline" size="icon" aria-label={routine.active ? `Pause ${routine.title}` : `Resume ${routine.title}`} onClick={() => update.mutate({ id: routine._id, data: { active: !routine.active } })}><Power className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${routine.title}`} onClick={() => remove.mutate(routine._id)}><Trash2 className="size-4" /></Button></div>
                </div>
              </CardContent>
            </Card>
          )) : <div className="rounded-[2rem] border border-dashed p-12 text-center"><Leaf className="mx-auto size-8 text-primary" /><h2 className="mt-4 text-xl font-semibold">Start with one reliable anchor</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Choose something small enough that completing it feels possible, not impressive.</p></div>}
          <div className="rounded-[2rem] border bg-[#f2eee3] p-6 dark:bg-card"><Sparkles className="size-5 text-primary" /><p className="mt-3 font-semibold">A routine can be useful even when it is not daily.</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Pause anything that has become noise. Your plan should make the week lighter, not create another backlog.</p></div>
        </div>
      </div>
    </div>
  );
}
