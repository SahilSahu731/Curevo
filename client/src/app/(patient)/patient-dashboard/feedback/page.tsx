"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { feedbackService } from "@/lib/services/feedbackService";

export default function PatientFeedbackPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("complaint");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data } = useQuery({
    queryKey: ["my-feedback"],
    queryFn: feedbackService.getMyFeedback,
  });

  const mutation = useMutation({
    mutationFn: feedbackService.createFeedback,
    onSuccess: () => {
      toast.success("Feedback submitted");
      setSubject("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["my-feedback"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Could not submit feedback");
    },
  });

  const tickets = data?.data || [];

  return (
    <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback & Complaints</h1>
        <p className="text-muted-foreground">Send issues directly to the platform administration team.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> New Ticket
            </CardTitle>
            <CardDescription>Include enough context for the admin team to respond.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="clinical">Clinical</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Short summary" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What happened?" className="min-h-36" />
            </div>
            <Button
              className="w-full"
              disabled={mutation.isPending || subject.trim().length < 3 || message.trim().length < 10}
              onClick={() => mutation.mutate({ category, subject, message })}
            >
              <Send className="mr-2 h-4 w-4" />
              {mutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket History</CardTitle>
            <CardDescription>Track admin responses and status changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.length ? tickets.map((ticket: any) => (
              <div key={ticket._id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(ticket.createdAt), "PPp")}</div>
                  </div>
                  <Badge variant="outline" className="capitalize">{ticket.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{ticket.message}</p>
                {ticket.adminResponse && (
                  <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                    <span className="font-medium">Admin response: </span>{ticket.adminResponse}
                  </div>
                )}
              </div>
            )) : (
              <div className="py-16 text-center text-muted-foreground">No tickets submitted yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
