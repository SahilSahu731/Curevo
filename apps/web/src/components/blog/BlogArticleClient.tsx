"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Eye, ShieldCheck, UserRound } from "lucide-react";

import { BlogCover } from "@/components/blog/BlogCover";
import { BlogRenderer } from "@/components/blog/BlogRenderer";
import { PublicPageCta, PublicPageHero } from "@/components/home/PublicPage";
import { Button } from "@/components/ui/button";
import { blogService } from "@/lib/services/blogService";

export function BlogArticleClient({ slug }: { slug: string }) {
  const query = useQuery({ queryKey: ["blog", slug], queryFn: () => blogService.getPublished(slug), retry: false });
  if (query.isLoading) return <div className="min-h-screen bg-background px-5 py-24"><div className="mx-auto max-w-5xl"><div className="h-8 w-36 animate-pulse rounded-full bg-muted" /><div className="mt-8 h-24 max-w-4xl animate-pulse rounded-3xl bg-muted" /><div className="mt-8 h-7 max-w-2xl animate-pulse rounded-xl bg-muted" /><div className="mt-20 space-y-5">{[1, 2, 3, 4].map((item) => <div key={item} className="h-5 animate-pulse rounded bg-muted" />)}</div></div></div>;
  if (query.isError || !query.data) return <div className="grid min-h-[70svh] place-items-center px-5 text-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Curevo journal</p><h1 className="mt-4 text-4xl font-semibold">This note is not available.</h1><p className="mt-3 text-muted-foreground">It may have moved back to drafts or been archived.</p><Button asChild className="mt-7 rounded-full"><Link href="/blog"><ArrowLeft className="size-4" />Return to the journal</Link></Button></div></div>;

  const post = query.data;
  const author = post.author?.name || post.authorId?.name || "Curevo editors";
  return (
    <div className="overflow-hidden bg-background text-foreground">
      <PublicPageHero eyebrow={`${post.category} · Curevo journal`} title={post.title} description={post.excerpt} aside={<dl className="grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-1"><div className="flex gap-3"><UserRound className="mt-0.5 size-4 text-primary" /><div><dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Written by</dt><dd className="mt-1 font-semibold">{author}</dd></div></div><div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 text-primary" /><div><dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Published</dt><dd className="mt-1 font-semibold">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "—"}</dd></div></div><div className="flex gap-3"><Eye className="mt-0.5 size-4 text-primary" /><div><dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reads</dt><dd className="mt-1 font-semibold">{post.viewCount || 0}</dd></div></div></dl>} />
      <article className="px-5 py-16 sm:px-8 lg:py-24"><BlogCover src={post.coverImage} alt={post.coverAlt} className="mx-auto mb-16 aspect-[16/7] max-w-[1100px] rounded-[2rem] border" /><div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[13rem_minmax(0,44rem)] lg:justify-center lg:gap-16"><aside className="lg:sticky lg:top-28 lg:self-start"><Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline"><ArrowLeft className="size-4" />All journal notes</Link><div className="mt-8 rounded-2xl border border-border bg-card p-5"><ShieldCheck className="size-5 text-primary" /><p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">A clear boundary</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Journal content offers general self-guided ideas. It is not diagnosis, treatment, therapy, or emergency guidance.</p></div>{post.tags.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">#{tag}</span>)}</div>}</aside><div><BlogRenderer blocks={post.blocks || []} /></div></div></article>
      <PublicPageCta eyebrow="Keep exploring" title="A useful idea should lead to a manageable next step." description="Browse another journal note, or return to the guided paths when you want to put something into practice." primaryHref="/blog" primaryLabel="Browse the journal" secondaryHref="/#paths" secondaryLabel="Explore guided paths" />
    </div>
  );
}
