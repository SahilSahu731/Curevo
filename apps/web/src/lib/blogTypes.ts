export type BlogBlockType = "paragraph" | "heading-2" | "heading-3" | "quote" | "callout" | "bulleted-list" | "numbered-list" | "divider";
export type BlogTone = "sage" | "amber" | "rose" | "violet";
export type BlogStatus = "draft" | "published" | "archived";

export type BlogBlock = {
  blockId: string;
  type: BlogBlockType;
  content: string;
  items: string[];
  tone: BlogTone;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  status?: BlogStatus;
  featured: boolean;
  coverImage: string;
  coverAlt: string;
  blocks?: BlogBlock[];
  author?: { _id?: string; name?: string; email?: string };
  authorId?: { _id?: string; name?: string; email?: string };
  lastEditedBy?: { _id?: string; name?: string };
  publishedAt?: string;
  createdAt?: string;
  updatedAt: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  viewCount: number;
};

export type BlogDraft = Omit<BlogPost, "_id" | "author" | "authorId" | "lastEditedBy" | "createdAt" | "updatedAt" | "publishedAt" | "viewCount"> & {
  status: BlogStatus;
  blocks: BlogBlock[];
};

export const emptyBlogDraft = (): BlogDraft => ({
  title: "",
  slug: "",
  excerpt: "",
  category: "Focus",
  tags: [],
  status: "draft",
  featured: false,
  coverImage: "",
  coverAlt: "",
  blocks: [{ blockId: crypto.randomUUID(), type: "paragraph", content: "", items: [], tone: "sage" }],
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
});
