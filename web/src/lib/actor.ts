import { randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { getAuth, googleAuthEnabled } from '@/lib/auth';
import { getDb, getMongoClient } from '@/lib/db';
import { ApiError, configuredOrigin, guestActorId } from '@/lib/security-core';

export type Actor = { id: string; type: 'guest' | 'user'; admin: boolean; user?: { name: string; email: string; image?: string } };
export function guestCookieName() { return process.env.NODE_ENV === 'production' ? '__Host-curevo-guest' : 'curevo-guest'; }

// Only invoked after validating both the OAuth session and a 256-bit HttpOnly
// guest credential. Atlas/a replica set is required: every ownership change is
// one atomic transaction, and failed migrations preserve all guest data.
export async function migrateGuestToUser(guestId: string, userId: string) {
  if (!/^g_[a-f0-9]{64}$/.test(guestId) || !/^u_.+/.test(userId)) throw new ApiError('Invalid account migration.', 400);
  const [db, client] = await Promise.all([getDb(), getMongoClient()]);
  const claims = db.collection('guestMigrations');
  await claims.createIndex({ guestId: 1 }, { unique: true });
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      const claim = await claims.findOne({ guestId }, { session });
      if (claim) {
        if (claim.userId !== userId) throw new ApiError('This guest history is already connected to another account.', 409);
        return;
      }
      await claims.insertOne({ guestId, userId, completedAt: new Date() }, { session });
      await db.collection('checkins').updateMany({ actorId: guestId }, { $set: { actorId: userId, actorType: 'user' } }, { session });
      await db.collection('outcomes').updateMany({ actorId: guestId }, { $set: { actorId: userId } }, { session });
      await db.collection('invitations').updateMany({ redeemedBy: guestId }, { $set: { redeemedBy: userId } }, { session });
      for await (const invitation of db.collection('invitations').find({ issuerActorId: guestId }, { session })) {
        const collision = await db.collection('invitations').findOne({ issuerActorId: userId, slot: invitation.slot }, { session });
        await db.collection('invitations').updateOne({ _id: invitation._id, issuerActorId: guestId }, { $set: { issuerActorId: userId, slot: collision ? `migrated:${guestId}:${invitation.slot}` : invitation.slot } }, { session });
      }
      for (const name of ['betaAccess', 'actorSettings']) {
        const source = await db.collection(name).findOne({ actorId: guestId }, { session });
        if (!source) continue;
        const destination = await db.collection(name).findOne({ actorId: userId }, { session });
        if (destination) {
          if (name === 'actorSettings' && source.participateInAggregates === false) await db.collection(name).updateOne({ _id: destination._id }, { $set: { participateInAggregates: false } }, { session });
          await db.collection(name).deleteOne({ _id: source._id, actorId: guestId }, { session });
        } else await db.collection(name).updateOne({ _id: source._id, actorId: guestId }, { $set: { actorId: userId } }, { session });
      }

      for (const { collection, field, key } of [
        { collection: 'reactions', field: 'actorId', key: 'checkInId' },
        { collection: 'reports', field: 'reporterActorId', key: 'checkInId' },
        { collection: 'hiddenThoughts', field: 'actorId', key: 'checkInId' },
        { collection: 'blockedActors', field: 'ownerActorId', key: 'blockedActorId' },
      ]) {
        const records = db.collection(collection);
        for await (const record of records.find({ [field]: guestId }, { session })) {
          const duplicate = await records.findOne({ [field]: userId, [key]: record[key] }, { session });
          if (duplicate) {
            // Preserve the user's existing action. This deletes only the
            // authenticated guest's duplicate action within this transaction.
            await records.deleteOne({ _id: record._id, [field]: guestId }, { session });
          } else {
            await records.updateOne({ _id: record._id, [field]: guestId }, { $set: { [field]: userId } }, { session });
          }
        }
      }
      // Preserve other people's blocks when the blocked guest signs in.
      for await (const block of db.collection('blockedActors').find({ blockedActorId: guestId }, { session })) {
        const duplicate = await db.collection('blockedActors').findOne({ ownerActorId: block.ownerActorId, blockedActorId: userId }, { session });
        if (duplicate) await db.collection('blockedActors').deleteOne({ _id: block._id, blockedActorId: guestId }, { session });
        else await db.collection('blockedActors').updateOne({ _id: block._id, blockedActorId: guestId }, { $set: { blockedActorId: userId } }, { session });
      }
      const ban = await db.collection('actorBans').findOne({ actorId: guestId, $or: [{ permanent: true }, { expiresAt: { $gt: new Date() } }] }, { session });
      if (ban) {
        await db.collection('actorBans').updateOne({ actorId: userId }, {
          $setOnInsert: { actorId: userId, createdAt: new Date() },
          ...(ban.permanent ? { $set: { permanent: true, expiresAt: null } } : { $max: { expiresAt: ban.expiresAt } }),
        }, { upsert: true, session });
      }
    });
  } finally { await session.endSession(); }
  // Guest saves remain local until a separate, explicit opt-in sync in the UI.
}

export async function getActor(): Promise<Actor> {
  const jar = await cookies();
  const existing = jar.get(guestCookieName())?.value;
  const guestId = existing ? guestActorId(existing) : null;
  if (googleAuthEnabled()) {
    const session = await (await getAuth()).api.getSession({ headers: await headers() });
    if (session?.user) {
      const id = `u_${session.user.id}`;
      if (guestId) { await migrateGuestToUser(guestId, id); jar.delete(guestCookieName()); }
      const email = session.user.email.toLowerCase();
      const allowlist = (process.env.ADMIN_EMAILS || '').split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
      return { id, type: 'user', admin: !!session.user.emailVerified && allowlist.includes(email), user: { name: session.user.name, email, ...(session.user.image ? { image: session.user.image } : {}) } };
    }
  }
  if (guestId) return { id: guestId, type: 'guest', admin: false };
  const token = randomBytes(32).toString('base64url');
  jar.set(guestCookieName(), token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production' || configuredOrigin().startsWith('https:'),
    sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365,
  });
  return { id: guestActorId(token)!, type: 'guest', admin: false };
}

export async function requireAdmin() {
  const actor = await getActor();
  if (!actor.admin) throw new ApiError('Administrator access is required.', 403);
  return actor;
}
