"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishedBlogPosts } from "@/lib/blogContent";

const PAGE_SIZE = 2;

export default function BlogPage() {
  const categories = ["All", ...Array.from(new Set(publishedBlogPosts.map((post) => post.category)))];
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const filtered = useMemo(() => category === "All" ? publishedBlogPosts : publishedBlogPosts.filter((post) => post.category === category), [category]);
  const shown = filtered.slice(0, visible);

  function chooseCategory(next: string) {
    setCategory(next);
    setVisible(PAGE_SIZE);
  }

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-4xl font-bold md:text-6xl">Product notes</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Maintainer-reviewed notes about the current prototype. Each article states its review status, sources, update date, and corrections.</p>
        <div className="mt-8 flex flex-wrap gap-2" aria-label="Article categories">
          {categories.map((item) => <Button key={item} size="sm" variant={category === item ? "default" : "outline"} aria-pressed={category === item} onClick={() => chooseCategory(item)}>{item}</Button>)}
        </div>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {shown.map((post) => (
            <article key={post.slug} className="py-8">
              <p className="text-sm font-semibold text-primary">{post.category} · Updated {post.updatedAt}</p>
              <h2 className="mt-2 text-2xl font-semibold"><Link href={`/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link></h2>
              <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{post.summary}</p>
              <Button asChild variant="link" className="mt-3 h-auto p-0"><Link href={`/blog/${post.slug}`}>Read article <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </article>
          ))}
          {shown.length === 0 && <p className="py-12 text-muted-foreground">No published articles in this category.</p>}
        </div>
        {visible < filtered.length && <Button variant="outline" className="mt-8" onClick={() => setVisible((count) => count + PAGE_SIZE)}>Load more</Button>}
      </div>
    </main>
  );
}
