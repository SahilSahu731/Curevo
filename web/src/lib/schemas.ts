import { z } from 'zod';
import { causes, emotions, intentions, outcomes, reportReasons } from './taxonomy';

const memberOf = (values: readonly string[], label: string) => z.string().refine(value => values.includes(value), `Choose a valid ${label}.`);
export const idSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'This thought link is invalid.');
export const emotionSchema = memberOf(emotions.map(emotion => emotion.slug), 'emotion');
export const checkInSchema = z.object({
  emotion: emotionSchema,
  intensity: z.number().int().min(1).max(5),
  cause: memberOf(causes, 'cause'),
  thought: z.string().trim().min(3, 'Write a few words about what is on your mind.').max(350, 'Keep your thought within 350 characters.'),
  intention: memberOf(intentions, 'intention'),
  visibility: z.enum(['public', 'private']),
  participateInAggregates: z.boolean(),
  ageConfirmed: z.literal(true, { error: 'Curevo is for adults aged 18 and over.' }),
  eventSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).optional(),
  nowEventId: z.string().regex(/^now-\d{4}-\d{2}-\d{2}$/).optional(),
  turnstileToken: z.string().max(2048).optional(),
}).strict();
export const reactionSchema = z.object({ checkInId: idSchema, active: z.boolean() }).strict();
export const reportSchema = z.object({ checkInId: idSchema, reason: memberOf(reportReasons, 'report reason'), description: z.string().trim().max(500).optional() }).strict();
export const outcomeSchema = z.object({
  checkInId: idSchema,
  result: memberOf(outcomes, 'outcome'),
  note: z.string().trim().max(350).optional(),
  visibility: z.enum(['public', 'private']).default('private'),
}).strict();
export const eventSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(80),
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(3).max(500),
  question: z.string().trim().min(3).max(160),
  active: z.boolean().default(true),
  sponsored: z.boolean().default(false),
}).strict();
export const moderationActionSchema = z.object({
  checkInId: idSchema,
  action: z.enum(['approve', 'limit', 'remove', 'ban']),
  reason: z.string().trim().min(3).max(500),
  durationHours: z.number().int().min(1).max(8760).optional(),
}).strict();
export const hideSchema = z.object({ checkInId: idSchema, blockAuthor: z.boolean().default(false), active: z.boolean().default(true) }).strict();
export const migrateSavedSchema = z.object({ ids: z.array(idSchema).max(100) }).strict();

export function validateSearchParams(params: URLSearchParams) {
  const emotion = params.get('emotion') || undefined;
  const cause = params.get('cause') || undefined;
  if (emotion) emotionSchema.parse(emotion);
  if (cause) memberOf(causes, 'cause').parse(cause);
  const q = z.string().trim().max(120).parse(params.get('q') || '');
  const recent = z.enum(['24h', '7d', '30d', 'all']).parse(params.get('recent') || 'all');
  const limit = z.coerce.number().int().min(1).max(40).parse(params.get('limit') || 20);
  const event = params.get('event') || undefined;
  if (event) z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).parse(event);
  return { emotion, cause, q, recent, limit, event, cursor: params.get('cursor') || undefined };
}
