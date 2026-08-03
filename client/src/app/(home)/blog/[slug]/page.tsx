import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findBlogPost } from "@/lib/blogContent";

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, preview] = await Promise.all([params, draftMode()]);
  const post = findBlogPost(slug, preview.isEnabled);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <article className="mx-auto max-w-3xl px-4">
        {post.status === "draft" && <p className="mb-4 border-l-4 border-amber-500 bg-amber-500/10 p-4 font-semibold">Draft preview. Not published.</p>}
        <p className="text-sm font-semibold text-primary">{post.category}</p>
        <h1 className="mt-3 text-4xl font-bold md:text-6xl">{post.title}</h1>
        <dl className="mt-8 grid gap-3 border-y border-border py-6 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold">Author</dt><dd className="mt-1 text-muted-foreground">{post.author}</dd></div>
          <div><dt className="font-semibold">Editorial review</dt><dd className="mt-1 text-muted-foreground">{post.reviewedBy}</dd></div>
          <div><dt className="font-semibold">Published</dt><dd className="mt-1 text-muted-foreground">{post.publishedAt}</dd></div>
          <div><dt className="font-semibold">Updated</dt><dd className="mt-1 text-muted-foreground">{post.updatedAt}</dd></div>
        </dl>
        <p className="mt-6 border-l-4 border-border pl-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">Medical review:</strong> {post.medicalReview}</p>
        <div className="mt-10 space-y-6 text-lg leading-8 text-muted-foreground">{post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <section className="mt-12"><h2 className="text-2xl font-semibold">Sources</h2><ul className="mt-4 space-y-2">{post.citations.map((citation) => <li key={citation.href}><Link className="text-primary underline" href={citation.href}>{citation.label}</Link></li>)}</ul></section>
        <section className="mt-10"><h2 className="text-2xl font-semibold">Corrections</h2>{post.corrections.length ? <ul className="mt-4 space-y-2">{post.corrections.map((item) => <li key={`${item.date}-${item.note}`}>{item.date}: {item.note}</li>)}</ul> : <p className="mt-3 text-muted-foreground">No corrections recorded.</p>}</section>
      </article>
    </main>
  );
}
