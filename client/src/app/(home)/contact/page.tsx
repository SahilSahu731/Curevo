import Link from "next/link";
import { AlertCircle, MessageSquare, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold md:text-6xl">Contact and complaints</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          This prototype does not yet publish an approved business address, support number, privacy mailbox, or emergency line. Those details must be assigned and verified before public launch.
        </p>

        <div className="mt-12 grid gap-8 border-y border-border py-10 md:grid-cols-2">
          <section>
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Product feedback</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Signed-in users can submit product feedback from their dashboard. Do not include medical details, passwords, or urgent concerns.</p>
            <Button asChild className="mt-5"><Link href="/dashboard">Open dashboard</Link></Button>
          </section>
          <section>
            <ShieldQuestion className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Privacy requests</h2>
            <p className="mt-2 leading-7 text-muted-foreground">Use the account settings to download your data or permanently delete the account. A verified complaint contact is still a launch blocker.</p>
            <Button asChild variant="outline" className="mt-5"><Link href="/profile">Open account settings</Link></Button>
          </section>
        </div>

        <div className="mt-10 flex gap-3 border-l-4 border-red-500 bg-red-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700 dark:text-red-300" />
          <p className="text-sm leading-6">This site is not an emergency service. For immediate danger or severe symptoms, contact the emergency service for your location now.</p>
        </div>
      </div>
    </main>
  );
}
