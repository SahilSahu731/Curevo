"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, MessageSquare, Search } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/lib/services/adminService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [source, setSource] = useState<"feedback" | "support">("feedback");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ["admin-feedback", source, status, category, search, sortOrder, page],
    queryFn: () => source === "support"
      ? adminService.getSupportTickets({ page, limit: 20, status, category, search, sortOrder })
      : adminService.getFeedback({ page, limit: 20, status, category, search, sortOrder }),
  });
  const tickets = query.data?.data || [];
  const totalPages = query.data?.totalPages || 1;

  const mutation = useMutation({
    mutationFn: ({ ticket, nextStatus }: { ticket: any; nextStatus: string }) => source === "support"
      ? adminService.updateSupportTicket(ticket._id, nextStatus as "accepted" | "in-review" | "resolved" | "closed")
      : adminService.updateFeedback(ticket._id, { status: nextStatus, adminResponse: responses[ticket._id] }),
    onSuccess: () => {
      toast.success("Ticket updated and audited");
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error: any) => toast.error(error.response?.data?.error || "Ticket could not be updated"),
  });

  const reset = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const categories = source === "support"
    ? ["product", "account", "privacy", "accessibility", "complaint", "other"]
    : ["complaint", "bug", "billing", "feature", "content", "other"];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-4 lg:p-8">
      <div><h1 className="text-3xl font-bold tracking-tight">Feedback and support</h1><p className="text-muted-foreground">Review authenticated feedback and public support requests without mixing their delivery states.</p></div>
      <div className="grid gap-3 md:grid-cols-[170px_minmax(220px,1fr)_170px_170px_170px]">
        <Select value={source} onValueChange={(value: "feedback" | "support") => { setSource(value); setStatus("all"); setCategory("all"); setPage(1); }}><SelectTrigger aria-label="Ticket source"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="feedback">User feedback</SelectItem><SelectItem value="support">Public support</SelectItem></SelectContent></Select>
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" aria-label="Search tickets" placeholder={source === "support" ? "Reference, subject, or email" : "Search subject"} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
        <Select value={status} onValueChange={reset(setStatus)}><SelectTrigger aria-label="Filter ticket status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{source === "support" && <SelectItem value="accepted">Accepted</SelectItem>}<SelectItem value="open" disabled={source === "support"}>Open</SelectItem><SelectItem value="in-review">In review</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select>
        <Select value={category} onValueChange={reset(setCategory)}><SelectTrigger aria-label="Filter ticket category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((item) => <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>)}</SelectContent></Select>
        <Select value={sortOrder} onValueChange={reset(setSortOrder)}><SelectTrigger aria-label="Sort tickets"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem></SelectContent></Select>
      </div>

      <div className="grid gap-4">
        {query.isLoading && [1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-lg bg-muted/40" />)}
        {query.isError && <div className="rounded-lg border border-dashed py-16 text-center"><p className="text-destructive">Tickets could not be loaded.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => query.refetch()}>Retry</Button></div>}
        {!query.isLoading && !query.isError && tickets.length === 0 && <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">No tickets match these filters.</div>}
        {tickets.map((ticket: any) => (
          <Card key={ticket._id}>
            <CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />{ticket.subject}</CardTitle><CardDescription>{source === "support" ? `${ticket.reference} · ${ticket.name} · ${ticket.email}` : ticket.userId?.name} · {ticket.category} · {format(new Date(ticket.createdAt), "PPp")}</CardDescription></div><div className="flex flex-wrap justify-end gap-2"><Badge variant="outline" className="capitalize">{ticket.status}</Badge>{source === "support" && <Badge variant={ticket.delivery?.status === "delivered" ? "secondary" : "outline"}>Delivery: {ticket.delivery?.status}</Badge>}</div></div></CardHeader>
            <CardContent className="space-y-3"><p className="whitespace-pre-wrap text-sm text-muted-foreground">{ticket.message}</p>{source === "feedback" && <Textarea aria-label={`Response to ${ticket.subject}`} value={responses[ticket._id] ?? ticket.adminResponse ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [ticket._id]: event.target.value }))} placeholder="Response visible to the submitting user" className="min-h-20" maxLength={3000} />}<div className="flex flex-wrap gap-2">{["in-review", "resolved", "closed"].map((nextStatus) => <Button key={nextStatus} variant={nextStatus === "resolved" ? "default" : "outline"} size="sm" disabled={mutation.isPending || ticket.status === nextStatus} onClick={() => mutation.mutate({ ticket, nextStatus })}>Mark {nextStatus}</Button>)}</div></CardContent>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{query.data?.count || 0} tickets</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" aria-label="Previous page" disabled={page <= 1 || query.isFetching} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><span>Page {page} of {totalPages}</span><Button variant="outline" size="sm" aria-label="Next page" disabled={page >= totalPages || query.isFetching} onClick={() => setPage((value) => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>
    </div>
  );
}
