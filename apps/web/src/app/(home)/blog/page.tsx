"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpenText, CalendarDays, Search } from "lucide-react";

import { PublicPageHero } from "@/components/home/PublicPage";
import { BlogCover } from "@/components/blog/BlogCover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogService } from "@/lib/services/blogService";

const categoryTones = [
  "bg-[#dce9d7] text-[#244c3a] dark:bg-emerald-950 dark:text-emerald-200",
  "bg-[#eadcf0] text-[#5c3c68] dark:bg-violet-950 dark:text-violet-200",
  "bg-[#f1d5ca] text-[#713e32] dark:bg-rose-950 dark:text-rose-200",
  "bg-[#f7dfb8] text-[#70471e] dark:bg-amber-950 dark:text-amber-200",
];

export default function BlogPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["blog", "published"], queryFn: () => blogService.listPublished({ limit: 24 }) });
  const posts = query.data?.data || [];
  const categories = ["All", ...(query.data?.categories || [])];
  const shown = useMemo(() => posts.filter((post) => (category === "All" || post.category === category) && (!search.trim() || `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase().includes(search.trim().toLowerCase()))), [posts, category, search]);

  return (
    <div className="overflow-hidden bg-background text-foreground">
      <PublicPageHero eyebrow="The Curevo journal" title={<>Notes for finding a <span className="font-serif italic font-normal text-[#bd624b] dark:text-[#ef9f88]">steadier way through.</span></>} description="Maintainer-reviewed writing about focus, privacy, safety, and the choices behind Curevo. Every published note comes directly from our editorial studio." aside={<><BookOpenText className="size-7 text-primary" aria-hidden="true" /><p className="mt-5 text-3xl font-semibold tracking-tight">{query.isLoading ? "—" : `${query.data?.count || 0} published notes`}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Fresh from the Curevo content team, with clear authorship and publication dates.</p></>} />
      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Browse the journal</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Read what feels useful today.</h2></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search the journal" placeholder="Search notes" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-full pl-9 sm:w-56" /></div><div className="flex flex-wrap gap-2" aria-label="Article categories">{categories.map((item) => <Button key={item} size="sm" className="rounded-full" variant={category === item ? "default" : "outline"} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</Button>)}</div></div>
          </div>
          {query.isLoading && <div className="mt-10 grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-[25rem] animate-pulse rounded-[2rem] bg-muted" />)}</div>}
          {query.isError && <div className="mt-10 rounded-[2rem] border border-dashed py-16 text-center"><p className="font-semibold">The journal could not be loaded.</p><Button variant="outline" className="mt-4 rounded-full" onClick={() => query.refetch()}>Try again</Button></div>}
          {!query.isLoading && !query.isError && <div className="mt-10 grid gap-4 lg:grid-cols-2">{shown.map((post, index) => <article key={post.slug} className="group flex min-h-[25rem] flex-col overflow-hidden rounded-[2rem] border border-border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-38px_rgba(32,60,45,.55)] motion-reduce:transform-none"><BlogCover src={post.coverImage} alt={post.coverAlt} className="aspect-[16/8] border-b" /><div className="flex flex-1 flex-col p-7 sm:p-9"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${categoryTones[index % categoryTones.length]}`}>{post.category}</span><span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><CalendarDays className="size-3.5" />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Draft"}</span></div><div className="mt-auto pt-16"><h3 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl"><Link href={`/blog/${post.slug}`} className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{post.title}</Link></h3><p className="mt-5 max-w-xl leading-7 text-muted-foreground">{post.excerpt}</p><div className="mt-5 flex flex-wrap gap-2">{post.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">#{tag}</span>)}</div><Link href={`/blog/${post.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">Read the note <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" /></Link></div></div></article>)}{shown.length === 0 && <p className="col-span-full rounded-[2rem] border border-dashed border-border py-16 text-center text-muted-foreground">No published notes match that search yet.</p>}</div>}
        </div>
      </section>
    </div>
  );
}
