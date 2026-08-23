"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CalendarDays, ChevronLeft, ChevronRight, Eye, FilePenLine, MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BlogPost, BlogStatus } from "@/lib/blogTypes";
import { blogService } from "@/lib/services/blogService";

const statusVariant = (status?: BlogStatus) => status === "published" ? "default" : status === "archived" ? "destructive" : "secondary";

export default function ContentManagerPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BlogStatus | "all">("all");
  const [archiving, setArchiving] = useState<BlogPost | null>(null);
  const query = useQuery({ queryKey: ["admin-blog", page, search, status], queryFn: () => blogService.listAdmin({ page, limit: 20, search: search || undefined, status }) });
  const posts = query.data?.data || [];

  const archive = useMutation({
    mutationFn: () => blogService.archive(archiving!._id),
    onSuccess: () => { toast.success("Content moved to archive"); setArchiving(null); queryClient.invalidateQueries({ queryKey: ["admin-blog"] }); queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }); },
    onError: () => toast.error("Content could not be archived"),
  });

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-7 p-2 sm:p-4 lg:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Publishing</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Content studio</h1><p className="mt-2 text-muted-foreground">Draft, organize, preview, publish, and measure every journal note.</p></div>
        <Button asChild size="lg" className="rounded-full"><Link href="/admin-dashboard/content/new"><Plus className="size-4" />Create a journal note</Link></Button>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-3 md:grid-cols-[minmax(220px,1fr)_180px]">
        <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search content" placeholder="Search titles and excerpts" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
        <Select value={status} onValueChange={(value: BlogStatus | "all") => { setStatus(value); setPage(1); }}><SelectTrigger aria-label="Filter content status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="draft">Drafts</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border bg-card">
        <div className="hidden grid-cols-[minmax(0,1fr)_9rem_9rem_8rem_3rem] gap-4 border-b bg-muted/35 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground md:grid"><span>Title</span><span>Status</span><span>Updated</span><span>Views</span><span /></div>
        {query.isLoading && <div className="p-12 text-center text-muted-foreground">Loading content…</div>}
        {query.isError && <div className="p-12 text-center"><p className="text-destructive">Content could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => query.refetch()}>Retry</Button></div>}
        {!query.isLoading && !query.isError && posts.length === 0 && <div className="p-16 text-center"><FilePenLine className="mx-auto size-7 text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">No journal notes here yet</h2><p className="mt-2 text-sm text-muted-foreground">Start a draft and shape it block by block.</p><Button asChild className="mt-6 rounded-full"><Link href="/admin-dashboard/content/new"><Plus className="size-4" />Create the first note</Link></Button></div>}
        {posts.map((post) => (
          <article key={post._id} className="grid gap-4 border-b px-5 py-5 last:border-0 md:grid-cols-[minmax(0,1fr)_9rem_9rem_8rem_3rem] md:items-center md:px-6">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/admin-dashboard/content/${post._id}`} className="truncate font-semibold hover:text-primary">{post.title}</Link>{post.featured && <Badge variant="outline">Featured</Badge>}</div><p className="mt-1 truncate text-xs text-muted-foreground">/{post.slug} · {post.category}</p></div>
            <div><Badge variant={statusVariant(post.status)} className="capitalize">{post.status}</Badge></div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-3.5" />{new Date(post.updatedAt).toLocaleDateString()}</p>
            <p className="flex items-center gap-2 text-sm font-semibold"><Eye className="size-3.5 text-muted-foreground" />{post.viewCount || 0}</p>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${post.title}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`/admin-dashboard/content/${post._id}`}><FilePenLine className="size-4" />Edit</Link></DropdownMenuItem>{post.status === "published" && <DropdownMenuItem asChild><Link href={`/blog/${post.slug}`} target="_blank"><Eye className="size-4" />View live</Link></DropdownMenuItem>}<DropdownMenuItem className="text-destructive focus:text-destructive" disabled={post.status === "archived"} onClick={() => setArchiving(post)}><Archive className="size-4" />Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{query.data?.count || 0} notes</span><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1 || query.isFetching} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="size-4" /></Button><span>Page {page} of {query.data?.totalPages || 1}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={page >= (query.data?.totalPages || 1) || query.isFetching} onClick={() => setPage((value) => value + 1)}><ChevronRight className="size-4" /></Button></div></div>

      <ConfirmDialog open={Boolean(archiving)} onOpenChange={(open) => !open && setArchiving(null)} title="Archive this journal note?" description="It will disappear from the public Journal but remain available in the content studio for later restoration." variant="destructive" isLoading={archive.isPending} onConfirm={() => archive.mutate()} />
    </div>
  );
}
