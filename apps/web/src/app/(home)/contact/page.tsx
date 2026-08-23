"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { AlertCircle, ArrowUpRight, CheckCircle2, Clock3, Loader2, LockKeyhole, Send } from "lucide-react";

import apiClient from "@/api/client";
import { PublicPageHero } from "@/components/home/PublicPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Receipt = { reference: string; delivered: boolean; message: string };

export default function ContactPage() {
  const [category, setCategory] = useState("product");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setError("");
    const form = new FormData(formElement);
    try {
      const response = await apiClient.post("/support/tickets", {
        name: form.get("name"),
        email: form.get("email"),
        category,
        subject: form.get("subject"),
        message: form.get("message"),
        website: form.get("website"),
      });
      setReceipt({ reference: response.data.data.reference, delivered: response.data.data.delivered, message: response.data.message });
      formElement.reset();
      setCategory("product");
    } catch (requestError: unknown) {
      const responseMessage = isAxiosError<{ error?: string }>(requestError) ? requestError.response?.data?.error : undefined;
      setError(responseMessage || "Your request could not be accepted. Your entries are still here; please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="overflow-hidden bg-background text-foreground">
      <PublicPageHero
        eyebrow="Contact Curevo"
        title={<>Tell us what you <span className="font-serif italic font-normal text-[#bd624b] dark:text-[#ef9f88]">need help with.</span></>}
        description="Send a product, account, privacy, accessibility, or complaint request. Keep sensitive health information, prescriptions, and passwords out of your message."
        aside={
          <div className="space-y-6">
            <div className="flex gap-4"><Clock3 className="mt-1 size-5 shrink-0 text-[#bd624b]" /><div><p className="font-semibold">A clear request is enough</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Share what happened, what you expected, and any relevant page or feature.</p></div></div>
            <div className="flex gap-4 border-t border-border pt-6"><LockKeyhole className="mt-1 size-5 shrink-0 text-primary" /><div><p className="font-semibold">Protect your private details</p><p className="mt-1 text-sm leading-6 text-muted-foreground">We will never ask for your password in this form.</p></div></div>
          </div>
        }
      />

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1300px] gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-16">
          <div className="landing-shadow rounded-[2rem] border border-border bg-card p-6 sm:p-9 lg:p-11">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Support request</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Send us a note</h2></div>
              <span className="rounded-full bg-[#edf1e8] px-3 py-1.5 text-xs font-bold text-[#315c49] dark:bg-emerald-950 dark:text-emerald-200">Please avoid sensitive data</span>
            </div>

            {receipt ? (
              <div className="mt-8 rounded-3xl border border-emerald-700/20 bg-emerald-500/10 p-6" role="status">
                <div className="flex gap-4"><CheckCircle2 className="mt-0.5 size-6 shrink-0 text-emerald-700 dark:text-emerald-300" /><div><h3 className="text-xl font-semibold">Request accepted</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Reference <span className="font-mono font-semibold text-foreground">{receipt.reference}</span>. {receipt.message}</p><p className="mt-2 text-sm font-medium">Inbox delivery: {receipt.delivered ? "confirmed" : "not confirmed"}</p><Button variant="outline" className="mt-5 rounded-full" onClick={() => setReceipt(null)}>Send another request</Button></div></div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-6" noValidate>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="support-name">Name</Label><Input className="h-12 rounded-xl bg-background" id="support-name" name="name" autoComplete="name" minLength={2} maxLength={80} required /></div>
                  <div className="space-y-2"><Label htmlFor="support-email">Email</Label><Input className="h-12 rounded-xl bg-background" id="support-email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="support-category">What is this about?</Label><Select value={category} onValueChange={setCategory}><SelectTrigger id="support-category" className="h-12 w-full rounded-xl bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="product">Product support</SelectItem><SelectItem value="account">Account access</SelectItem><SelectItem value="privacy">Privacy request</SelectItem><SelectItem value="accessibility">Accessibility</SelectItem><SelectItem value="complaint">Complaint</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="support-subject">Subject</Label><Input className="h-12 rounded-xl bg-background" id="support-subject" name="subject" minLength={3} maxLength={160} required /></div>
                <div className="space-y-2"><Label htmlFor="support-message">Message</Label><Textarea className="min-h-44 rounded-xl bg-background" id="support-message" name="message" rows={7} minLength={20} maxLength={3000} required /><p className="text-xs leading-5 text-muted-foreground">20 to 3,000 characters. Requests are retained for 180 days by default.</p></div>
                <div className="absolute -left-[10000px]" aria-hidden="true"><Label htmlFor="support-website">Website</Label><Input id="support-website" name="website" tabIndex={-1} autoComplete="off" /></div>
                {error && <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive" role="alert">{error}</p>}
                <Button type="submit" size="lg" className="w-full rounded-full sm:w-auto" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}{pending ? "Submitting" : "Submit request"}</Button>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-[1.75rem] bg-[#e7eddf] p-7 text-[#244c3a] dark:bg-emerald-950 dark:text-emerald-100">
              <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-65">Account privacy</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">Your data controls live in Profile.</h2>
              <p className="mt-3 text-sm leading-6 opacity-75">Signed-in members can export their account data or request deletion from account settings.</p>
              <Link href="/profile" className="mt-6 inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline">Open account settings <ArrowUpRight className="size-4" /></Link>
            </section>
            <section className="rounded-[1.75rem] border border-border bg-card p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Published contacts</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">No verified support phone, street address, public mailbox, response-time promise, or walk-in location is published for this pre-release deployment.</p>
            </section>
            <section className="rounded-[1.75rem] border border-red-500/20 bg-red-500/10 p-7">
              <AlertCircle className="size-5 text-red-700 dark:text-red-300" />
              <h2 className="mt-4 text-lg font-semibold">Not an emergency service</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">For immediate danger or severe symptoms, contact the emergency service for your location now.</p>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}
