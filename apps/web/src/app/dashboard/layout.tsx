"use client";

import { useState } from "react";
import { CalendarDays, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { authAPI } from "@/api/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { AppearanceControl } from "@/components/common/AppearanceControl";
import { PageLoader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { checking, user } = useRequireAuth({ role: "member" });
  const [sendingVerification, setSendingVerification] = useState(false);
  if (checking) return <div className="grid min-h-screen place-items-center bg-background"><PageLoader text="Opening your focus space..." /></div>;

  async function resendVerification() {
    setSendingVerification(true);
    try {
      await authAPI.resendVerification();
      toast.success("Verification email requested");
    } catch {
      toast.error("Could not request another verification email");
    } finally {
      setSendingVerification(false);
    }
  }

  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_34rem)]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Curevo workspace</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3" />{today}</p>
          </div>
          <AppearanceControl />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {!user?.emailVerifiedAt && (
            <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 rounded-2xl border border-amber-300/50 bg-amber-100/60 p-4 text-amber-950 sm:flex-row sm:items-center dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-100">
              <MailCheck className="size-5 shrink-0" />
              <div className="flex-1"><p className="text-sm font-semibold">Verify your email to save focus sessions, routines, and reflections.</p><p className="mt-0.5 text-xs opacity-70">You can explore your workspace while you wait.</p></div>
              <Button size="sm" variant="outline" className="rounded-full bg-background/70" disabled={sendingVerification} onClick={resendVerification}>{sendingVerification ? "Sending..." : "Resend email"}</Button>
            </div>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
