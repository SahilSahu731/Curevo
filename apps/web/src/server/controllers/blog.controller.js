import BlogPost from "../models/blogPost.model.js";
import { writeAuditEvent } from "../utils/audit.js";

const slugify = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 180);

const publicPost = (post) => {
  const value = post.toObject ? post.toObject() : post;
  return {
    _id: value._id,
    title: value.title,
    slug: value.slug,
    excerpt: value.excerpt,
    category: value.category,
    tags: value.tags,
    featured: value.featured,
    coverImage: value.coverImage,
    coverAlt: value.coverAlt,
    blocks: value.blocks,
    author: value.authorId,
    publishedAt: value.publishedAt,
    updatedAt: value.updatedAt,
    metaTitle: value.metaTitle,
    metaDescription: value.metaDescription,
    canonicalUrl: value.canonicalUrl,
    viewCount: value.viewCount,
  };
};

const uniqueSlug = async (requested, title, excludeId) => {
  const base = slugify(requested || title) || `note-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (await BlogPost.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    candidate = `${base.slice(0, 174)}-${suffix}`;
    suffix += 1;
  }
  return candidate;
};

export const listPublishedPosts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
    const query = { status: "published", publishedAt: { $lte: new Date() } };
    if (req.query.category) query.category = String(req.query.category).slice(0, 50);
    if (req.query.featured === "true") query.featured = true;
    if (req.query.search) query.$text = { $search: String(req.query.search).slice(0, 100) };
    const [posts, count, categories] = await Promise.all([
      BlogPost.find(query).select("-blocks -lastEditedBy").populate("authorId", "name").sort({ featured: -1, publishedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      BlogPost.countDocuments(query),
      BlogPost.distinct("category", { status: "published", publishedAt: { $lte: new Date() } }),
    ]);
    res.json({ success: true, data: posts.map(publicPost), count, currentPage: page, totalPages: Math.max(1, Math.ceil(count / limit)), categories: categories.sort() });
  } catch {
    res.status(500).json({ success: false, error: "Could not load journal notes" });
  }
};

export const getPublishedPost = async (req, res) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug, status: "published", publishedAt: { $lte: new Date() } },
      { $inc: { viewCount: 1 }, $set: { lastViewedAt: new Date() } },
      { new: true },
    ).populate("authorId", "name");
    if (!post) return res.status(404).json({ success: false, error: "Journal note not found" });
    res.json({ success: true, data: publicPost(post) });
  } catch {
    res.status(500).json({ success: false, error: "Could not load this journal note" });
  }
};

export const listAdminPosts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const query = {};
    if (["draft", "published", "archived"].includes(req.query.status)) query.status = req.query.status;
    if (req.query.category && req.query.category !== "all") query.category = String(req.query.category).slice(0, 50);
    if (req.query.search) {
      const escaped = String(req.query.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [{ title: { $regex: escaped, $options: "i" } }, { excerpt: { $regex: escaped, $options: "i" } }];
    }
    const [posts, count] = await Promise.all([
      BlogPost.find(query).select("-blocks").populate("authorId", "name email").populate("lastEditedBy", "name").sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      BlogPost.countDocuments(query),
    ]);
    res.json({ success: true, data: posts, count, currentPage: page, totalPages: Math.max(1, Math.ceil(count / limit)) });
  } catch {
    res.status(500).json({ success: false, error: "Could not load content" });
  }
};

export const getAdminPost = async (req, res) => {
  const post = await BlogPost.findById(req.params.id).populate("authorId", "name email").populate("lastEditedBy", "name");
  if (!post) return res.status(404).json({ success: false, error: "Content not found" });
  res.json({ success: true, data: post });
};

export const createPost = async (req, res) => {
  try {
    const slug = await uniqueSlug(req.body.slug, req.body.title);
    const publishing = req.body.status === "published";
    const post = await BlogPost.create({
      ...req.body,
      slug,
      authorId: req.user._id,
      lastEditedBy: req.user._id,
      publishedAt: publishing ? new Date() : undefined,
    });
    await writeAuditEvent(req, "blog-create", "success", { metadata: { postId: post._id.toString(), slug, status: post.status } });
    res.status(201).json({ success: true, message: publishing ? "Journal note published" : "Draft created", data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Could not create content" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: "Content not found" });
    const previousStatus = post.status;
    const updates = { ...req.body, lastEditedBy: req.user._id };
    if (req.body.slug || req.body.title) updates.slug = await uniqueSlug(req.body.slug || post.slug, req.body.title || post.title, post._id);
    if (req.body.status === "published" && previousStatus !== "published") updates.publishedAt = new Date();
    if (req.body.status === "draft") updates.publishedAt = undefined;
    Object.assign(post, updates);
    await post.save();
    await writeAuditEvent(req, "blog-update", "success", { metadata: { postId: post._id.toString(), slug: post.slug, from: previousStatus, to: post.status } });
    res.json({ success: true, message: post.status === "published" ? "Journal note published" : "Content saved", data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || "Could not update content" });
  }
};

export const archivePost = async (req, res) => {
  const post = await BlogPost.findByIdAndUpdate(req.params.id, { status: "archived", lastEditedBy: req.user._id }, { new: true });
  if (!post) return res.status(404).json({ success: false, error: "Content not found" });
  await writeAuditEvent(req, "blog-archive", "success", { metadata: { postId: post._id.toString(), slug: post.slug } });
  res.json({ success: true, message: "Content moved to archive", data: post });
};
