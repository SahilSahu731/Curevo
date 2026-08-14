"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { notificationService, type NotificationItem } from "@/lib/services/notificationService"

type Preferences = { inApp: boolean; email: boolean; appointmentUpdates: boolean; reminders: boolean; locale: string }

export function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<Preferences>({ inApp: true, email: false, appointmentUpdates: true, reminders: true, locale: "en-IN" })

  const load = async (nextPage = page) => {
    setLoading(true)
    try {
      const [notifications, prefs] = await Promise.all([notificationService.list(nextPage), notificationService.preferences()])
      setItems(notifications.data)
      setPage(notifications.pagination.page)
      setPages(Math.max(1, notifications.pagination.pages))
      setUnread(notifications.unread)
      setPreferences((current) => ({ ...current, ...prefs.data }))
    } finally { setLoading(false) }
  }

  useEffect(() => { void load(page) }, [page])

  const markRead = async (id: string) => {
    await notificationService.markRead(id)
    setItems((current) => current.map((item) => id === "all" || item._id === id ? { ...item, isRead: true } : item))
    setUnread(id === "all" ? 0 : Math.max(0, unread - 1))
  }

  const setPreference = async (key: keyof Preferences, value: boolean) => {
    const next = { ...preferences, [key]: value }
    setPreferences(next)
    await notificationService.updatePreferences({ [key]: value })
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You are all caught up"}</p>
        </div>
        <Button variant="outline" onClick={() => void markRead("all")} disabled={!unread}>
          <CheckCheck className="mr-2 size-4" /> Mark all read
        </Button>
      </header>

      <section className="border-y">
        {loading ? <p className="py-10 text-sm text-muted-foreground">Loading notifications...</p> : items.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-muted-foreground"><Bell className="size-6" /><p>No notifications yet</p></div>
        ) : items.map((item) => (
          <article key={item._id} className={`flex gap-3 border-b px-1 py-4 last:border-b-0 ${item.isRead ? "" : "bg-accent/40"}`}>
            <span className={`mt-1 size-2 shrink-0 rounded-full ${item.isRead ? "bg-muted" : "bg-emerald-500"}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6">{item.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {item.safeLink && <Button variant="ghost" size="sm" asChild><Link href={item.safeLink}>Open</Link></Button>}
              {!item.isRead && <Button variant="ghost" size="icon" title="Mark as read" aria-label="Mark as read" onClick={() => void markRead(item._id)}><CheckCheck className="size-4" /></Button>}
            </div>
          </article>
        ))}
      </section>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" aria-label="Previous page" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1}><ChevronLeft className="size-4" /></Button>
        <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
        <Button variant="outline" size="icon" aria-label="Next page" onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={page >= pages}><ChevronRight className="size-4" /></Button>
      </div>

      <section className="space-y-4 border-t pt-6">
        <div className="flex items-center gap-2"><Mail className="size-4" /><h2 className="font-medium">Delivery preferences</h2></div>
        {([
          ["email", "Email updates"],
          ["appointmentUpdates", "Appointment and queue updates"],
          ["reminders", "Appointment reminders"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex max-w-lg items-center justify-between gap-4 text-sm">
            <span>{label}</span><Switch checked={preferences[key]} onCheckedChange={(checked) => void setPreference(key, checked)} />
          </label>
        ))}
      </section>
    </div>
  )
}
