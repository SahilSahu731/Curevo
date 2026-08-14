import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Camera, LockKeyhole, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TelehealthPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative flex min-h-[78vh] items-end overflow-hidden pb-16 pt-28">
        <Image src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=85&w=2000" alt="Clinician speaking with a patient by video" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="container relative mx-auto px-4 text-white">
          <p className="text-sm font-semibold uppercase text-emerald-300">Scheduled video-visit prototype</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold md:text-7xl">Video visits for authorized appointment participants</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200">This workflow demonstrates a browser-to-browser call. Provider eligibility, identity, licensing, care availability, connection quality, and regulatory suitability are not guaranteed.</p>
          <Button asChild size="lg" className="mt-8"><Link href="/book"><Video className="mr-2 h-5 w-5" />Request a video appointment</Link></Button>
        </div>
      </section>

      <section className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-3">
        <div><LockKeyhole className="h-6 w-6 text-primary" /><h2 className="mt-4 text-xl font-semibold">Appointment authorization</h2><p className="mt-2 leading-7 text-muted-foreground">The API and Socket.IO server check that a participant is the appointment patient, assigned clinician, or administrator before room access.</p></div>
        <div><Camera className="h-6 w-6 text-primary" /><h2 className="mt-4 text-xl font-semibold">Pre-join consent</h2><p className="mt-2 leading-7 text-muted-foreground">Camera and microphone access begins only after the signed-in user accepts the current video-visit limitation notice.</p></div>
        <div><AlertTriangle className="h-6 w-6 text-primary" /><h2 className="mt-4 text-xl font-semibold">Known limitations</h2><p className="mt-2 leading-7 text-muted-foreground">No recording, emergency response, service-level guarantee, dedicated TURN service, or approved telehealth jurisdiction is documented.</p></div>
      </section>

      <section className="border-y border-red-200 bg-red-50 py-10 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
        <div className="container mx-auto flex max-w-4xl gap-4 px-4"><AlertTriangle className="mt-1 h-6 w-6 shrink-0" /><div><h2 className="text-xl font-semibold">Not for emergencies</h2><p className="mt-2 leading-7">Do not wait for a video visit if symptoms are severe, rapidly worsening, or life-threatening. Contact the emergency service for your location now.</p></div></div>
      </section>
    </main>
  );
}
