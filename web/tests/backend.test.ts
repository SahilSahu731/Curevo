import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, test } from 'node:test';
import { ObjectId, type Db } from 'mongodb';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { getDb, getMongoClient } from '../src/lib/db';
import { checkInSchema, outcomeSchema, validateSearchParams } from '../src/lib/schemas';
import { localModeration, moderateText } from '../src/lib/moderation';
import { api, readJson } from '../src/lib/api';
import {
  createCheckIn, createOutcome, DAY, decodeCursor, deleteData, deleteThought, encodeCursor,
  exportData, getAdmin, getEvent, getEvents, getFeed, getInvites, getMe, getNow,
  getPublicThought, getPulse, getThought, migrateSaved, mirrorScore, moderateAction,
  moderationQueue, nowSchedule, outcomeStatistics, protectedDistribution, redeemInvite,
  saveEvent, setHidden, setSame, setSaved, submitReport, updateSettings, type Actor,
} from '../src/lib/domain';
import { migrateGuestToUser } from '../src/lib/actor';
import type { CheckInInput } from '../src/lib/types';

const guest: Actor = { id: `g_${'a'.repeat(64)}`, type: 'guest', admin: false };
const other: Actor = { id: `g_${'b'.repeat(64)}`, type: 'guest', admin: false };
const user: Actor = { id: 'u_test-user', type: 'user', admin: false };
const admin: Actor = { id: 'u_test-admin', type: 'user', admin: true };
const input: CheckInInput = { emotion: 'hopeful', intensity: 3, cause: 'Career', thought: 'Tomorrow might be the start of something good.', intention: 'Work on it', visibility: 'public', participateInAggregates: true, ageConfirmed: true };
let db: Db;
let replica: MongoMemoryReplSet;

before(async () => {
  // Always start an isolated local replica set. Never load .env or connect to a supplied URI.
  for (const key of ['MONGODB_URI', 'MONGO_URI', 'OPENAI_API_KEY', 'OPENAI_MODERATION_API_KEY', 'ABLY_API_KEY', 'INVITE_ONLY', 'POSTHOG_API_KEY', 'SENTRY_DSN']) delete process.env[key];
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1, ip: '127.0.0.1', storageEngine: 'wiredTiger' } });
  process.env.MONGODB_URI = replica.getUri();
  process.env.MONGODB_DB = 'curevo_automated_tests';
  assert.match(process.env.MONGODB_URI, /^mongodb:\/\/127\.0\.0\.1:/);
  db = await getDb();
}, { timeout: 120_000 });
beforeEach(async () => {
  delete process.env.INVITE_ONLY;
  await Promise.all((await db.listCollections().toArray()).map(collection => db.collection(collection.name).deleteMany({})));
});
after(async () => { if (db) await (await getMongoClient()).close(); if (replica) await replica.stop(); });

async function seed(overrides: Record<string, unknown> = {}) {
  const doc = { _id: new ObjectId(), ...input, actorId: guest.id, actorType: 'guest', language: 'en', sameCount: 0, moderation: { status: 'approved', reasons: [], safety: false, source: 'test-fixture' }, createdAt: new Date(), updatedAt: new Date(), ...overrides };
  await db.collection('checkins').insertOne(doc);
  return doc;
}

// These tests verify behavior and privacy boundaries against real MongoDB, including unique indexes.
describe('validation, moderation and API error boundaries', () => {
  test('requires explicit adulthood, valid taxonomy, lengths and intensity', () => {
    assert.equal(checkInSchema.parse(input).emotion, 'hopeful');
    for (const patch of [{ intensity: 0 }, { intensity: 6 }, { emotion: 'invented' }, { cause: '$where' }, { thought: 'x'.repeat(351) }, { ageConfirmed: false }, { actorId: 'victim' }]) assert.equal(checkInSchema.safeParse({ ...input, ...patch }).success, false);
    assert.equal(outcomeSchema.safeParse({ checkInId: new ObjectId().toHexString(), result: 'invented' }).success, false);
    assert.throws(() => validateSearchParams(new URLSearchParams('q=' + 'a'.repeat(121))));
    assert.throws(() => validateSearchParams(new URLSearchParams('limit=999')));
  });
  test('flags acute safety and PII without treating common profanity as abuse', () => {
    assert.equal(localModeration('I want to kill myself tonight')?.safety, true);
    assert.equal(localModeration('I will shoot my boss')?.status, 'blocked');
    assert.equal(localModeration('Email me at person@example.com')?.status, 'limited');
    assert.equal(localModeration('Call me on +91 98765 43210')?.status, 'limited');
    assert.equal(localModeration('What a fucking difficult week.'), null);
  });
  test('fails closed without a moderation provider', async () => {
    assert.equal((await moderateText(input.thought)).status, 'pending');
    const result = await createCheckIn(input, guest);
    assert.equal(result.checkin.moderation, 'pending');
    assert.equal((await getFeed()).thoughts.length, 0);
    assert.equal((await getPulse()).total, 0);
    assert.equal((await getMe(guest)).thoughts.length, 1);
  });
  test('API rejects oversized/malformed JSON and does not expose unknown errors', async () => {
    const request = (body: string) => new Request('http://localhost/api/checkins', { method: 'POST', body, headers: { 'Content-Type': 'application/json' } });
    await assert.rejects(readJson(request('{not-json}')), /invalid JSON/);
    await assert.rejects(readJson(request('x'.repeat(16_385))), /too large/);
    const response = await api(async () => { throw new Error('mongodb://secret-password private thought body'); });
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes('secret-password'), false);
  });
});

describe('public disclosure, search and cursor feeds', () => {
  test('public APIs omit identifiers, private thoughts and unapproved content', async () => {
    const visible = await seed();
    const hidden = await seed({ visibility: 'private', thought: 'A private satellite thought' });
    await seed({ moderation: { status: 'pending', reasons: ['review'] } });
    const feed = await getFeed();
    assert.deepEqual(feed.thoughts.map(item => item.id), [visible._id.toHexString()]);
    const serialized = JSON.stringify(feed);
    for (const forbidden of ['actorId', 'actorType', guest.id, 'moderation', 'language', 'participateInAggregates']) assert.equal(serialized.includes(forbidden), false, forbidden);
    assert.equal(await getPublicThought(hidden._id.toHexString()), null);
    await assert.rejects(getThought(hidden._id.toHexString(), other), /private/);
    assert.equal((await getThought(hidden._id.toHexString(), guest)).visibility, 'private');
    assert.equal((await moderationQueue(admin)).items.some(item => item.id === hidden._id.toHexString()), false);
    await assert.rejects(moderateAction({ checkInId: hidden._id.toHexString(), action: 'approve', reason: 'Private content cannot be reviewed' }, admin), /no longer exists/);
  });
  test('same-time cursor pages contain no duplicates or omissions', async () => {
    const createdAt = new Date();
    const seeded = await Promise.all(Array.from({ length: 7 }, (_, i) => seed({ thought: `Thought number ${i}`, createdAt })));
    const first = await getFeed({ limit: 3 });
    const second = await getFeed({ limit: 3, cursor: first.nextCursor! });
    const third = await getFeed({ limit: 3, cursor: second.nextCursor! });
    const ids = [...first.thoughts, ...second.thoughts, ...third.thoughts].map(item => item.id);
    assert.equal(new Set(ids).size, 7);
    assert.deepEqual([...ids].sort(), seeded.map(item => item._id.toHexString()).sort());
    assert.equal(third.nextCursor, null);
    assert.throws(() => decodeCursor('invalid'), /Invalid page cursor/);
    assert.equal(decodeCursor(encodeCursor(seeded[0]))?.id.toHexString(), seeded[0]._id.toHexString());
  });
  test('full text search honors emotion, recency, privacy, hide and block', async () => {
    const visible = await seed({ thought: 'Dreaming about satellites in a quiet sky.', actorId: other.id });
    await seed({ thought: 'An old satellite memory', createdAt: new Date(Date.now() - 3 * DAY) });
    await seed({ thought: 'Private satellite message', visibility: 'private' });
    await seed({ thought: 'Satellite review pending', moderation: { status: 'pending' } });
    assert.deepEqual((await getFeed({ q: 'satellite', emotion: 'hopeful', recent: '24h' }, guest)).thoughts.map(item => item.id), [visible._id.toHexString()]);
    await setHidden({ checkInId: visible._id.toHexString(), blockAuthor: true, active: true }, guest);
    assert.equal((await getFeed({ q: 'satellite', recent: '24h' }, guest)).thoughts.length, 0);
    assert.equal((await getFeed({ q: 'satellite', recent: '24h' }, user)).thoughts.length, 1);
  });
  test('Mirror scores reflect emotion, cause, intention and recent language matches', () => {
    const source = { emotion: 'hopeful', cause: 'Career', intention: 'Work on it', language: 'en' };
    assert.equal(mirrorScore({ ...source, createdAt: new Date() }, source), 16);
    assert.equal(mirrorScore({ emotion: 'sad', cause: 'Love', intention: 'Wait', language: 'fr', createdAt: new Date(Date.now() - 2 * DAY) }, source), 0);
  });
});

describe('Pulse aggregation uses genuine, consented and distinct participants', () => {
  test('empty database is genuinely empty', async () => {
    const pulse = await getPulse();
    assert.equal(pulse.total, 0); assert.equal(pulse.participants, 0); assert.deepEqual(pulse.emotions, []);
  });
  test('repeat check-ins cannot inflate the minimum participant threshold', async () => {
    await Promise.all(Array.from({ length: 35 }, () => seed()));
    const pulse = await getPulse();
    assert.equal(pulse.total, 35); assert.equal(pulse.participants, 1);
    assert.equal(pulse.sufficientData, false); assert.deepEqual(pulse.causes, []);
  });
  test('suppresses small groups, old records, opt-outs and moderation removals', async () => {
    await Promise.all(Array.from({ length: 30 }, (_, i) => seed({ actorId: `participant-${i}` })));
    await seed({ actorId: 'small-cohort', cause: 'Love', emotion: 'jealous' });
    await seed({ actorId: 'no-consent', participateInAggregates: false });
    await seed({ actorId: 'too-old', createdAt: new Date(Date.now() - 2 * DAY) });
    await seed({ actorId: 'moderated', moderation: { status: 'blocked' } });
    const pulse = await getPulse();
    assert.equal(pulse.total, 31); assert.equal(pulse.participants, 31);
    assert.deepEqual(pulse.causes.map(item => item.label), ['Career']);
    assert.equal(pulse.emotions[0].count, 30);
    assert.equal((await getPulse({ emotion: 'jealous' })).sufficientData, false);
    assert.deepEqual(protectedDistribution([{ _id: 'private category', count: 100, participants: 2 }], 100), []);
  });
  test('deletion and moderation change the canonical Pulse immediately', async () => {
    const doc = await seed();
    assert.equal((await getPulse()).total, 1);
    await moderateAction({ checkInId: doc._id.toHexString(), action: 'limit', reason: 'Testing suppression' }, admin);
    assert.equal((await getPulse()).total, 0);
    await moderateAction({ checkInId: doc._id.toHexString(), action: 'approve', reason: 'Reviewed safely' }, admin);
    assert.equal((await getPulse()).total, 1);
    await deleteThought(doc._id.toHexString(), guest);
    assert.equal((await getPulse()).total, 0);
  });
});

describe('reactions, saves, reports and ownership', () => {
  test('Same is idempotent under concurrency and undo is exact', async () => {
    const doc = await seed(); const id = doc._id.toHexString();
    await Promise.all(Array.from({ length: 15 }, () => setSame(id, true, other)));
    assert.equal(await db.collection('reactions').countDocuments({ checkInId: id }), 1);
    assert.equal((await getPublicThought(id))?.sameCount, 1);
    await Promise.all([setSame(id, false, other), setSame(id, false, other)]);
    assert.equal((await getPublicThought(id))?.sameCount, 0);
    const privateDoc = await seed({ visibility: 'private' });
    await assert.rejects(setSame(privateDoc._id.toHexString(), true, other), /no longer available/);
  });
  test('cloud saves require auth and migration excludes private/unapproved ids', async () => {
    const visible = await seed(); const hidden = await seed({ visibility: 'private' });
    await assert.rejects(setSaved(visible._id.toHexString(), true, guest), /Sign in/);
    const result = await migrateSaved([visible._id.toHexString(), visible._id.toHexString(), hidden._id.toHexString()], user);
    assert.equal(result.migrated, 1);
    assert.equal((await getFeed({ saved: true }, user)).thoughts.length, 1);
    await setSaved(visible._id.toHexString(), false, user);
    assert.equal((await getFeed({ saved: true }, user)).thoughts.length, 0);
  });
  test('reports are unique per actor and feed remains available for human review', async () => {
    const doc = await seed(); const report = { checkInId: doc._id.toHexString(), reason: 'spam' };
    await Promise.all([submitReport(report, other), submitReport(report, other)]);
    assert.equal(await db.collection('reports').countDocuments(), 1);
    const queue = await moderationQueue(admin);
    assert.equal(queue.items[0].reportCount, 1);
    await assert.rejects(moderationQueue(guest), /Administrator/);
  });
  test('only the owner can delete and public references are removed', async () => {
    const doc = await seed(); const id = doc._id.toHexString();
    await setSame(id, true, other); await setSaved(id, true, user);
    await assert.rejects(deleteThought(id, other), /not found/);
    await deleteThought(id, guest);
    assert.equal(await db.collection('reactions').countDocuments(), 0);
    assert.equal(await db.collection('savedThoughts').countDocuments(), 0);
    assert.equal(await getPublicThought(id), null);
  });
});

describe('outcomes, privacy controls and export', () => {
  test('outcomes require ownership, 24 hours and one result per check-in', async () => {
    const doc = await seed(); const body = { checkInId: doc._id.toHexString(), result: 'It got better', visibility: 'public' as const };
    await assert.rejects(createOutcome(body, other), /own thoughts/);
    await assert.rejects(createOutcome(body, guest), /24 hours/);
    await db.collection('checkins').updateOne({ _id: doc._id }, { $set: { createdAt: new Date(Date.now() - 2 * DAY) } });
    assert.equal((await getMe(guest)).thoughts[0].outcomeEligible, true);
    await createOutcome(body, guest);
    await assert.rejects(createOutcome(body, guest), /already added/);
    assert.equal((await getMe(guest)).thoughts[0].outcome, 'It got better');
    assert.equal((await outcomeStatistics()).sufficientData, false);
  });
  test('private thought forces a private outcome and cannot contribute outcome stats', async () => {
    const doc = await seed({ visibility: 'private', createdAt: new Date(Date.now() - 2 * DAY) });
    const result = await createOutcome({ checkInId: doc._id.toHexString(), result: 'It got better', visibility: 'public' }, guest);
    assert.equal(result.visibility, 'private'); assert.equal((await outcomeStatistics()).total, 0);
  });
  test('settings are actor-scoped and exports omit internal identities', async () => {
    await seed(); await seed({ actorId: other.id, thought: 'Someone else owns this.' });
    await updateSettings(true, guest);
    assert.equal((await getMe(guest)).settings.participateInAggregates, true);
    assert.equal((await getMe(other)).settings.participateInAggregates, false);
    const exported = await (await exportData(guest)).json();
    assert.equal(exported.thoughts.length, 1);
    assert.equal(JSON.stringify(exported).includes(guest.id), false);
    assert.equal(JSON.stringify(exported).includes('Someone else owns'), false);
  });
  test('bulk history deletion preserves other users and repairs public aggregates', async () => {
    await seed(); const survivor = await seed({ actorId: other.id });
    const result = await deleteData(guest, 'history');
    assert.equal(result.thoughtsDeleted, 1);
    assert.equal((await getMe(guest)).stats.total, 0);
    assert.equal((await getPublicThought(survivor._id.toHexString()))?.id, survivor._id.toHexString());
    assert.equal((await getPulse()).participants, 1);
  });
});

describe('Now, events, moderation and invites', () => {
  test('daily Now correctly handles IST day and the exact 30 minute boundary', () => {
    assert.equal(nowSchedule(new Date('2026-10-07T14:59:59Z')).status, 'upcoming');
    assert.equal(nowSchedule(new Date('2026-10-07T15:00:00Z')).status, 'active');
    assert.equal(nowSchedule(new Date('2026-10-07T15:29:59Z')).id, 'now-2026-10-07');
    assert.equal(nowSchedule(new Date('2026-10-07T15:30:00Z')).id, 'now-2026-10-08');
    assert.equal(nowSchedule(new Date('2026-10-07T20:00:00Z')).startsAt, '2026-10-08T15:00:00.000Z');
  });
  test('Now archive derives genuine unique participation from its own session', async () => {
    const start = new Date(Date.now() - 2 * DAY); const end = new Date(start.getTime() + 30 * 60_000);
    await db.collection('curevoNowEvents').insertOne({ id: 'now-archive-test', startsAt: start, endsAt: end });
    await seed({ nowEventId: 'now-archive-test', createdAt: new Date(start.getTime() + 60_000) });
    await seed({ nowEventId: 'now-archive-test', createdAt: new Date(start.getTime() + 120_000) });
    const result = await getNow();
    assert.equal(result.archive[0].participantCount, 1);
    assert.equal(result.archive[0].pulse.total, 2);
    assert.equal(result.current.participantCount, 0);
  });
  test('only admins manage events; inactive and nonexistent events reject check-ins', async () => {
    const event = { slug: 'a-real-event', title: 'A real event', description: 'An event for real participants.', question: 'How do you feel?', active: true };
    await assert.rejects(saveEvent(event, guest), /Administrator/);
    await saveEvent(event, admin);
    assert.equal((await getEvents())[0].slug, event.slug);
    assert.equal((await getEvent(event.slug)).pulse.total, 0);
    await saveEvent({ ...event, active: false }, admin);
    await assert.rejects(createCheckIn({ ...input, eventSlug: event.slug }, guest), /no longer accepting/);
    await assert.rejects(createCheckIn({ ...input, eventSlug: 'does-not-exist' }, guest), /no longer accepting/);
  });
  test('admin moderation records an audit and a ban removes all author content', async () => {
    const first = await seed(); await seed();
    await assert.rejects(moderateAction({ checkInId: first._id.toHexString(), action: 'ban', reason: 'Abuse' }, guest), /Administrator/);
    await moderateAction({ checkInId: first._id.toHexString(), action: 'ban', reason: 'Repeated abuse' }, admin);
    assert.equal((await getFeed()).thoughts.length, 0);
    assert.equal((await getPulse()).total, 0);
    await assert.rejects(createCheckIn(input, guest), /Posting is unavailable/);
    assert.equal(await db.collection('moderationActions').countDocuments(), 1);
    assert.equal((await getAdmin(admin)).stats.checkins, 2);
    assert.equal((await moderationQueue(admin)).items.length, 0);
  });
  test('three beta passes are stable and one invite cannot be claimed twice', async () => {
    process.env.INVITE_ONLY = 'true';
    const generated = await getInvites(admin, true);
    assert.equal(generated.invitations.length, 3);
    assert.deepEqual(await getInvites(admin, true), generated);
    await Promise.all(Array.from({ length: 8 }, () => getInvites(admin, true)));
    assert.equal(await db.collection('invitations').countDocuments(), 3);
    await assert.rejects(createCheckIn(input, guest), /private beta/);
    await redeemInvite(generated.invitations[0].token, guest);
    await redeemInvite(generated.invitations[0].token, guest);
    await assert.rejects(redeemInvite(generated.invitations[0].token, other), /already been used/);
    assert.equal((await createCheckIn(input, guest)).checkin.moderation, 'pending');
  });
});

describe('guest to account migration', () => {
  test('verified migration merges ownership and deduplicates actions atomically', async () => {
    const doc = await seed(); const id = doc._id.toHexString();
    await setSame(id, true, guest); await setSame(id, true, user);
    await updateSettings(true, guest);
    await migrateGuestToUser(guest.id, user.id);
    assert.equal((await getMe(user)).stats.total, 1);
    assert.equal((await getMe(guest)).stats.total, 0);
    assert.equal((await getPublicThought(id))?.sameCount, 1);
    await migrateGuestToUser(guest.id, user.id);
    await assert.rejects(migrateGuestToUser(guest.id, 'u_another-user'), /already connected/);
  });
});
