import Link from "next/link";
import { FlaskConical, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LabTestsPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <div className="mx-auto max-w-3xl px-4">
        <FlaskConical className="h-9 w-9 text-primary" />
        <p className="mt-5 text-sm font-semibold uppercase text-primary">Not offered in this release</p>
        <h1 className="mt-3 text-4xl font-bold md:text-6xl">Laboratory services</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Curevo does not currently operate a laboratory marketplace, accept lab orders, collect payments, arrange sample collection, or host diagnostic reports. The earlier illustrative catalog and simulated booking flow have been removed.
        </p>
        <div className="mt-10 flex gap-3 border-l-4 border-amber-500 bg-amber-500/10 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
          <p className="text-sm leading-6">For testing decisions and preparation instructions, use a licensed provider and follow advice from a qualified clinician. Do not rely on this prototype for diagnostic guidance.</p>
        </div>
        <Button asChild className="mt-8"><Link href="/doctors">Find an approved clinician</Link></Button>
      </div>
    </main>
  );
}
