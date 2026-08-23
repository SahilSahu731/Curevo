import type { Metadata } from "next";

import { BlogArticleClient } from "@/components/blog/BlogArticleClient";
import BlogPost from "@/server/models/blogPost.model.js";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await BlogPost.findOne({ slug, status: "published", publishedAt: { $lte: new Date() } })
      .select("title excerpt metaTitle metaDescription canonicalUrl coverImage")
      .lean() as unknown as { title: string; excerpt: string; metaTitle?: string; metaDescription?: string; canonicalUrl?: string; coverImage?: string } | null;
    if (!post) return { title: "Journal note not found | Curevo" };
    const title = post.metaTitle || `${post.title} | Curevo Journal`;
    const description = post.metaDescription || post.excerpt;
    return {
      title,
      description,
      alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
      openGraph: { title, description, type: "article", images: post.coverImage ? [{ url: post.coverImage }] : undefined },
    };
  } catch {
    return { title: "Curevo Journal" };
  }
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogArticleClient slug={slug} />;
}
