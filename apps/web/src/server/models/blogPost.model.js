import mongoose from "mongoose";

const BlogBlockSchema = new mongoose.Schema({
  blockId: { type: String, required: true, maxlength: 80 },
  type: {
    type: String,
    enum: ["paragraph", "heading-2", "heading-3", "quote", "callout", "bulleted-list", "numbered-list", "divider"],
    required: true,
  },
  content: { type: String, trim: true, maxlength: 10_000, default: "" },
  items: [{ type: String, trim: true, maxlength: 500 }],
  tone: { type: String, enum: ["sage", "amber", "rose", "violet"], default: "sage" },
}, { _id: false });

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180, index: true },
  excerpt: { type: String, required: true, trim: true, maxlength: 500 },
  category: { type: String, required: true, trim: true, maxlength: 50, index: true },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
  featured: { type: Boolean, default: false, index: true },
  coverImage: { type: String, trim: true, maxlength: 2_000, default: "" },
  coverAlt: { type: String, trim: true, maxlength: 240, default: "" },
  blocks: { type: [BlogBlockSchema], default: [] },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  publishedAt: { type: Date, index: true },
  metaTitle: { type: String, trim: true, maxlength: 70, default: "" },
  metaDescription: { type: String, trim: true, maxlength: 170, default: "" },
  canonicalUrl: { type: String, trim: true, maxlength: 2_000, default: "" },
  viewCount: { type: Number, min: 0, default: 0 },
  lastViewedAt: Date,
}, { timestamps: true });

BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ title: "text", excerpt: "text", tags: "text" });

export default mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
