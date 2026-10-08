import { randomBytes } from 'node:crypto';
import { ObjectId, type Document, type Filter } from 'mongodb';
import { getDb } from './db';
import { moderateText, type ModerationDecision } from './moderation';
import { COHORT_MINIMUM } from './taxonomy';
import type { CheckInInput, CheckInResult, CurevoEvent, FeedResult, NowEvent, Pulse, Thought } from './types';
import { publishChange } from './realtime';

export type Actor = { id: string; type: 'guest' | 'user'; admin: boolean; user?: { id?: string; name: string; email: string; image?: string | null } };
type CheckInDoc = { _id: ObjectId; actorId: string; actorType: string; emotion: string; intensity: number; cause: string; thought: string; intention: string; visibility: 'public' | 'private'; participateInAggregates: boolean; moderation: ModerationDecision; createdAt: Date; updatedAt: Date; language: string; sameCount: number; eventSlug?: string; nowEventId?: string };
type FeedOptions = { emotion?: string; cause?: string; q?: string; recent?: string; limit?: number; event?: string; cursor?: string; own?: boolean; saved?: boolean; ids?: string[] };
export class DomainError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const DAY = 86_400_000;
export const PUBLIC_FILTER = { visibility: 'public', 'moderation.status': 'approved' } as const;

export function objectId(id: string) {
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new DomainError('That thought could not be found.', 404);
  return new ObjectId(id);
}
export function encodeCursor(doc: { _id: ObjectId; createdAt: Date }) { return Buffer.from(`${doc.createdAt.toISOString()}|${doc._id.toHexString()}`).toString('base64url'); }
export function decodeCursor(cursor?: string): { createdAt: Date; id: ObjectId } | null {
  if (!cursor) return null;
  if (cursor.length > 150) throw new DomainError('Invalid page cursor.');
  const [date, id, extra] = Buffer.from(cursor, 'base64url').toString().split('|');
  if (!date || !id || extra || !/^[a-f0-9]{24}$/i.test(id) || !Number.isFinite(Date.parse(date))) throw new DomainError('Invalid page cursor.');
  return { createdAt: new Date(date), id: new ObjectId(id) };
}
function cursorFilter(cursor?: string) {
  const parsed = decodeCursor(cursor);
  return parsed ? { $or: [{ createdAt: { $lt: parsed.createdAt } }, { createdAt: parsed.createdAt, _id: { $lt: parsed.id } }] } : {};
}
export function toThought(doc: CheckInDoc, owner = false): Thought {
  const thought: Thought = { id: doc._id.toHexString(), emotion: doc.emotion, intensity: doc.intensity, cause: doc.cause, thought: doc.thought, intention: doc.intention, createdAt: doc.createdAt.toISOString(), sameCount: doc.sameCount || 0 };
  if (doc.eventSlug) thought.eventSlug = doc.eventSlug;
  if (owner) { thought.visibility = doc.visibility; thought.moderation = doc.moderation.status; }
  return thought;
}
async function hydrate(docs: CheckInDoc[], actor?: Actor, owner = false): Promise<Thought[]> {
  if (!docs.length) return [];
  const db = await getDb();
  const ids = docs.map(doc => doc._id.toHexString());
  const [counts, mine, saved, outcomes] = await Promise.all([
    db.collection('reactions').aggregate<{ _id: string; count: number }>([{ $match: { checkInId: { $in: ids } } }, { $group: { _id: '$checkInId', count: { $sum: 1 } } }]).toArray(),
    actor ? db.collection('reactions').find({ actorId: actor.id, checkInId: { $in: ids } }, { projection: { checkInId: 1 } }).toArray() : [],
    actor?.type === 'user' ? db.collection('savedThoughts').find({ userId: actor.id, checkInId: { $in: ids } }, { projection: { checkInId: 1 } }).toArray() : [],
    owner ? db.collection('outcomes').find({ checkInId: { $in: ids } }, { projection: { checkInId: 1, result: 1 } }).toArray() : [],
  ]);
  return docs.map(doc => {
    const thought = toThought(doc, owner);
    thought.sameCount = counts.find(item => item._id === thought.id)?.count || 0;
    if (actor) { thought.hasSame = mine.some(item => item.checkInId === thought.id); thought.saved = saved.some(item => item.checkInId === thought.id); }
    if (owner) { thought.outcome = outcomes.find(item => item.checkInId === thought.id)?.result; thought.outcomeEligible = !thought.outcome && Date.now() - doc.createdAt.getTime() >= DAY; }
    return thought;
  });
}
function exclusions(actor?: Actor): Document[] {
  if (!actor) return [];
  return [
    { $lookup: { from: 'hiddenThoughts', let: { checkInId: { $toString: '$_id' } }, pipeline: [{ $match: { actorId: actor.id, $expr: { $eq: ['$checkInId', '$$checkInId'] } } }, { $limit: 1 }], as: '_hidden' } },
    { $lookup: { from: 'blockedActors', let: { author: '$actorId' }, pipeline: [{ $match: { ownerActorId: actor.id, $expr: { $eq: ['$blockedActorId', '$$author'] } } }, { $limit: 1 }], as: '_blocked' } },
    { $match: { '_hidden.0': { $exists: false }, '_blocked.0': { $exists: false } } },
    { $unset: ['_hidden', '_blocked'] },
  ];
}
export async function getFeed(options: FeedOptions = {}, actor?: Actor): Promise<FeedResult> {
  const db = await getDb();
  const limit = Math.min(40, Math.max(1, options.limit || 20));
  const filter: Document = options.own && actor ? { actorId: actor.id } : { ...PUBLIC_FILTER };
  if (options.emotion) filter.emotion = options.emotion;
  if (options.cause) filter.cause = options.cause;
  if (options.event) filter.eventSlug = options.event;
  if (options.ids) filter._id = { $in: options.ids.slice(0, 100).map(objectId) };
  if (options.q) filter.$text = { $search: options.q };
  const windows: Record<string, number> = { '24h': DAY, '7d': DAY * 7, '30d': DAY * 30 };
  if (options.recent && windows[options.recent]) filter.createdAt = { $gte: new Date(Date.now() - windows[options.recent]) };
  const pipeline: Document[] = [{ $match: filter }, { $match: cursorFilter(options.cursor) }, { $sort: { createdAt: -1, _id: -1 } }];
  if (options.saved) {
    if (!actor || actor.type !== 'user') throw new DomainError('Sign in to sync your saved thoughts.', 401);
    pipeline.push({ $lookup: { from: 'savedThoughts', let: { checkInId: { $toString: '$_id' } }, pipeline: [{ $match: { userId: actor.id, $expr: { $eq: ['$checkInId', '$$checkInId'] } } }], as: '_saved' } }, { $match: { '_saved.0': { $exists: true } } }, { $unset: '_saved' });
  }
  if (!options.own) pipeline.push(...exclusions(actor));
  pipeline.push({ $limit: limit + 1 });
  const docs = await db.collection<CheckInDoc>('checkins').aggregate<CheckInDoc>(pipeline).toArray();
  const page = docs.slice(0, limit);
  return { thoughts: await hydrate(page, actor, !!options.own), nextCursor: docs.length > limit ? encodeCursor(page[page.length - 1]) : null };
}

export function emptyPulse(window = '24h'): Pulse { return { total: 0, participants: 0, window, emotions: [], causes: [], intentions: [], cohortMinimum: COHORT_MINIMUM, sufficientData: false, updatedAt: new Date().toISOString() }; }
type Bucket = { _id: string; count: number; participants: number };
function distributionPipeline(field: string): Document[] {
  return [{ $group: { _id: { label: `$${field}`, actor: '$actorId' }, count: { $sum: 1 } } }, { $group: { _id: '$_id.label', count: { $sum: '$count' }, participants: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }];
}
export function protectedDistribution(buckets: Bucket[], total: number) {
  return buckets.filter(item => item.participants >= COHORT_MINIMUM).map(item => ({ label: item._id, count: item.count, percentage: total ? Math.round(item.count / total * 1000) / 10 : 0 }));
}
export async function getPulse(options: { emotion?: string; event?: string; nowEventId?: string; startsAt?: Date; endsAt?: Date } = {}): Promise<Pulse> {
  const db = await getDb();
  const filter: Document = { 'moderation.status': 'approved', participateInAggregates: true, createdAt: { $gte: options.startsAt || new Date(Date.now() - DAY), $lte: options.endsAt || new Date() } };
  if (options.emotion) filter.emotion = options.emotion;
  if (options.event) filter.eventSlug = options.event;
  if (options.nowEventId) filter.nowEventId = options.nowEventId;
  // Indexed, bounded-window aggregation. No raw thoughts are loaded in the application,
  // and deletion, opt-out, or moderation changes cannot leave stale public counters.
  const [result] = await db.collection('checkins').aggregate<{ total: { count: number; participants: number }[]; emotions: Bucket[]; causes: Bucket[]; intentions: Bucket[] }>([
    { $match: filter },
    {
      $facet: {
        total: [{ $group: { _id: '$actorId', count: { $sum: 1 } } }, { $group: { _id: null, count: { $sum: '$count' }, participants: { $sum: 1 } } }],
        emotions: distributionPipeline('emotion'), causes: distributionPipeline('cause'), intentions: distributionPipeline('intention'),
      }
    },
  ], { maxTimeMS: 8000 }).toArray();
  const total = result?.total[0]?.count || 0;
  const participants = result?.total[0]?.participants || 0;
  const sufficientData = participants >= COHORT_MINIMUM;
  return { total, participants, window: options.nowEventId ? 'session' : '24h', emotions: sufficientData ? protectedDistribution(result.emotions, total).map(item => ({ emotion: item.label, count: item.count, percentage: item.percentage })) : [], causes: sufficientData ? protectedDistribution(result.causes, total) : [], intentions: sufficientData ? protectedDistribution(result.intentions, total) : [], cohortMinimum: COHORT_MINIMUM, sufficientData, updatedAt: new Date().toISOString() };
}
export function mirrorScore(candidate: Pick<CheckInDoc, 'emotion' | 'cause' | 'intention' | 'createdAt' | 'language'>, source: Pick<CheckInDoc, 'emotion' | 'cause' | 'intention' | 'language'>, now = Date.now()) {
  return (candidate.emotion === source.emotion ? 5 : 0) + (candidate.cause === source.cause ? 4 : 0) + (candidate.intention === source.intention ? 2 : 0) + (now - candidate.createdAt.getTime() < DAY ? 3 : 0) + (candidate.language === source.language ? 2 : 0);
}
export async function getMirror(source: CheckInDoc, actor: Actor): Promise<Thought[]> {
  const db = await getDb();
  const docs = await db.collection<CheckInDoc>('checkins').aggregate<CheckInDoc>([
    { $match: { ...PUBLIC_FILTER, actorId: { $ne: actor.id }, createdAt: { $gte: new Date(Date.now() - DAY * 7) }, $or: [{ emotion: source.emotion }, { cause: source.cause }] } },
    { $sort: { createdAt: -1 } }, ...exclusions(actor), { $limit: 150 },
  ]).toArray();
  docs.sort((a, b) => mirrorScore(b, source) - mirrorScore(a, source) || b.createdAt.getTime() - a.createdAt.getTime());
  return hydrate(docs.slice(0, 6), actor);
}
async function ensureActorAllowed(actor: Actor) {
  const db = await getDb();
  const ban = await db.collection('actorBans').findOne({ actorId: actor.id, $or: [{ permanent: true }, { expiresAt: { $gt: new Date() } }] });
  if (ban) throw new DomainError('Posting is unavailable for this account. Contact support if you believe this is a mistake.', 403);
  if (process.env.INVITE_ONLY === 'true' && !actor.admin && !await db.collection('betaAccess').findOne({ actorId: actor.id })) throw new DomainError('Curevo is in a private beta. Redeem an invitation to participate.', 403);
}
async function notify(type: string, data: Record<string, unknown>) { await publishChange(type, data).catch(() => undefined); }
export async function createCheckIn(input: CheckInInput, actor: Actor): Promise<CheckInResult> {
  await ensureActorAllowed(actor);
  const db = await getDb();
  if (input.eventSlug && !await db.collection('events').findOne({ slug: input.eventSlug, active: true })) throw new DomainError('This event is no longer accepting check-ins.');
  if (input.nowEventId) {
    const event = nowSchedule(new Date());
    if (event.id !== input.nowEventId || event.status !== 'active') throw new DomainError('This Curevo Now window has ended. You can still join the everyday Pulse.');
    await ensureNowEvent(event);
  }
  const moderation = await moderateText(input.thought);
  const now = new Date();
  const doc: CheckInDoc = { _id: new ObjectId(), actorId: actor.id, actorType: actor.type, emotion: input.emotion, intensity: input.intensity, cause: input.cause, thought: input.thought, intention: input.intention, visibility: input.visibility, participateInAggregates: input.participateInAggregates, moderation, createdAt: now, updatedAt: now, language: 'en', sameCount: 0, ...(input.eventSlug ? { eventSlug: input.eventSlug } : {}), ...(input.nowEventId ? { nowEventId: input.nowEventId } : {}) };
  await db.collection<CheckInDoc>('checkins').insertOne(doc);
  if (moderation.status === 'approved') {
    if (input.visibility === 'public') await notify('checkin.created', { thought: toThought(doc) });
    if (input.participateInAggregates) await notify('pulse.updated', { emotion: doc.emotion, ...(doc.eventSlug ? { eventSlug: doc.eventSlug } : {}) });
    if (doc.nowEventId && input.participateInAggregates) await notify('curevo-now.updated', { id: doc.nowEventId });
  }
  const [mirror, pulse] = await Promise.all([getMirror(doc, actor), getPulse({ emotion: input.emotion, event: input.eventSlug })]);
  return { checkin: toThought(doc, true), mirror, pulse, safety: moderation.safety, message: input.visibility === 'private' ? 'Your thought is saved privately.' : moderation.status === 'approved' ? 'Your thought is part of the Pulse.' : moderation.status === 'pending' ? 'Your thought is saved and awaiting moderation before it can enter the public Pulse.' : 'Your thought is saved for you and will not enter public discovery. You can find support on our Safety page.' };
}
export async function getPublicThought(id: string): Promise<Thought | null> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await (await getDb()).collection<CheckInDoc>('checkins').findOne({ _id: new ObjectId(id), ...PUBLIC_FILTER });
  return doc ? (await hydrate([doc]))[0] : null;
}
export async function getThought(id: string, actor: Actor): Promise<Thought> {
  const doc = await (await getDb()).collection<CheckInDoc>('checkins').findOne({ _id: objectId(id), $or: [PUBLIC_FILTER, { actorId: actor.id }] });
  if (!doc) throw new DomainError('This thought is private, removed, or no longer available.', 404);
  return (await hydrate([doc], actor, doc.actorId === actor.id))[0];
}
async function requirePublic(id: string) {
  const doc = await (await getDb()).collection<CheckInDoc>('checkins').findOne({ _id: objectId(id), ...PUBLIC_FILTER });
  if (!doc) throw new DomainError('This thought is no longer available.', 404);
  return doc;
}
export async function setSame(id: string, active: boolean, actor: Actor) {
  await ensureActorAllowed(actor);
  await requirePublic(id);
  const db = await getDb();
  if (active) {
    try { await db.collection('reactions').updateOne({ checkInId: id, actorId: actor.id }, { $setOnInsert: { type: 'same', createdAt: new Date() } }, { upsert: true }); } catch (error) { if ((error as { code?: number }).code !== 11000) throw error; }
  } else await db.collection('reactions').deleteOne({ checkInId: id, actorId: actor.id });
  const sameCount = await db.collection('reactions').countDocuments({ checkInId: id });
  await notify('same.updated', { id, sameCount });
  return { sameCount, hasSame: !!await db.collection('reactions').findOne({ checkInId: id, actorId: actor.id }) };
}
export async function setSaved(id: string, active: boolean, actor: Actor) {
  if (actor.type !== 'user') throw new DomainError('Sign in to sync saves across devices. Guest saves stay in your browser.', 401);
  const db = await getDb();
  if (active) {
    await requirePublic(id);
    try { await db.collection('savedThoughts').updateOne({ checkInId: id, userId: actor.id }, { $setOnInsert: { createdAt: new Date() } }, { upsert: true }); } catch (error) { if ((error as { code?: number }).code !== 11000) throw error; }
  } else await db.collection('savedThoughts').deleteOne({ checkInId: id, userId: actor.id });
  return { saved: active };
}
export async function migrateSaved(ids: string[], actor: Actor) {
  if (actor.type !== 'user') throw new DomainError('Sign in to sync your saved thoughts.', 401);
  const db = await getDb();
  const docs = await db.collection('checkins').find({ _id: { $in: [...new Set(ids)].map(objectId) }, ...PUBLIC_FILTER }, { projection: { _id: 1 } }).limit(100).toArray();
  await Promise.all(docs.map(doc => setSaved(doc._id.toHexString(), true, actor)));
  return { migrated: docs.length };
}
export async function submitReport(input: { checkInId: string; reason: string; description?: string }, actor: Actor) {
  await ensureActorAllowed(actor);
  await requirePublic(input.checkInId);
  const db = await getDb();
  try { await db.collection('reports').updateOne({ checkInId: input.checkInId, reporterActorId: actor.id }, { $setOnInsert: { ...input, status: 'open', createdAt: new Date() } }, { upsert: true }); } catch (error) { if ((error as { code?: number }).code !== 11000) throw error; }
  // Reports create a review queue; reporters cannot directly censor a thought.
  return { reported: true };
}
export async function setHidden(input: { checkInId: string; blockAuthor: boolean; active: boolean }, actor: Actor) {
  const db = await getDb();
  const doc = await requirePublic(input.checkInId);
  if (input.active) {
    await db.collection('hiddenThoughts').updateOne({ actorId: actor.id, checkInId: input.checkInId }, { $setOnInsert: { createdAt: new Date() } }, { upsert: true });
    if (input.blockAuthor) await db.collection('blockedActors').updateOne({ ownerActorId: actor.id, blockedActorId: doc.actorId }, { $setOnInsert: { createdAt: new Date() } }, { upsert: true });
  } else {
    await db.collection('hiddenThoughts').deleteOne({ actorId: actor.id, checkInId: input.checkInId });
    if (input.blockAuthor) await db.collection('blockedActors').deleteOne({ ownerActorId: actor.id, blockedActorId: doc.actorId });
  }
  return { hidden: input.active };
}
export async function createOutcome(input: { checkInId: string; result: string; note?: string; visibility: 'public' | 'private' }, actor: Actor) {
  await ensureActorAllowed(actor);
  const db = await getDb();
  const thought = await db.collection<CheckInDoc>('checkins').findOne({ _id: objectId(input.checkInId), actorId: actor.id });
  if (!thought) throw new DomainError('You can only follow up on your own thoughts.', 404);
  if (Date.now() - thought.createdAt.getTime() < DAY) throw new DomainError('Come back at least 24 hours after this check-in to share what happened.', 409);
  const moderation = input.note ? await moderateText(input.note) : { status: 'approved', reasons: [], safety: false, source: 'structured' };
  const visibility = thought.visibility === 'private' ? 'private' : input.visibility;
  try { await db.collection('outcomes').insertOne({ ...input, visibility, actorId: actor.id, emotion: thought.emotion, cause: thought.cause, intention: thought.intention, participateInAggregates: thought.participateInAggregates, moderation, createdAt: new Date() }); }
  catch (error) { if ((error as { code?: number }).code === 11000) throw new DomainError('You have already added an outcome to this thought.', 409); throw error; }
  if (visibility === 'public' && moderation.status === 'approved') await notify('outcome.created', { checkInId: input.checkInId });
  return { recorded: true, safety: moderation.safety, visibility, moderation: moderation.status };
}
export async function outcomeStatistics(emotion?: string, cause?: string) {
  const db = await getDb();
  const match = { visibility: 'public', participateInAggregates: true, 'moderation.status': 'approved', createdAt: { $gte: new Date(Date.now() - DAY * 30) }, ...(emotion ? { emotion } : {}), ...(cause ? { cause } : {}) };
  const [result] = await db.collection('outcomes').aggregate<{ participants: { count: number }[]; buckets: Bucket[] }>([
    { $match: match },
    { $lookup: { from: 'checkins', let: { id: { $convert: { input: '$checkInId', to: 'objectId', onError: null } } }, pipeline: [{ $match: { ...PUBLIC_FILTER, participateInAggregates: true, $expr: { $eq: ['$_id', '$$id'] } } }], as: '_thought' } },
    { $match: { '_thought.0': { $exists: true } } },
    { $facet: { participants: [{ $group: { _id: '$actorId' } }, { $count: 'count' }], buckets: distributionPipeline('result') } },
  ]).toArray();
  const participants = result?.participants[0]?.count || 0;
  const total = result?.buckets.reduce((sum, bucket) => sum + bucket.count, 0) || 0;
  return { participants, total, cohortMinimum: COHORT_MINIMUM, sufficientData: participants >= COHORT_MINIMUM, results: participants >= COHORT_MINIMUM ? protectedDistribution(result.buckets, total) : [], window: '30d' };
}
export async function getMe(actor: Actor, cursor?: string) {
  const db = await getDb();
  const [feed, stats, outcomes, settings] = await Promise.all([
    getFeed({ own: true, cursor }, actor),
    db.collection('checkins').aggregate<{ _id: string; count: number }>([{ $match: { actorId: actor.id } }, { $group: { _id: '$emotion', count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray(),
    db.collection('outcomes').find({ actorId: actor.id }).sort({ createdAt: -1 }).limit(50).toArray(),
    db.collection('actorSettings').findOne({ actorId: actor.id }),
  ]);
  const total = stats.reduce((sum, item) => sum + item.count, 0);
  return { ...feed, settings: { participateInAggregates: settings?.participateInAggregates ?? false }, stats: { total, emotions: stats.map(item => ({ emotion: item._id, count: item.count, percentage: total ? Math.round(item.count / total * 1000) / 10 : 0 })) }, outcomes: outcomes.map(item => ({ id: item._id.toHexString(), checkInId: item.checkInId, result: item.result, note: item.note, visibility: item.visibility, createdAt: item.createdAt.toISOString() })) };
}
export async function updateSettings(participateInAggregates: boolean, actor: Actor) {
  await (await getDb()).collection('actorSettings').updateOne({ actorId: actor.id }, { $set: { participateInAggregates, updatedAt: new Date() } }, { upsert: true });
  return { settings: { participateInAggregates } };
}
async function deleteReferences(ids: string[]) {
  const db = await getDb();
  await Promise.all(['reactions', 'savedThoughts', 'outcomes', 'reports', 'hiddenThoughts'].map(name => db.collection(name).deleteMany({ checkInId: { $in: ids } })));
}
export async function deleteThought(id: string, actor: Actor) {
  const db = await getDb();
  const result = await db.collection('checkins').deleteOne({ _id: objectId(id), actorId: actor.id });
  if (!result.deletedCount) throw new DomainError('This thought was not found in your history.', 404);
  await deleteReferences([id]);
  await notify('thought.removed', { id });
  await notify('pulse.updated', {});
  return { deleted: true };
}
export async function deleteData(actor: Actor, scope: 'history' | 'account') {
  const db = await getDb();
  let deleted = 0;
  // Work in bounded batches even for long-lived accounts.
  while (true) {
    const docs = await db.collection('checkins').find({ actorId: actor.id }, { projection: { _id: 1 } }).limit(250).toArray();
    if (!docs.length) break;
    const ids = docs.map(doc => doc._id.toHexString());
    const result = await db.collection('checkins').deleteMany({ _id: { $in: docs.map(doc => doc._id) }, actorId: actor.id });
    deleted += result.deletedCount;
    await deleteReferences(ids);
  }
  await Promise.all([
    db.collection('outcomes').deleteMany({ actorId: actor.id }),
    db.collection('reactions').deleteMany({ actorId: actor.id }),
    db.collection('savedThoughts').deleteMany({ userId: actor.id }),
    db.collection('reports').deleteMany({ reporterActorId: actor.id }),
    db.collection('hiddenThoughts').deleteMany({ actorId: actor.id }),
    db.collection('blockedActors').deleteMany({ ownerActorId: actor.id }),
  ]);
  if (scope === 'account' && actor.type === 'user') {
    const authId = actor.id.startsWith('u_') ? actor.id.slice(2) : actor.user?.id;
    if (authId) {
      const ids: (string | ObjectId)[] = [authId];
      if (ObjectId.isValid(authId)) ids.push(new ObjectId(authId));
      // Better Auth's default Mongo collections use singular model names.
      await Promise.all(['session', 'account'].map(name => db.collection(name).deleteMany({ userId: { $in: ids } })));
      await db.collection('user').deleteMany({ $or: [{ id: authId }, { _id: { $in: ids } }] } as Filter<Document>);
    }
    await db.collection('betaAccess').deleteMany({ actorId: actor.id });
    await db.collection('actorSettings').deleteMany({ actorId: actor.id });
  }
  await notify('pulse.updated', {});
  return { deleted: true, thoughtsDeleted: deleted, scope };
}
export async function exportData(actor: Actor): Promise<Response> {
  const db = await getDb();
  const collections = [['thoughts', 'checkins', { actorId: actor.id }], ['outcomes', 'outcomes', { actorId: actor.id }], ['reactions', 'reactions', { actorId: actor.id }], ['saved', 'savedThoughts', { userId: actor.id }], ['reports', 'reports', { reporterActorId: actor.id }]] as const;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(`{"exportedAt":${JSON.stringify(new Date().toISOString())},"format":"curevo-v1"`));
        for (const [label, collection, filter] of collections) {
          controller.enqueue(encoder.encode(`,${JSON.stringify(label)}:[`));
          let first = true;
          for await (const doc of db.collection(collection).find(filter).batchSize(100)) {
            const safe = { ...doc }; delete safe.actorId; delete safe.reporterActorId; delete safe.userId; delete safe.actorType;
            controller.enqueue(encoder.encode(`${first ? '' : ','}${JSON.stringify(safe)}`)); first = false;
          }
          controller.enqueue(encoder.encode(']'));
        }
        controller.enqueue(encoder.encode('}')); controller.close();
      } catch (error) { controller.error(error); }
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="curevo-data.json"', 'Cache-Control': 'no-store' } });
}

export function nowSchedule(date: Date): Pick<NowEvent, 'id' | 'startsAt' | 'endsAt' | 'status'> {
  // 20:30 Asia/Kolkata = 15:00 UTC, with no daylight-saving changes.
  const indiaDate = new Date(date.getTime() + 330 * 60_000).toISOString().slice(0, 10);
  let start = new Date(`${indiaDate}T15:00:00.000Z`);
  let end = new Date(start.getTime() + 30 * 60_000);
  if (date >= end) { start = new Date(start.getTime() + DAY); end = new Date(end.getTime() + DAY); }
  return { id: `now-${start.toISOString().slice(0, 10)}`, startsAt: start.toISOString(), endsAt: end.toISOString(), status: date < start ? 'upcoming' : 'active' };
}
async function ensureNowEvent(event: Pick<NowEvent, 'id' | 'startsAt' | 'endsAt'>) {
  const db = await getDb();
  try { await db.collection('curevoNowEvents').updateOne({ id: event.id }, { $setOnInsert: { id: event.id, startsAt: new Date(event.startsAt), endsAt: new Date(event.endsAt), createdAt: new Date() } }, { upsert: true }); }
  catch (error) { if ((error as { code?: number }).code !== 11000) throw error; }
}
async function hydrateNow(event: { id: string; startsAt: Date; endsAt: Date }): Promise<NowEvent> {
  const pulse = await getPulse({ nowEventId: event.id, startsAt: event.startsAt, endsAt: event.endsAt });
  return { id: event.id, startsAt: event.startsAt.toISOString(), endsAt: event.endsAt.toISOString(), status: new Date() < event.startsAt ? 'upcoming' : new Date() >= event.endsAt ? 'completed' : 'active', participantCount: pulse.participants, pulse };
}
export async function getNow() {
  const current = nowSchedule(new Date());
  await ensureNowEvent(current);
  const db = await getDb();
  const events = await db.collection('curevoNowEvents').find({ endsAt: { $lte: new Date() } }).sort({ startsAt: -1 }).limit(7).toArray();
  return { current: await hydrateNow({ id: current.id, startsAt: new Date(current.startsAt), endsAt: new Date(current.endsAt) }), archive: await Promise.all(events.map(event => hydrateNow({ id: event.id, startsAt: event.startsAt, endsAt: event.endsAt }))) };
}
function toEvent(doc: Document): CurevoEvent { return { slug: doc.slug, title: doc.title, description: doc.description, question: doc.question, active: doc.active, sponsored: !!doc.sponsored, createdAt: doc.createdAt.toISOString() }; }
export async function getEvents(includeInactive = false) {
  const docs = await (await getDb()).collection('events').find(includeInactive ? {} : { active: true }).sort({ createdAt: -1 }).limit(50).toArray();
  return docs.map(toEvent);
}
export async function getEvent(slug: string, actor?: Actor) {
  const doc = await (await getDb()).collection('events').findOne({ slug });
  if (!doc) throw new DomainError('This event could not be found.', 404);
  const [pulse, feed] = await Promise.all([getPulse({ event: slug }), getFeed({ event: slug }, actor)]);
  return { event: toEvent(doc), pulse, ...feed };
}
export async function saveEvent(input: Omit<CurevoEvent, 'createdAt'>, actor: Actor) {
  if (!actor.admin) throw new DomainError('Administrator access required.', 403);
  const db = await getDb();
  await db.collection('events').updateOne({ slug: input.slug }, { $set: { ...input, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
  await db.collection('moderationActions').insertOne({ adminActorId: actor.id, action: 'event-upsert', eventSlug: input.slug, createdAt: new Date() });
  return { event: toEvent((await db.collection('events').findOne({ slug: input.slug }))!) };
}
export async function getAdmin(actor: Actor) {
  if (!actor.admin) throw new DomainError('Administrator access required.', 403);
  const db = await getDb();
  const [checkins, publicThoughts, pending, reports, participants, events] = await Promise.all([
    db.collection('checkins').countDocuments(), db.collection('checkins').countDocuments(PUBLIC_FILTER),
    db.collection('checkins').countDocuments({ visibility: 'public', 'moderation.status': { $in: ['pending', 'limited', 'blocked'] }, 'moderation.reviewedAt': { $exists: false } }),
    db.collection('reports').countDocuments({ status: 'open' }),
    db.collection('checkins').aggregate<{ count: number }>([{ $group: { _id: '$actorId' } }, { $count: 'count' }]).toArray(), getEvents(true),
  ]);
  return { stats: { checkins, publicThoughts, pending, reports, participants: participants[0]?.count || 0 }, events, moderationConfigured: !!(process.env.OPENAI_MODERATION_API_KEY || process.env.OPENAI_API_KEY) };
}
export async function moderationQueue(actor: Actor, cursor?: string) {
  if (!actor.admin) throw new DomainError('Administrator access required.', 403);
  const db = await getDb();
  const docs = await db.collection<CheckInDoc>('checkins').aggregate<CheckInDoc & { _reports: { reason: string; description?: string }[] }>([
    { $match: { visibility: 'public', ...cursorFilter(cursor) } }, { $sort: { createdAt: -1, _id: -1 } },
    { $lookup: { from: 'reports', let: { id: { $toString: '$_id' } }, pipeline: [{ $match: { status: 'open', $expr: { $eq: ['$checkInId', '$$id'] } } }, { $project: { reason: 1, description: 1, _id: 0 } }, { $limit: 50 }], as: '_reports' } },
    { $match: { $or: [{ 'moderation.status': { $in: ['pending', 'limited', 'blocked'] }, 'moderation.reviewedAt': { $exists: false } }, { '_reports.0': { $exists: true } }] } }, { $limit: 21 },
  ]).toArray();
  const page = docs.slice(0, 20);
  return { items: page.map(doc => ({ ...toThought(doc, true), reasons: doc.moderation.reasons, reportCount: doc._reports.length, reports: doc._reports })), nextCursor: docs.length > 20 ? encodeCursor(page[page.length - 1]) : null };
}
export async function moderateAction(input: { checkInId: string; action: 'approve' | 'limit' | 'remove' | 'ban'; reason: string; durationHours?: number }, actor: Actor) {
  if (!actor.admin) throw new DomainError('Administrator access required.', 403);
  const db = await getDb();
  const doc = await db.collection<CheckInDoc>('checkins').findOne({ _id: objectId(input.checkInId), visibility: 'public' });
  if (!doc) throw new DomainError('This thought no longer exists.', 404);
  const status = input.action === 'approve' ? 'approved' : input.action === 'limit' ? 'limited' : 'blocked';
  const moderation = { status, reasons: [input.reason], source: 'human', safety: doc.moderation.safety, reviewedAt: new Date() };
  await db.collection('checkins').updateOne({ _id: doc._id }, { $set: { moderation, updatedAt: new Date() } });
  if (input.action === 'ban') {
    await db.collection('actorBans').updateOne({ actorId: doc.actorId }, { $set: { permanent: !input.durationHours, expiresAt: input.durationHours ? new Date(Date.now() + input.durationHours * 3_600_000) : null, reason: input.reason, createdAt: new Date() } }, { upsert: true });
    await db.collection('checkins').updateMany({ actorId: doc.actorId }, { $set: { moderation: { ...moderation, status: 'blocked' }, updatedAt: new Date() } });
  }
  await db.collection('reports').updateMany({ checkInId: input.checkInId }, { $set: { status: 'resolved', resolvedAt: new Date() } });
  await db.collection('moderationActions').insertOne({ adminActorId: actor.id, checkInId: input.checkInId, action: input.action, reason: input.reason, previousStatus: doc.moderation.status, nextStatus: status, createdAt: new Date() });
  await notify('pulse.updated', {});
  if (status === 'approved' && doc.visibility === 'public') await notify('checkin.created', { thought: toThought(doc) });
  else await notify('thought.removed', { id: input.checkInId });
  return { updated: true, status };
}
export async function getInvites(actor: Actor, generate = false) {
  const db = await getDb();
  const access = actor.admin || process.env.INVITE_ONLY !== 'true' || await db.collection('betaAccess').findOne({ actorId: actor.id });
  if (!access) throw new DomainError('Redeem a beta invitation before inviting a friend.', 403);
  if (generate) {
    for (let slot = 1; slot <= 3; slot++) {
      try { await db.collection('invitations').updateOne({ issuerActorId: actor.id, slot }, { $setOnInsert: { token: randomBytes(24).toString('base64url'), redeemedBy: null, createdAt: new Date(), expiresAt: new Date(Date.now() + 30 * DAY) } }, { upsert: true }); }
      catch (error) { if ((error as { code?: number }).code !== 11000) throw error; }
    }
  }
  const invitations = await db.collection('invitations').find({ issuerActorId: actor.id }).sort({ slot: 1 }).limit(3).toArray();
  return { invitations: invitations.map(item => ({ token: item.token, redeemed: !!item.redeemedBy, expiresAt: item.expiresAt.toISOString() })), remaining: 3 - invitations.filter(item => item.redeemedBy).length };
}
export async function redeemInvite(token: string, actor: Actor) {
  const db = await getDb();
  const invite = await db.collection('invitations').findOneAndUpdate({ token, expiresAt: { $gt: new Date() }, $or: [{ redeemedBy: null }, { redeemedBy: actor.id }] }, { $set: { redeemedBy: actor.id, redeemedAt: new Date() } }, { returnDocument: 'after' });
  if (!invite) throw new DomainError('This invitation has expired or has already been used.', 404);
  await db.collection('betaAccess').updateOne({ actorId: actor.id }, { $setOnInsert: { createdAt: new Date(), invitationId: invite._id } }, { upsert: true });
  return { joined: true };
}
