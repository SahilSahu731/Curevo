"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookHeart, ChevronDown, ChevronUp, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { focusService, type Reflection } from "@/lib/services/focusService";

const feelings: Reflection["feeling"][] = ["clear", "steady", "stretched", "restless", "low"];

function LevelPicker({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <fieldset><legend className="text-sm font-medium">{label}</legend><div className="mt-2 grid grid-cols-5 gap-2">{[1, 2, 3, 4, 5].map((level) => <button key={level} type="button" aria-pressed={value === level} onClick={() => onChange(level)} className="h-11 rounded-xl border text-sm font-bold transition hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">{level}</button>)}</div><div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground"><span>less available</span><span>more available</span></div></fieldset>;
}

export default function ReflectionsPage() {
  const queryClient = useQueryClient();
  const [focusLevel, setFocusLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [feeling, setFeeling] = useState<Reflection["feeling"]>("steady");
  const [win, setWin] = useState("");
  const [friction, setFriction] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: reflections = [], isLoading } = useQuery({ queryKey: ["reflections"], queryFn: () => focusService.getReflections(40) });
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ["reflections"] }); queryClient.invalidateQueries({ queryKey: ["focus-overview"] }); };
  const create = useMutation({
    mutationFn: () => focusService.createReflection({ focusLevel, energyLevel, feeling, win: win.trim() || undefined, friction: friction.trim() || undefined, nextStep: nextStep.trim() || undefined, note: note.trim() || undefined }),
    onSuccess: () => { toast.success("Reflection saved"); setWin(""); setFriction(""); setNextStep(""); setNote(""); refresh(); },
    onError: () => toast.error("Could not save your reflection"),
  });
  const remove = useMutation({ mutationFn: focusService.deleteReflection, onSuccess: () => { toast.success("Reflection removed"); refresh(); } });

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Reflections</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Notice without grading yourself.</h1><p className="mt-3 max-w-2xl text-muted-foreground">Capture what helped, what made the day harder, and one next step. These are private notes—not a diagnosis or wellbeing score.</p></div>

      <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="h-fit rounded-[2rem] border-primary/15 xl:sticky xl:top-24">
          <CardHeader><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><BookHeart className="size-5" /></div><CardTitle className="mt-3">A one-minute check-in</CardTitle><p className="text-sm text-muted-foreground">Use the words that feel closest. Precision is not required.</p></CardHeader>
          <CardContent className="space-y-6">
            <LevelPicker label="How available did your attention feel?" value={focusLevel} onChange={setFocusLevel} />
            <LevelPicker label="How much usable energy did you have?" value={energyLevel} onChange={setEnergyLevel} />
            <fieldset><legend className="text-sm font-medium">Closest feeling</legend><div className="mt-2 flex flex-wrap gap-2">{feelings.map((item) => <button key={item} type="button" aria-pressed={feeling === item} onClick={() => setFeeling(item)} className="rounded-full border px-3 py-2 text-sm font-medium capitalize transition aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">{item}</button>)}</div></fieldset>
            <div className="space-y-2"><Label htmlFor="reflection-win">One thing that helped</Label><Textarea id="reflection-win" value={win} onChange={(event) => setWin(event.target.value)} maxLength={300} placeholder="A small win counts." className="min-h-20" /></div>
            <div className="space-y-2"><Label htmlFor="reflection-friction">What created friction?</Label><Textarea id="reflection-friction" value={friction} onChange={(event) => setFriction(event.target.value)} maxLength={300} placeholder="An interruption, unclear next step, low energy..." className="min-h-20" /></div>
            <div className="space-y-2"><Label htmlFor="reflection-next">Next small step</Label><Textarea id="reflection-next" value={nextStep} onChange={(event) => setNextStep(event.target.value)} maxLength={200} placeholder="Make it visible and kind." className="min-h-20" /></div>
            <div className="space-y-2"><Label htmlFor="reflection-note">Anything else? <span className="font-normal text-muted-foreground">Optional</span></Label><Textarea id="reflection-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} className="min-h-24" /></div>
            <Button className="w-full rounded-full" disabled={create.isPending} onClick={() => create.mutate()}>{create.isPending ? "Saving..." : "Save reflection"}</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-end justify-between"><div><h2 className="text-2xl font-semibold">Your notes</h2><p className="text-sm text-muted-foreground">Newest first · private to your account</p></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold">{reflections.length} saved</span></div>
          {isLoading ? <div className="rounded-[2rem] border p-12 text-center text-muted-foreground">Loading reflections...</div> : reflections.length ? reflections.map((reflection) => {
            const open = expanded === reflection._id;
            return <Card key={reflection._id} className="rounded-[2rem]"><CardContent className="p-5 sm:p-6"><div className="flex items-start gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f1d5ca] text-[#8b4938] dark:bg-rose-950 dark:text-rose-200"><Sparkles className="size-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold capitalize text-primary">{reflection.feeling}</span><span className="text-xs text-muted-foreground">{new Date(reflection.createdAt).toLocaleString()}</span></div><p className="mt-3 text-lg font-medium leading-7">{reflection.win || reflection.nextStep || reflection.note || "A moment was noticed."}</p>{open && <div className="mt-5 grid gap-4 rounded-2xl bg-muted/55 p-4 text-sm sm:grid-cols-2"><div><p className="font-semibold">Attention available</p><p className="text-muted-foreground">{reflection.focusLevel} of 5</p></div><div><p className="font-semibold">Energy available</p><p className="text-muted-foreground">{reflection.energyLevel} of 5</p></div>{reflection.friction && <div className="sm:col-span-2"><p className="font-semibold">Friction</p><p className="mt-1 leading-6 text-muted-foreground">{reflection.friction}</p></div>}{reflection.nextStep && <div className="sm:col-span-2"><p className="font-semibold">Next small step</p><p className="mt-1 leading-6 text-muted-foreground">{reflection.nextStep}</p></div>}{reflection.note && <div className="sm:col-span-2"><p className="font-semibold">Notes</p><p className="mt-1 whitespace-pre-wrap leading-6 text-muted-foreground">{reflection.note}</p></div>}</div>}</div><div className="flex shrink-0 gap-1"><Button size="icon" variant="ghost" aria-label={open ? "Collapse reflection" : "Expand reflection"} onClick={() => setExpanded(open ? null : reflection._id)}>{open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</Button><Button size="icon" variant="ghost" aria-label="Delete reflection" onClick={() => remove.mutate(reflection._id)}><Trash2 className="size-4" /></Button></div></div></CardContent></Card>;
          }) : <div className="rounded-[2rem] border border-dashed p-12 text-center"><BookHeart className="mx-auto size-8 text-primary" /><h2 className="mt-4 text-xl font-semibold">Your first note can be very small</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">“Starting felt easier after I closed two tabs” is enough.</p></div>}
        </div>
      </div>
    </div>
  );
}
