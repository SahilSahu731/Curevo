"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/adminService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", status],
    queryFn: () => adminService.getFeedback({ status }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, nextStatus, adminResponse }: { id: string; nextStatus: string; adminResponse?: string }) =>
      adminService.updateFeedback(id, { status: nextStatus, adminResponse }),
    onSuccess: () => {
      toast.success("Ticket updated");
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => toast.error("Could not update ticket"),
  });

  const tickets = data?.data || [];

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Center</h1>
          <p className="text-muted-foreground">Review complaints, bugs, and platform requests.</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((item) => <div key={item} className="h-44 rounded-xl bg-muted/40 animate-pulse" />)
        ) : tickets.length ? tickets.map((ticket: any) => (
          <Card key={ticket._id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> {ticket.subject}
                  </CardTitle>
                  <CardDescription>
                    {ticket.userId?.name} • {ticket.category} • {format(new Date(ticket.createdAt), "PPp")}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="capitalize">{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{ticket.message}</p>
              <Textarea
                value={responses[ticket._id] ?? ticket.adminResponse ?? ""}
                onChange={(event) => setResponses((current) => ({ ...current, [ticket._id]: event.target.value }))}
                placeholder="Admin response..."
                className="min-h-20"
              />
              <div className="flex flex-wrap gap-2">
                {["in-review", "resolved", "closed"].map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    variant={nextStatus === "resolved" ? "default" : "outline"}
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ id: ticket._id, nextStatus, adminResponse: responses[ticket._id] })}
                  >
                    Mark {nextStatus}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="rounded-xl border border-dashed py-20 text-center text-muted-foreground">No tickets found.</div>
        )}
      </div>
    </div>
  );
}
