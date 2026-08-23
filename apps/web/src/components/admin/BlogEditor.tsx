"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Copy, Eye, FileText, GripVertical, Loader2, Plus, Save, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BlogRenderer } from "@/components/blog/BlogRenderer";
import { BlogCover } from "@/components/blog/BlogCover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { BlogBlock, BlogBlockType, BlogDraft, BlogPost, BlogStatus, BlogTone } from "@/lib/blogTypes";
import { emptyBlogDraft } from "@/lib/blogTypes";
import { blogService } from "@/lib/services/blogService";

const blockLabels: Record<BlogBlockType, string> = {
  paragraph: "Text",
  "heading-2": "Heading 2",
  "heading-3": "Heading 3",
  quote: "Quote",
  callout: "Callout",
  "bulleted-list": "Bulleted list",
  "numbered-list": "Numbered list",
  divider: "Divider",
};

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);

function toDraft(post?: BlogPost): BlogDraft {
  if (!post) return emptyBlogDraft();
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags || [],
    status: post.status || "draft",
    featured: post.featured,
    coverImage: post.coverImage || "",
    coverAlt: post.coverAlt || "",
    blocks: post.blocks?.length ? post.blocks : emptyBlogDraft().blocks,
    metaTitle: post.metaTitle || "",
    metaDescription: post.metaDescription || "",
    canonicalUrl: post.canonicalUrl || "",
  };
}

export function BlogEditor({ initialPost }: { initialPost?: BlogPost }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<BlogDraft>(() => toDraft(initialPost));
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPost));
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const isEditing = Boolean(initialPost?._id);

  const mutation = useMutation({
    mutationFn: (next: BlogDraft) => isEditing ? blogService.update(initialPost!._id, next) : blogService.create(next),
    onSuccess: (response) => {
      setLastSavedAt(new Date());
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["blog"] });
      if (!isEditing) router.replace(`/admin-dashboard/content/${response.data._id}`);
    },
    onError: (error: unknown) => {
      const message = isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
      toast.error(message || "Content could not be saved");
    },
  });

  const save = (status: BlogStatus = draft.status) => {
    if (draft.title.trim().length < 3) return toast.error("Add a title before saving");
    if (draft.excerpt.trim().length < 20) return toast.error("Add an excerpt of at least 20 characters");
    mutation.mutate({ ...draft, slug: draft.slug || toSlug(draft.title), status });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const updateBlock = (blockId: string, update: Partial<BlogBlock>) => setDraft((current) => ({ ...current, blocks: current.blocks.map((block) => block.blockId === blockId ? { ...block, ...update } : block) }));
  const addBlock = (type: BlogBlockType = "paragraph", after?: number) => {
    const block: BlogBlock = { blockId: crypto.randomUUID(), type, content: "", items: type.includes("list") ? [""] : [], tone: "sage" };
    setDraft((current) => {
      const blocks = [...current.blocks];
      blocks.splice(after === undefined ? blocks.length : after + 1, 0, block);
      return { ...current, blocks };
    });
  };
  const removeBlock = (blockId: string) => setDraft((current) => ({ ...current, blocks: current.blocks.filter((block) => block.blockId !== blockId) }));
  const duplicateBlock = (index: number) => setDraft((current) => {
    const blocks = [...current.blocks];
    blocks.splice(index + 1, 0, { ...blocks[index], blockId: crypto.randomUUID(), items: [...blocks[index].items] });
    return { ...current, blocks };
  });
  const moveBlock = (index: number, direction: -1 | 1) => setDraft((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.blocks.length) return current;
    const blocks = [...current.blocks];
    [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
    return { ...current, blocks };
  });

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-muted/20">
      <div className="sticky top-16 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="Back to content" onClick={() => router.push("/admin-dashboard/content")}><ArrowLeft className="size-4" /></Button><div><p className="text-sm font-semibold">{isEditing ? "Edit journal note" : "New journal note"}</p><p className="text-xs text-muted-foreground">{lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Use Ctrl/⌘ + S to save"}</p></div></div>
          <div className="flex items-center gap-2"><Button variant="outline" className="rounded-full" onClick={() => setPreview((value) => !value)}>{preview ? <FileText className="size-4" /> : <Eye className="size-4" />}{preview ? "Edit" : "Preview"}</Button><Button variant="outline" className="rounded-full" disabled={mutation.isPending} onClick={() => save("draft")}><Save className="size-4" />Save draft</Button><Button className="rounded-full" disabled={mutation.isPending} onClick={() => save("published")}>{mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}Publish</Button></div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-6 p-4 md:p-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="rounded-[2rem] border bg-background p-5 shadow-sm sm:p-8 lg:p-12">
          {preview ? (
            <article className="mx-auto max-w-3xl py-8"><Badge className="rounded-full">{draft.category}</Badge><h1 className="mt-6 text-5xl font-semibold leading-[.98] tracking-[-0.05em]">{draft.title || "Untitled note"}</h1><p className="mt-6 text-xl leading-8 text-muted-foreground">{draft.excerpt || "Your excerpt will appear here."}</p><BlogCover src={draft.coverImage} alt={draft.coverAlt} className="mt-10 aspect-[16/9] rounded-[2rem]" /><div className="mt-12"><BlogRenderer blocks={draft.blocks} /></div></article>
          ) : (
            <div className="mx-auto max-w-4xl">
              <Input aria-label="Post title" value={draft.title} onChange={(event) => { const title = event.target.value; setDraft((current) => ({ ...current, title, slug: slugTouched ? current.slug : toSlug(title) })); }} placeholder="Untitled journal note" className="h-auto border-0 bg-transparent px-0 py-2 text-4xl font-semibold tracking-[-0.04em] shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 sm:text-6xl" />
              <Textarea aria-label="Post excerpt" value={draft.excerpt} onChange={(event) => setDraft((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Write a short, clear summary for cards and search results…" maxLength={500} className="mt-5 min-h-24 resize-none border-0 bg-transparent px-0 text-lg leading-8 shadow-none focus-visible:ring-0" />
              <div className="my-8 border-t" />
              <div className="space-y-3">
                {draft.blocks.map((block, index) => (
                  <div key={block.blockId} className="group grid grid-cols-[2rem_minmax(0,1fr)] gap-2 rounded-2xl border border-transparent p-2 transition hover:border-border hover:bg-muted/25">
                    <div className="flex flex-col items-center gap-1 pt-2 text-muted-foreground"><GripVertical className="size-4" /><Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100" disabled={index === 0} onClick={() => moveBlock(index, -1)} aria-label="Move block up"><ArrowUp className="size-3" /></Button><Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100" disabled={index === draft.blocks.length - 1} onClick={() => moveBlock(index, 1)} aria-label="Move block down"><ArrowDown className="size-3" /></Button></div>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Select value={block.type} onValueChange={(type: BlogBlockType) => updateBlock(block.blockId, { type, items: type.includes("list") && !block.items.length ? [""] : block.items })}><SelectTrigger className="h-8 w-40 border-0 bg-muted text-xs"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(blockLabels).map(([type, label]) => <SelectItem key={type} value={type}>{label}</SelectItem>)}</SelectContent></Select>
                        {block.type === "callout" && <Select value={block.tone} onValueChange={(tone: BlogTone) => updateBlock(block.blockId, { tone })}><SelectTrigger className="h-8 w-28 border-0 bg-muted text-xs"><SelectValue /></SelectTrigger><SelectContent>{["sage", "amber", "rose", "violet"].map((tone) => <SelectItem key={tone} value={tone} className="capitalize">{tone}</SelectItem>)}</SelectContent></Select>}
                        <div className="ml-auto flex opacity-0 transition group-hover:opacity-100"><Button variant="ghost" size="icon" className="size-8" onClick={() => duplicateBlock(index)} aria-label="Duplicate block"><Copy className="size-3.5" /></Button><Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeBlock(block.blockId)} aria-label="Delete block"><Trash2 className="size-3.5" /></Button></div>
                      </div>
                      {block.type === "divider" ? <div className="py-5"><hr /></div> : block.type.includes("list") ? <Textarea value={block.items.join("\n")} onChange={(event) => updateBlock(block.blockId, { items: event.target.value.split("\n") })} placeholder="One list item per line" className="min-h-28 resize-y border-0 bg-transparent px-1 leading-7 shadow-none focus-visible:ring-0" /> : <Textarea value={block.content} onChange={(event) => updateBlock(block.blockId, { content: event.target.value })} placeholder={block.type.startsWith("heading") ? "Heading" : block.type === "quote" ? "A memorable quote…" : block.type === "callout" ? "An important note…" : "Type your story…"} className={`${block.type === "heading-2" ? "text-3xl font-semibold" : block.type === "heading-3" ? "text-2xl font-semibold" : block.type === "quote" ? "font-serif text-xl italic" : "text-base"} min-h-16 resize-y border-0 bg-transparent px-1 leading-7 shadow-none focus-visible:ring-0`} />}
                      <Button variant="ghost" size="sm" className="mt-1 h-8 rounded-full text-xs text-muted-foreground opacity-0 group-hover:opacity-100" onClick={() => addBlock("paragraph", index)}><Plus className="size-3" />Add block below</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-dashed p-4"><span className="mr-2 self-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Add block</span>{(["paragraph", "heading-2", "quote", "callout", "bulleted-list", "divider"] as BlogBlockType[]).map((type) => <Button key={type} variant="outline" size="sm" className="rounded-full" onClick={() => addBlock(type)}><Plus className="size-3" />{blockLabels[type]}</Button>)}</div>
            </div>
          )}
        </main>

        <aside className="space-y-4 xl:sticky xl:top-36 xl:self-start">
          <Card className="rounded-[1.5rem]"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Settings2 className="size-4 text-primary" />Publishing</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="post-status">Status</Label><Select value={draft.status} onValueChange={(status: BlogStatus) => setDraft((current) => ({ ...current, status }))}><SelectTrigger id="post-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div><div className="flex items-center justify-between gap-4"><div><Label htmlFor="featured">Featured note</Label><p className="mt-1 text-xs leading-5 text-muted-foreground">Show prominently on the journal.</p></div><Switch id="featured" checked={draft.featured} onCheckedChange={(featured) => setDraft((current) => ({ ...current, featured }))} /></div></CardContent></Card>
          <Card className="rounded-[1.5rem]"><CardHeader><CardTitle className="text-base">Organization</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="post-category">Category</Label><Input id="post-category" value={draft.category} maxLength={50} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} /></div><div className="space-y-2"><Label htmlFor="post-tags">Tags</Label><Input id="post-tags" value={draft.tags.join(", ")} placeholder="focus, routines, gentle starts" onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12) }))} /><p className="text-xs text-muted-foreground">Separate tags with commas.</p></div><div className="space-y-2"><Label htmlFor="post-slug">URL slug</Label><Input id="post-slug" value={draft.slug} onChange={(event) => { setSlugTouched(true); setDraft((current) => ({ ...current, slug: toSlug(event.target.value) })); }} /><p className="break-all text-xs text-muted-foreground">/blog/{draft.slug || "your-note"}</p></div></CardContent></Card>
          <Card className="rounded-[1.5rem]"><CardHeader><CardTitle className="text-base">Featured image</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="cover-image">Image URL or local path</Label><Input id="cover-image" value={draft.coverImage} placeholder="https://… or /journal/image.jpg" onChange={(event) => setDraft((current) => ({ ...current, coverImage: event.target.value }))} /></div><div className="space-y-2"><Label htmlFor="cover-alt">Alternative text</Label><Input id="cover-alt" value={draft.coverAlt} maxLength={240} onChange={(event) => setDraft((current) => ({ ...current, coverAlt: event.target.value }))} /></div></CardContent></Card>
          <Card className="rounded-[1.5rem]"><CardHeader><CardTitle className="text-base">Search and sharing</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="meta-title">SEO title <span className="font-normal text-muted-foreground">({draft.metaTitle.length}/70)</span></Label><Input id="meta-title" value={draft.metaTitle} maxLength={70} onChange={(event) => setDraft((current) => ({ ...current, metaTitle: event.target.value }))} /></div><div className="space-y-2"><Label htmlFor="meta-description">SEO description <span className="font-normal text-muted-foreground">({draft.metaDescription.length}/170)</span></Label><Textarea id="meta-description" value={draft.metaDescription} maxLength={170} className="min-h-24" onChange={(event) => setDraft((current) => ({ ...current, metaDescription: event.target.value }))} /></div><div className="space-y-2"><Label htmlFor="canonical-url">Canonical URL</Label><Input id="canonical-url" type="url" value={draft.canonicalUrl} placeholder="Optional" onChange={(event) => setDraft((current) => ({ ...current, canonicalUrl: event.target.value }))} /></div></CardContent></Card>
        </aside>
      </div>
    </div>
  );
}
