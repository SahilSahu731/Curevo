import { MongoClient, type Db } from 'mongodb';

const state = globalThis as typeof globalThis & { curevoMongo?: Promise<MongoClient>; curevoIndexes?: Promise<void> };

export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MongoDB is not configured. Set MONGODB_URI to your MongoDB connection string.');
  if (!state.curevoMongo) {
    const client = new MongoClient(uri, { maxPoolSize: 15, minPoolSize: 0, serverSelectionTimeoutMS: 5000 });
    state.curevoMongo = client.connect().catch(error => { state.curevoMongo = undefined; throw error; });
  }
  return state.curevoMongo;
}

async function createIndexes(db: Db) {
  await Promise.all([
    db.collection('checkins').createIndexes([
      { key: { visibility: 1, 'moderation.status': 1, createdAt: -1, _id: -1 } },
      { key: { emotion: 1, visibility: 1, 'moderation.status': 1, createdAt: -1 } },
      { key: { emotion: 1, cause: 1, createdAt: -1 } },
      { key: { actorId: 1, createdAt: -1, _id: -1 } },
      { key: { participateInAggregates: 1, 'moderation.status': 1, createdAt: -1 } },
      { key: { eventSlug: 1, createdAt: -1 } },
      { key: { nowEventId: 1, createdAt: -1 } },
      { key: { thought: 'text' }, name: 'thought_search', default_language: 'english' },
    ]),
    db.collection('reactions').createIndexes([
      { key: { checkInId: 1, actorId: 1 }, unique: true },
      { key: { actorId: 1, createdAt: -1 } },
    ]),
    db.collection('savedThoughts').createIndexes([
      { key: { userId: 1, checkInId: 1 }, unique: true },
      { key: { userId: 1, createdAt: -1 } },
    ]),
    db.collection('outcomes').createIndexes([
      { key: { checkInId: 1 }, unique: true },
      { key: { actorId: 1, createdAt: -1 } },
      { key: { visibility: 1, emotion: 1, cause: 1, createdAt: -1 } },
    ]),
    db.collection('reports').createIndexes([
      { key: { checkInId: 1, reporterActorId: 1 }, unique: true },
      { key: { status: 1, createdAt: -1 } },
    ]),
    db.collection('hiddenThoughts').createIndex({ actorId: 1, checkInId: 1 }, { unique: true }),
    db.collection('blockedActors').createIndex({ ownerActorId: 1, blockedActorId: 1 }, { unique: true }),
    db.collection('actorBans').createIndex({ actorId: 1 }, { unique: true }),
    db.collection('events').createIndex({ slug: 1 }, { unique: true }),
    db.collection('curevoNowEvents').createIndex({ startsAt: -1 }, { unique: true }),
    db.collection('curevoNowEvents').createIndex({ id: 1 }, { unique: true }),
    db.collection('moderationActions').createIndex({ createdAt: -1 }),
    db.collection('invitations').createIndex({ token: 1 }, { unique: true }),
    db.collection('invitations').createIndex({ issuerActorId: 1, slot: 1 }, { unique: true }),
    db.collection('betaAccess').createIndex({ actorId: 1 }, { unique: true }),
    db.collection('actorSettings').createIndex({ actorId: 1 }, { unique: true }),
  ]);
}

export async function getDb(): Promise<Db> {
  const db = (await getMongoClient()).db(process.env.MONGODB_DB || 'curevo');
  if (!state.curevoIndexes) state.curevoIndexes = createIndexes(db).catch(error => { state.curevoIndexes = undefined; throw error; });
  await state.curevoIndexes;
  return db;
}
