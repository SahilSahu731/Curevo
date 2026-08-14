"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquareText, Send } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { feedbackService } from "@/lib/services/feedbackService";

export default function FeedbackPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("feature");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { data } = useQuery({ queryKey: ["my-feedback"], queryFn: feedbackService.getMyFeedback });
  const mutation = useMutation({
    mutationFn: feedbackService.createFeedback,
    onSuccess: () => { toast.success("Feedback sent"); setSubject(""); setMessage(""); queryClient.invalidateQueries({ queryKey: ["my-feedback"] }); },
    onError: () => toast.error("Could not send feedback"),
  });
  const tickets = data?.data || [];

  return <div className="mx-auto max-w-7xl space-y-7"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Feedback</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Help shape a calmer product.</h1><p className="mt-3 max-w-2xl text-muted-foreground">Report a problem, question a piece of content, or suggest a gentler way for something to work.</p></div><div className="grid gap-6 lg:grid-cols-[420px_1fr]"><Card className="h-fit rounded-[2rem]"><CardHeader><MessageSquareText className="size-5 text-primary" /><CardTitle className="mt-3">Send feedback</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="feature">Feature idea</SelectItem><SelectItem value="bug">Bug</SelectItem><SelectItem value="content">Content concern</SelectItem><SelectItem value="billing">Billing</SelectItem><SelectItem value="complaint">Complaint</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="feedback-subject">Subject</Label><Input id="feedback-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} /></div><div className="space-y-2"><Label htmlFor="feedback-message">What should we know?</Label><Textarea id="feedback-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={3000} className="min-h-40" /></div><Button className="w-full rounded-full" disabled={mutation.isPending || subject.trim().length < 3 || message.trim().length < 10} onClick={() => mutation.mutate({ category, subject, message })}><Send className="mr-2 size-4" />{mutation.isPending ? "Sending..." : "Send feedback"}</Button></CardContent></Card><Card className="rounded-[2rem]"><CardHeader><CardTitle>Your conversations</CardTitle><p className="text-sm text-muted-foreground">Updates from the product team appear here.</p></CardHeader><CardContent className="space-y-3">{tickets.length ? tickets.map((ticket: { _id: string; subject: string; createdAt: string; status: string; message: string; adminResponse?: string }) => <div key={ticket._id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{ticket.subject}</p><p className="text-xs text-muted-foreground">{format(new Date(ticket.createdAt), "PPp")}</p></div><Badge variant="outline" className="capitalize">{ticket.status}</Badge></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{ticket.message}</p>{ticket.adminResponse && <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm"><span className="font-semibold">Curevo: </span>{ticket.adminResponse}</div>}</div>) : <div className="py-16 text-center text-muted-foreground">No feedback conversations yet.</div>}</CardContent></Card></div></div>;
}
