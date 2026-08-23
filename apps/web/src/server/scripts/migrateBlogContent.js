import mongoose from "mongoose";

import "../config/env.js";
import connectDB from "../config/db.js";
import BlogPost from "../models/blogPost.model.js";
import User from "../models/user.model.js";

const starters = [
  {
    slug: "prototype-review-status",
    category: "Product",
    title: "Why this prototype remains review-only",
    excerpt: "What the current release demonstrates and which approvals still block public launch.",
    tags: ["prototype", "transparency", "safety"],
    featured: true,
    blocks: [
      { blockId: "prototype-intro", type: "paragraph", content: "Curevo is a pre-release focus and everyday-wellbeing prototype. It is not an approved healthcare or emergency service.", items: [], tone: "sage" },
      { blockId: "prototype-heading", type: "heading-2", content: "What remains before launch", items: [], tone: "sage" },
      { blockId: "prototype-body", type: "paragraph", content: "A public release remains blocked until an accountable operating entity, target jurisdiction, safety owner, privacy contact, support process, accessibility evidence, and production infrastructure are approved.", items: [], tone: "sage" },
      { blockId: "prototype-callout", type: "callout", content: "Review deployments should use synthetic information. Do not enter sensitive notes or urgent concerns that need a human response.", items: [], tone: "amber" },
    ],
  },
  {
    slug: "account-data-controls",
    category: "Privacy",
    title: "Account data controls in this release",
    excerpt: "A plain-language guide to export, consent choices, and account deletion controls.",
    tags: ["privacy", "account", "data-controls"],
    featured: false,
    blocks: [
      { blockId: "controls-intro", type: "paragraph", content: "Signed-in users can request a portable account export from Profile. The export is generated only after server-side authentication and excludes other users’ data.", items: [], tone: "sage" },
      { blockId: "controls-list-heading", type: "heading-2", content: "Controls available today", items: [], tone: "sage" },
      { blockId: "controls-list", type: "bulleted-list", content: "", items: ["Update profile information", "Download a JSON account export", "Delete personal focus sessions, routines, reflections, feedback, and notifications", "Request deletion of identifying account fields"], tone: "sage" },
      { blockId: "controls-callout", type: "callout", content: "Support requests should avoid sensitive health details. The contact form is intended for product, access, privacy, accessibility, and complaint handling.", items: [], tone: "violet" },
    ],
  },
  {
    slug: "reflection-without-scoring",
    category: "Safety",
    title: "Why Curevo reflections do not produce a score",
    excerpt: "A note can reveal a useful condition without reducing a person to a number.",
    tags: ["reflection", "privacy", "product-design"],
    featured: false,
    blocks: [
      { blockId: "reflection-intro", type: "paragraph", content: "Curevo reflections record the words and 1-to-5 availability levels a member chooses. They do not combine those answers into a mental-health, productivity, or risk score.", items: [], tone: "sage" },
      { blockId: "reflection-quote", type: "quote", content: "Patterns are prompts for curiosity, not assessment results or instructions.", items: [], tone: "sage" },
      { blockId: "reflection-body", type: "paragraph", content: "The progress page describes completed focus minutes, common reflection words, and routine activity. Reflection notes remain with the member account, and members should avoid information they would not place in a prototype environment.", items: [], tone: "sage" },
      { blockId: "reflection-safety", type: "callout", content: "Seek qualified help for ongoing or worsening distress. Curevo cannot provide medical care or crisis support.", items: [], tone: "rose" },
    ],
  },
];

try {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_WRITES !== "true") throw new Error("Production content migration is disabled");
  await connectDB();
  const admin = await User.findOne({ role: "admin", status: "active" }).sort({ createdAt: 1 });
  if (!admin) throw new Error("An active administrator is required before starter content can be migrated");
  let inserted = 0;
  for (const post of starters) {
    const result = await BlogPost.updateOne({ slug: post.slug }, { $setOnInsert: { ...post, status: "published", authorId: admin._id, lastEditedBy: admin._id, publishedAt: new Date() } }, { upsert: true });
    inserted += result.upsertedCount;
  }
  console.log(JSON.stringify({ starterPosts: starters.length, inserted, preserved: starters.length - inserted }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
