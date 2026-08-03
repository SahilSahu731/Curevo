import Link from "next/link";
import { AlertTriangle, CalendarClock, ListChecks, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const scope = [
  { icon: CalendarClock, title: "Appointments", text: "Demonstrates selecting a clinic, clinician, date, and available slot." },
  { icon: ListChecks, title: "Clinic queues", text: "Demonstrates status and position updates for authorized accounts." },
  { icon: Video, title: "Video visits", text: "Demonstrates a scheduled browser-to-browser call between appointment participants." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <section className="mx-auto max-w-5xl px-4">
        <p className="text-sm font-semibold uppercase text-emerald-700 dark:text-emerald-400">Pre-release product</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">About the SmartQueue prototype</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          SmartQueue is a software prototype for evaluating appointment, clinic-queue, record, and video-visit workflows. No public-launch jurisdiction, operating company, clinical sponsor, or healthcare-regulatory role has been approved.
        </p>

        <div className="mt-12 border-l-4 border-amber-500 bg-amber-500/10 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" />
            <p className="text-sm leading-6">Do not enter real patient, clinician-license, or medical information into a review deployment. This service is not approved for diagnosis, treatment, triage, or emergencies.</p>
          </div>
        </div>

        <div className="mt-16 grid gap-8 border-y border-border py-12 md:grid-cols-3">
          {scope.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold">Governance status</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Public launch remains blocked until product, security, privacy, and clinical-safety owners approve the target jurisdiction, intended users, operational controls, and residual risks. Provider listings and seed records may be synthetic demonstration data.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/privacy">Read the Privacy Notice</Link></Button>
            <Button asChild variant="outline"><Link href="/terms">Read the Terms</Link></Button>
          </div>
        </section>
      </section>
    </main>
  );
}
