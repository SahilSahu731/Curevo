import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { findBlogPost } from "@/lib/blogContent";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const slug = request.nextUrl.searchParams.get("slug") || "";
  if (!process.env.BLOG_PREVIEW_SECRET || secret !== process.env.BLOG_PREVIEW_SECRET || !findBlogPost(slug, true)) {
    return NextResponse.json({ error: "Invalid preview request" }, { status: 401 });
  }
  const preview = await draftMode();
  preview.enable();
  return NextResponse.redirect(new URL(`/blog/${encodeURIComponent(slug)}`, request.url));
}
