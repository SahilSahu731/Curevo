"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, BookOpenText, Eye, Focus, MessageSquareText, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminService } from "@/lib/services/adminService";

type Day = { _id: string; minutes?: number; sessions?: number; users?: number };

function BarSeries({ data, valueKey, empty }: { data: Day[]; valueKey: "minutes" | "users"; empty: string }) {
  const max = Math.max(1, ...data.map((day) => day[valueKey] || 0));
  if (!data.length) return <div className="grid h-52 place-items-center text-sm text-muted-foreground">{empty}</div>;
  return <div className="flex h-52 items-end gap-2">{data.map((day) => <div key={day._id} className="flex h-full flex-1 flex-col justify-end gap-2"><span className="text-center text-[10px] font-bold">{day[valueKey] || 0}</span><div className="relative h-36 overflow-hidden rounded-lg bg-muted"><div className="absolute inset-x-0 bottom-0 rounded-lg bg-primary" style={{ height: `${Math.max(3, ((day[valueKey] || 0) / max) * 100)}%` }} /></div><span className="text-center text-[9px] text-muted-foreground">{day._id.slice(5)}</span></div>)}</div>;
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminService.getDashboardStats });
  const stats = data?.stats || {};
  const content = stats.content || {};
  const metrics = [
    { label: "Total accounts", value: stats.totalUsers || 0, icon: Users, note: `${stats.suspendedUsers || 0} suspended` },
    { label: "New accounts", value: (stats.userGrowth || []).reduce((sum: number, day: Day) => sum + (day.users || 0), 0), icon: UserPlus, note: "last 14 days" },
    { label: "Article views", value: content.totalViews || 0, icon: Eye, note: "all published content" },
    { label: "Published notes", value: content.published || 0, icon: BookOpenText, note: `${content.draft || 0} drafts` },
    { label: "Focus blocks", value: stats.completedSessions || 0, icon: Focus, note: "completed overall" },
    { label: "Open requests", value: (stats.openFeedback || 0) + (stats.openSupport || 0), icon: MessageSquareText, note: "feedback and support" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7 p-2 sm:p-4 lg:p-8">
      <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Analytics</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">What is happening across Curevo</h1><p className="mt-2 max-w-3xl text-muted-foreground">Aggregate product and content activity. Private reflection text and member-level wellbeing data are never exposed here.</p></div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{metrics.map(({ label, value, icon: Icon, note }) => <Card key={label} className="rounded-[1.5rem]"><CardContent className="p-6"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-5" /></span><Activity className="size-4 text-muted-foreground/50" /></div><p className="mt-6 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-4xl font-semibold">{isLoading ? "…" : value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></CardContent></Card>)}</section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[2rem]"><CardHeader><CardTitle>Member growth</CardTitle><p className="text-sm text-muted-foreground">New accounts during the last 14 days.</p></CardHeader><CardContent><BarSeries data={stats.userGrowth || []} valueKey="users" empty="No new accounts recorded in this period." /></CardContent></Card>
        <Card className="rounded-[2rem]"><CardHeader><CardTitle>Focused minutes</CardTitle><p className="text-sm text-muted-foreground">Aggregate completed focus activity during the last seven days.</p></CardHeader><CardContent><BarSeries data={stats.usageByDay || []} valueKey="minutes" empty="No focus activity recorded this week." /></CardContent></Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card className="rounded-[2rem]"><CardHeader><CardTitle>Publishing pipeline</CardTitle></CardHeader><CardContent className="space-y-4">{[["Published", content.published || 0, "bg-emerald-500"], ["Draft", content.draft || 0, "bg-amber-500"], ["Archived", content.archived || 0, "bg-muted-foreground"]].map(([label, value, tone]) => <div key={String(label)}><div className="flex justify-between text-sm"><span>{label}</span><span className="font-semibold">{value}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(Number(value) ? 8 : 0, (Number(value) / Math.max(1, (content.published || 0) + (content.draft || 0) + (content.archived || 0))) * 100)}%` }} /></div></div>)}</CardContent></Card>
        <Card className="rounded-[2rem]"><CardHeader><CardTitle>Recent content activity</CardTitle></CardHeader><CardContent className="divide-y">{(data?.recentPosts || []).length ? data.recentPosts.map((post: { _id: string; title: string; status: string; viewCount: number; updatedAt: string }) => <div key={post._id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate font-semibold">{post.title}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{post.status} · updated {new Date(post.updatedAt).toLocaleDateString()}</p></div><span className="shrink-0 text-sm font-semibold">{post.viewCount || 0} views</span></div>) : <p className="py-10 text-center text-sm text-muted-foreground">No content activity yet.</p>}</CardContent></Card>
      </section>
    </div>
  );
}
