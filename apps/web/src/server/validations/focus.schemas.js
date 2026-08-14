import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const days = z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).min(1).max(7);

export const focusSchemas = {
  list: z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(30),
    }),
  }),
  createSession: z.object({
    body: z.object({
      intention: z.string().trim().min(2).max(120),
      durationMinutes: z.coerce.number().int().min(1).max(240),
      status: z.enum(["planned", "active", "completed", "cancelled"]).default("completed"),
      startedAt: z.coerce.date().optional(),
      completedAt: z.coerce.date().optional(),
      distractionCount: z.coerce.number().int().min(0).max(999).default(0),
      closingNote: z.string().trim().max(500).optional(),
    }).strict(),
  }),
  updateSession: z.object({
    params: z.object({ id: objectId }),
    body: z.object({
      intention: z.string().trim().min(2).max(120).optional(),
      durationMinutes: z.coerce.number().int().min(1).max(240).optional(),
      status: z.enum(["planned", "active", "completed", "cancelled"]).optional(),
      completedAt: z.coerce.date().nullable().optional(),
      distractionCount: z.coerce.number().int().min(0).max(999).optional(),
      closingNote: z.string().trim().max(500).optional(),
    }).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one update"),
  }),
  createRoutine: z.object({
    body: z.object({
      title: z.string().trim().min(2).max(80),
      cue: z.string().trim().max(160).optional(),
      durationMinutes: z.coerce.number().int().min(1).max(180).default(25),
      days: days.default(["mon", "tue", "wed", "thu", "fri"]),
      preferredTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("09:00"),
      color: z.enum(["forest", "clay", "amber", "sky", "plum"]).default("forest"),
    }).strict(),
  }),
  updateRoutine: z.object({
    params: z.object({ id: objectId }),
    body: z.object({
      title: z.string().trim().min(2).max(80).optional(),
      cue: z.string().trim().max(160).optional(),
      durationMinutes: z.coerce.number().int().min(1).max(180).optional(),
      days: days.optional(),
      preferredTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      color: z.enum(["forest", "clay", "amber", "sky", "plum"]).optional(),
      active: z.boolean().optional(),
    }).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one update"),
  }),
  id: z.object({ params: z.object({ id: objectId }) }),
  completeRoutine: z.object({
    params: z.object({ id: objectId }),
    body: z.object({
      distractionCount: z.coerce.number().int().min(0).max(999).default(0),
      closingNote: z.string().trim().max(500).optional(),
    }).strict(),
  }),
  createReflection: z.object({
    body: z.object({
      focusLevel: z.coerce.number().int().min(1).max(5),
      energyLevel: z.coerce.number().int().min(1).max(5),
      feeling: z.enum(["clear", "steady", "stretched", "restless", "low"]),
      win: z.string().trim().max(300).optional(),
      friction: z.string().trim().max(300).optional(),
      nextStep: z.string().trim().max(200).optional(),
      note: z.string().trim().max(1000).optional(),
    }).strict(),
  }),
};
