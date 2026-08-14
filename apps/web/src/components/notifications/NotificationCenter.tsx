"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Leaf, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { notificationService, type NotificationItem } from "@/lib/services/notificationService";

type Preferences = { inApp: boolean; email: boolean; focusUpdates: boolean; reminders: boolean; locale: string };

export function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Preferences>({ inApp: true, email: false, focusUpdates: true, reminders: true, locale: "en-IN" });

  const load = async (nextPage = page) => {
    setLoading(true);
    try {
      const [notifications, prefs] = await Promise.all([notificationService.list(nextPage), notificationService.preferences()]);
      setItems(notifications.data); setPage(notifications.pagination.page); setPages(Math.max(1, notifications.pagination.pages)); setUnread(notifications.unread);
      setPreferences((current) => ({ ...current, ...prefs.data }));
    } finally { setLoading(false); }
  };
  useEffect(() => { void load(page); }, [page]);

  const markRead = async (id: string) => {
    await notificationService.markRead(id);
    setItems((current) => current.map((item) => id === "all" || item._id === id ? { ...item, isRead: true } : item));
    setUnread(id === "all" ? 0 : Math.max(0, unread - 1));
  };
  const setPreference = async (key: keyof Preferences, value: boolean) => {
    const next = { ...preferences, [key]: value }; setPreferences(next); await notificationService.updatePreferences({ [key]: value });
  };

  return <div className="mx-auto max-w-6xl space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Notifications</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Quiet reminders, under your control.</h1><p className="mt-3 text-muted-foreground">{unread ? `${unread} unread reminder${unread === 1 ? "" : "s"}` : "You are all caught up."}</p></div><Button variant="outline" className="rounded-full" onClick={() => void markRead("all")} disabled={!unread}><CheckCheck className="mr-2 size-4" />Mark all read</Button></div><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><Card className="rounded-[2rem]"><CardHeader><CardTitle>Your inbox</CardTitle></CardHeader><CardContent>{loading ? <p className="py-12 text-center text-sm text-muted-foreground">Loading reminders...</p> : items.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center text-center text-muted-foreground"><Bell className="size-7" /><p className="mt-3 font-semibold text-foreground">Nothing needs your attention</p><p className="mt-1 max-w-sm text-sm">Routine reminders and important account updates will appear here.</p></div> : <div className="divide-y divide-border">{items.map((item) => <article key={item._id} className={`flex gap-4 py-5 ${item.isRead ? "" : "rounded-2xl bg-primary/5 px-4"}`}><span className={`mt-1 grid size-9 shrink-0 place-items-center rounded-2xl ${item.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{item.type === "routine-reminder" ? <Leaf className="size-4" /> : <Sparkles className="size-4" />}</span><div className="min-w-0 flex-1"><p className="text-sm leading-6">{item.message}</p><p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p><div className="mt-3 flex gap-2">{item.safeLink && <Button variant="outline" size="sm" className="rounded-full" asChild><Link href={item.safeLink}>Open</Link></Button>}{!item.isRead && <Button variant="ghost" size="sm" className="rounded-full" onClick={() => void markRead(item._id)}>Mark read</Button>}</div></div></article>)}</div>}<div className="mt-4 flex items-center justify-between border-t pt-4"><Button variant="ghost" size="icon" aria-label="Previous page" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}><ChevronLeft className="size-4" /></Button><span className="text-xs text-muted-foreground">Page {page} of {pages}</span><Button variant="ghost" size="icon" aria-label="Next page" onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={page >= pages}><ChevronRight className="size-4" /></Button></div></CardContent></Card><Card className="h-fit rounded-[2rem] bg-[#f2eee3] dark:bg-card"><CardHeader><Mail className="size-5 text-primary" /><CardTitle className="mt-3">Delivery choices</CardTitle><p className="text-sm text-muted-foreground">Turn off anything that adds noise.</p></CardHeader><CardContent className="space-y-5">{([ ["inApp", "In-app notifications", "Show reminders inside Curevo"], ["email", "Email delivery", "Also send selected reminders by email"], ["focusUpdates", "Focus updates", "Useful product and focus-space updates"], ["reminders", "Routine reminders", "Gentle prompts for active routines"] ] as const).map(([key, label, note]) => <label key={key} className="flex items-center justify-between gap-4"><span><span className="block text-sm font-semibold">{label}</span><span className="block text-xs leading-5 text-muted-foreground">{note}</span></span><Switch checked={preferences[key]} onCheckedChange={(checked) => void setPreference(key, checked)} /></label>)}</CardContent></Card></div></div>;
}
