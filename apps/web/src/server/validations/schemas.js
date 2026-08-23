import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const blogBlock = z.object({
  blockId: z.string().trim().min(1).max(80),
  type: z.enum(["paragraph", "heading-2", "heading-3", "quote", "callout", "bulleted-list", "numbered-list", "divider"]),
  content: z.string().trim().max(10_000).default(""),
  items: z.array(z.string().trim().max(500)).max(100).default([]),
  tone: z.enum(["sage", "amber", "rose", "violet"]).default("sage"),
}).strict();

const blogFields = {
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180).optional(),
  excerpt: z.string().trim().min(20).max(500),
  category: z.string().trim().min(2).max(50),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  coverImage: z.union([z.string().trim().url().max(2_000), z.literal("")]).default(""),
  coverAlt: z.string().trim().max(240).default(""),
  blocks: z.array(blogBlock).max(200).default([]),
  metaTitle: z.string().trim().max(70).default(""),
  metaDescription: z.string().trim().max(170).default(""),
  canonicalUrl: z.union([z.string().trim().url().max(2_000), z.literal("")]).default(""),
};

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().toLowerCase(),
      password: z.string().min(12).max(128),
      role: z.literal("member").optional(),
      acceptedTerms: z.union([z.literal(true), z.literal("true")]),
      policyVersion: z.literal("2026-08-03"),
      remember: z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")]).optional(),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().trim().email().toLowerCase(),
      password: z.string().min(1),
      remember: z.boolean().optional(),
    }),
  }),
  forgotPassword: z.object({ body: z.object({ email: z.string().trim().email().toLowerCase() }) }),
  resetPassword: z.object({
    body: z.object({ token: z.string().min(20).max(300), password: z.string().min(12).max(128) }),
  }),
  token: z.object({ body: z.object({ token: z.string().min(20).max(300) }) }),
  passwordChange: z.object({
    body: z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(12).max(128) }),
  }),
  profileUpdate: z.object({
    body: z.object({
      name: z.string().trim().min(2).max(80).optional(),
      phone: z.union([z.string().trim().regex(/^\+?[1-9]\d{1,14}$/), z.literal("")]).transform((value) => value || undefined).optional(),
      address: z.object({
        street: z.string().trim().max(120).optional(),
        city: z.string().trim().max(80).optional(),
        state: z.string().trim().max(80).optional(),
        zipCode: z.string().trim().max(20).optional(),
        country: z.string().trim().max(80).optional(),
      }).strict().optional(),
      gender: z.enum(["male", "female", "other"]).optional(),
      dateOfBirth: z.coerce.date().max(new Date()).optional(),
      bio: z.string().trim().max(500).optional(),
    }).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one update"),
  }),
  emailChange: z.object({
    body: z.object({ newEmail: z.string().trim().email().toLowerCase(), currentPassword: z.string().max(128).optional() }),
  }),
  mfaCode: z.object({ body: z.object({ code: z.string().regex(/^\d{6}$/) }) }),
  mfaLogin: z.object({
    body: z.object({
      code: z.string().regex(/^\d{6}$/).optional(),
      recoveryCode: z.string().min(8).max(40).optional(),
    }).refine((value) => Boolean(value.code || value.recoveryCode), "Code is required"),
  }),
  mfaDisable: z.object({
    body: z.object({ code: z.string().regex(/^\d{6}$/), currentPassword: z.string().max(128).optional() }),
  }),
};

export const feedbackSchemas = {
  create: z.object({
    body: z.object({
      category: z.enum(["complaint", "bug", "billing", "feature", "content", "other"]).optional(),
      subject: z.string().trim().min(3).max(160),
      message: z.string().trim().min(10).max(3000),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    }),
  }),
  update: z.object({
    params: z.object({ id: objectId }),
    body: z.object({
      status: z.enum(["open", "in-review", "resolved", "closed"]).optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      adminResponse: z.string().trim().max(3000).optional(),
    }),
  }),
};

export const supportSchemas = {
  create: z.object({
    body: z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().toLowerCase().max(254),
      category: z.enum(["product", "account", "privacy", "accessibility", "complaint", "other"]),
      subject: z.string().trim().min(3).max(160),
      message: z.string().trim().min(20).max(3000),
      website: z.string().max(0).optional(),
    }).strict(),
  }),
  update: z.object({
    params: z.object({ id: objectId }),
    body: z.object({ status: z.enum(["accepted", "in-review", "resolved", "closed"]) }).strict(),
  }),
  list: z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z.enum(["all", "accepted", "in-review", "resolved", "closed"]).default("all"),
      category: z.enum(["all", "product", "account", "privacy", "accessibility", "complaint", "other"]).default("all"),
      search: z.string().trim().max(100).default(""),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }),
  }),
};

export const adminSchemas = {
  users: z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      search: z.string().trim().max(100).optional(),
      role: z.enum(["all", "member", "admin"]).default("all"),
      status: z.enum(["all", "active", "suspended"]).default("all"),
      sortBy: z.enum(["createdAt", "name", "email", "role", "status"]).default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    }),
  }),
  userUpdate: z.object({
    params: z.object({ id: objectId }),
    body: z.object({
      name: z.string().trim().min(2).max(80).optional(),
      phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/).optional(),
      role: z.enum(["member", "admin"]).optional(),
      status: z.enum(["active", "suspended"]).optional(),
      targetEmail: z.string().trim().email().toLowerCase(),
      reason: z.string().trim().min(10).max(500),
    }).strict(),
  }),
  userDeactivate: z.object({
    params: z.object({ id: objectId }),
    body: z.object({
      targetEmail: z.string().trim().email().toLowerCase(),
      reason: z.string().trim().min(10).max(500),
    }).strict(),
  }),
  blogId: z.object({ params: z.object({ id: objectId }) }),
  blogCreate: z.object({ body: z.object(blogFields).strict() }),
  blogUpdate: z.object({
    params: z.object({ id: objectId }),
    body: z.object(Object.fromEntries(Object.entries(blogFields).map(([key, schema]) => [key, schema.optional()]))).strict()
      .refine((value) => Object.keys(value).length > 0, "Provide at least one content update"),
  }),
};
