"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { BlogEditor } from "@/components/admin/BlogEditor";
import { PageLoader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { blogService } from "@/lib/services/blogService";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useQuery({ queryKey: ["admin-blog-post", id], queryFn: () => blogService.getAdmin(id) });
  if (query.isLoading) return <div className="grid min-h-[70svh] place-items-center"><PageLoader text="Opening the editor…" /></div>;
  if (query.isError || !query.data) return <div className="grid min-h-[70svh] place-items-center text-center"><div><h1 className="text-2xl font-semibold">This content could not be opened.</h1><Button className="mt-5" onClick={() => query.refetch()}>Try again</Button></div></div>;
  return <BlogEditor key={`${query.data._id}-${query.data.updatedAt}`} initialPost={query.data} />;
}
