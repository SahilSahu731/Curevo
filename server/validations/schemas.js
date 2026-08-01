import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const authSchemas = {
  register: z.object({
    body: z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().toLowerCase(),
      password: z.string().min(8).max(128),
      role: z.enum(["patient", "doctor"]).optional(),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().trim().email().toLowerCase(),
      password: z.string().min(1),
    }),
  }),
};

export const appointmentSchemas = {
  create: z.object({
    body: z.object({
      patientId: objectId.optional(),
      doctorId: objectId,
      clinicId: objectId.optional(),
      date: z.coerce.date(),
      slotTime: z.string().trim().min(4).max(20),
      symptoms: z.string().trim().max(2000).optional(),
      priority: z.enum(["normal", "emergency"]).optional(),
      consultationType: z.enum(["in-person", "video"]).optional(),
    }),
  }),
};

export const feedbackSchemas = {
  create: z.object({
    body: z.object({
      category: z.enum(["complaint", "bug", "billing", "feature", "clinical", "other"]).optional(),
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

export const verificationSchemas = {
  review: z.object({
    params: z.object({ id: objectId }),
    body: z.object({
      status: z.enum(["approved", "rejected"]),
      notes: z.string().trim().max(1000).optional(),
    }),
  }),
};
