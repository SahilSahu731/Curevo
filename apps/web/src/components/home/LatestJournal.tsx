"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpenText, CalendarDays } from "lucide-react";

import { blogService } from "@/lib/services/blogService";

export default function LatestJournal() {
  const query = useQuery({ queryKey: ["blog", "latest"], queryFn: () => blogService.listPublished({ limit: 3 }) });
  const posts = query.data?.data || [];
  return (
    <section className="border-y border-border bg-[#f2eee4]/70 px-5 py-24 dark:bg-white/[.025] sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">From the journal</p><h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">Ideas to carry into an imperfect week.</h2></div><Link href="/blog" className="group inline-flex items-center gap-2 self-start text-sm font-bold text-primary lg:mb-2">Browse every note <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></div>
        {query.isLoading && <div className="mt-14 grid gap-4 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-[1.75rem] bg-muted" />)}</div>}
        {!query.isLoading && posts.length > 0 && <div className="mt-14 grid gap-4 lg:grid-cols-3">{posts.map((post, index) => <article key={post.slug} className={`group flex min-h-80 flex-col rounded-[1.75rem] border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_-38px_rgba(32,60,45,.55)] ${index === 0 ? "lg:rotate-[-1deg]" : index === 2 ? "lg:rotate-[1deg]" : ""}`}><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#dce9d7] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#244c3a] dark:bg-emerald-950 dark:text-emerald-200">{post.category}</span><BookOpenText className="size-4 text-muted-foreground" /></div><div className="mt-auto pt-12"><h3 className="text-2xl font-semibold leading-tight tracking-tight"><Link href={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link></h3><p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p><p className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><CalendarDays className="size-3.5" />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "New"}</p></div></article>)}</div>}
        {!query.isLoading && posts.length === 0 && <div className="mt-14 rounded-[2rem] border border-dashed border-border bg-background/60 py-14 text-center"><BookOpenText className="mx-auto size-6 text-muted-foreground" /><p className="mt-4 font-semibold">The first journal notes are being prepared.</p><p className="mt-2 text-sm text-muted-foreground">Come back soon for practical, carefully reviewed writing.</p></div>}
      </div>
    </section>
  );
}
