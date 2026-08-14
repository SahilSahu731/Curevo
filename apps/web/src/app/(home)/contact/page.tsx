"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Send, ShieldQuestion } from "lucide-react";
import apiClient from "@/api/client";
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
      setReceipt({
        reference: response.data.data.reference,
        delivered: response.data.data.delivered,
        message: response.data.message,
      });
      formElement.reset();
      setCategory("product");
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || "Your request could not be accepted. Your entries are still here; please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <div className="mx-auto max-w-5xl px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold md:text-6xl">Contact support</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Submit a product, account, privacy, accessibility, or complaint request. Do not include symptoms, diagnoses, prescriptions, passwords, or urgent medical information.
          </p>
        </div>

        <div className="mt-12 grid gap-12 border-y border-border py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section aria-labelledby="support-form-title">
            <h2 id="support-form-title" className="text-2xl font-semibold">Send a request</h2>
            {receipt ? (
              <div className="mt-6 border-l-4 border-emerald-500 bg-emerald-500/10 p-5" role="status">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                  <div>
                    <p className="font-semibold">Request accepted: {receipt.reference}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{receipt.message}</p>
                    <p className="mt-2 text-sm font-medium">Inbox delivery: {receipt.delivered ? "confirmed" : "not confirmed"}</p>
                    <Button variant="outline" className="mt-4" onClick={() => setReceipt(null)}>Send another request</Button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-name">Name</Label>
                    <Input id="support-name" name="name" autoComplete="name" minLength={2} maxLength={80} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Email</Label>
                    <Input id="support-email" name="email" type="email" autoComplete="email" maxLength={254} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="support-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product support</SelectItem>
                      <SelectItem value="account">Account access</SelectItem>
                      <SelectItem value="privacy">Privacy request</SelectItem>
                      <SelectItem value="accessibility">Accessibility</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-subject">Subject</Label>
                  <Input id="support-subject" name="subject" minLength={3} maxLength={160} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-message">Message</Label>
                  <Textarea id="support-message" name="message" rows={7} minLength={20} maxLength={3000} required />
                  <p className="text-xs text-muted-foreground">20 to 3,000 characters. Requests are retained for 180 days by default.</p>
                </div>
                <div className="absolute -left-[10000px]" aria-hidden="true">
                  <Label htmlFor="support-website">Website</Label>
                  <Input id="support-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                <Button type="submit" disabled={pending}>
                  {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {pending ? "Submitting" : "Submit request"}
                </Button>
              </form>
            )}
          </section>

          <aside className="space-y-8">
            <section>
              <ShieldQuestion className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Published contacts</h2>
              <p className="mt-2 leading-7 text-muted-foreground">No verified support phone, street address, public mailbox, response-time promise, or walk-in location is published for this pre-release deployment.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">Account privacy</h2>
              <p className="mt-2 leading-7 text-muted-foreground">Signed-in users can export their account data or request deletion from account settings.</p>
              <Button asChild variant="outline" className="mt-4"><Link href="/profile">Account settings</Link></Button>
            </section>
          </aside>
        </div>

        <div className="mt-10 flex gap-3 border-l-4 border-red-500 bg-red-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700 dark:text-red-300" />
          <p className="text-sm leading-6">This form is not monitored as an emergency service. For immediate danger or severe symptoms, contact the emergency service for your location now.</p>
        </div>
      </div>
    </main>
  );
}
