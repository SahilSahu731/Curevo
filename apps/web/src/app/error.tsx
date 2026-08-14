"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-lg rounded-md border border-border bg-card p-6 text-center shadow-sm" role="alert">
        <AlertTriangle className="mx-auto size-8 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold">This page could not be displayed</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Your entered information has not been intentionally cleared. Try loading this view again.</p>
        <Button className="mt-6" onClick={reset}><RefreshCw className="size-4" />Try again</Button>
      </section>
    </main>
  );
}
