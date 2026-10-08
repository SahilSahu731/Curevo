import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getActor } from '@/lib/actor';
import { getDb } from '@/lib/db';
import { ApiError, assertSameOrigin, configuredOrigin, privateHash, RATE_RULES, trustedClientIp } from '@/lib/security-core';

export { ApiError, assertSameOrigin, apiErrorResponse } from '@/lib/security-core';

async function mongoRateLimit(key: string, limit: number, seconds: number) {
  const db = await getDb();
  const records = db.collection<{ key: string; count: number; expiresAt: Date }>('rateLimits');
  await records.createIndex({ key: 1 }, { unique: true });
  await records.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const expiresAt = new Date((bucket + 1) * seconds * 1000);
  const bucketKey = `${key}:${bucket}`;
  let record;
  try {
    record = await records.findOneAndUpdate({ key: bucketKey }, { $inc: { count: 1 }, $setOnInsert: { expiresAt } }, { upsert: true, returnDocument: 'after' });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    record = await records.findOneAndUpdate({ key: bucketKey }, { $inc: { count: 1 } }, { returnDocument: 'after' });
  }
  return { success: !!record && record.count <= limit, reset: expiresAt.getTime() };
}

export async function enforceRateLimit(key: string, limit: number, seconds: number) {
  let result: { success: boolean; reset: number } | undefined;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(limit, `${seconds} s`), prefix: 'curevo:ratelimit', analytics: false });
      result = await limiter.limit(key);
    } catch { /* Durable MongoDB fallback; never process memory. */ }
  }
  if (!result) result = await mongoRateLimit(key, limit, seconds);
  if (!result.success) throw new ApiError('A little pause. Please try again in a moment.', 429, Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)));
}

export async function guardIp(request: Request, action: string) {
  const rule = RATE_RULES[action] || RATE_RULES.default;
  await enforceRateLimit(`${action}:network:${privateHash(trustedClientIp(request))}`, rule.limit * 3, rule.seconds);
}

export async function guardRequest(request: Request, action: string) {
  assertSameOrigin(request);
  await guardIp(request, action);
  const actor = await getActor();
  const rule = RATE_RULES[action] || RATE_RULES.default;
  await enforceRateLimit(`${action}:actor:${privateHash(actor.id)}`, rule.limit, rule.seconds);
  // Moderation bans restrict participation, never access to export or deletion.
  if (!['GET', 'HEAD'].includes(request.method) && !['data', 'analytics', 'realtime'].includes(action)) {
    const ban = await (await getDb()).collection('actorBans').findOne({ actorId: actor.id, $or: [{ permanent: true }, { expiresAt: { $gt: new Date() } }] });
    if (ban) throw new ApiError('Posting is currently unavailable for this account. Please read the community guidelines.', 403);
  }
  return actor;
}

export async function verifyTurnstile(request: Request, token: unknown) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    if (process.env.TURNSTILE_REQUIRED === 'true') throw new ApiError('Verification is temporarily unavailable.', 503);
    return;
  }
  if (typeof token !== 'string' || !token || token.length > 2048) throw new ApiError('Please complete the human verification.', 400);
  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token });
  const ip = trustedClientIp(request);
  if (ip !== 'untrusted-network' && !ip.endsWith('/64')) body.set('remoteip', ip);
  let result: { success?: boolean; hostname?: string; action?: string };
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(8000) });
    result = await response.json();
  } catch { throw new ApiError('Verification could not connect. Please try again.', 503); }
  const allowedHosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || new URL(configuredOrigin()).hostname).split(',').map(v => v.trim());
  if (!result.success || !result.hostname || !allowedHosts.includes(result.hostname) || (result.action && result.action !== 'checkin')) {
    throw new ApiError('Verification expired or failed. Please try again.', 400);
  }
}
