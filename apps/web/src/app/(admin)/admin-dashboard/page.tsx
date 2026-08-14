"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookHeart, Focus, ListChecks, MessageSquareText, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/lib/services/adminService";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminService.getDashboardStats });
  const stats = data?.stats || {};
  const recentFeedback = data?.recentFeedback || [];
  const cards = [
    { label: "Active members", value: stats.members || 0, note: "personal accounts", icon: Users },
    { label: "Focus blocks", value: stats.completedSessions || 0, note: "completed overall", icon: Focus },
    { label: "Active routines", value: stats.activeRoutines || 0, note: "member-created", icon: ListChecks },
    { label: "Reflections", value: stats.reflections || 0, note: "private entries", icon: BookHeart },
  ];
  const maxMinutes = Math.max(30, ...(stats.usageByDay || []).map((day: { minutes: number }) => day.minutes));

  return <div className="mx-auto max-w-7xl space-y-7 p-2 sm:p-4"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Administration</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Product overview</h1><p className="mt-2 text-muted-foreground">Account operations and aggregate product activity. Private reflection content is not exposed here.</p></div><Button asChild variant="outline" className="rounded-full"><Link href="/admin-dashboard/feedback">Open feedback · {stats.openFeedback || 0}</Link></Button></div><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <Card key={card.label} className="rounded-3xl"><CardContent className="p-5"><div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary"><card.icon className="size-4" /></div><p className="mt-5 text-sm text-muted-foreground">{card.label}</p><p className="mt-1 text-3xl font-semibold">{isLoading ? "…" : card.value}</p><p className="text-xs text-muted-foreground">{card.note}</p></CardContent></Card>)}</section><div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><Card className="rounded-[2rem]"><CardHeader><CardTitle>Aggregate focused minutes</CardTitle><p className="text-sm text-muted-foreground">Seven-day product activity without member-level content.</p></CardHeader><CardContent><div className="flex h-52 items-end gap-3">{(stats.usageByDay || []).length ? stats.usageByDay.map((day: { _id: string; minutes: number; sessions: number }) => <div key={day._id} className="flex h-full flex-1 flex-col justify-end gap-2"><span className="text-center text-xs font-semibold">{day.minutes}</span><div className="relative h-36 overflow-hidden rounded-xl bg-muted"><div className="absolute inset-x-0 bottom-0 rounded-xl bg-primary" style={{ height: `${Math.max(4, (day.minutes / maxMinutes) * 100)}%` }} /></div><span className="text-center text-[10px] text-muted-foreground">{day._id.slice(5)}</span></div>) : <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">No focus activity recorded this week.</div>}</div></CardContent></Card><Card className="rounded-[2rem]"><CardHeader><MessageSquareText className="size-5 text-primary" /><CardTitle className="mt-3">Recent feedback</CardTitle></CardHeader><CardContent className="space-y-3">{recentFeedback.length ? recentFeedback.map((item: { _id: string; subject: string; category: string; status: string; userId?: { name?: string } }) => <div key={item._id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.subject}</p><p className="text-xs capitalize text-muted-foreground">{item.userId?.name || "Member"} · {item.category}</p></div><Badge variant="outline" className="capitalize">{item.status}</Badge></div></div>) : <p className="py-10 text-center text-sm text-muted-foreground">No feedback yet.</p>}</CardContent></Card></div></div>;
}
