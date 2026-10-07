import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies } from 'better-auth/next-js';
import { getDb, getMongoClient } from '@/lib/db';
import { configuredOrigin } from '@/lib/security-core';

export function googleAuthEnabled() {
  return !!(process.env.MONGODB_URI && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_URL);
}

async function createAuth() {
  if (!googleAuthEnabled()) throw new Error('Google authentication is not configured.');
  if ((process.env.BETTER_AUTH_SECRET || '').length < 32) throw new Error('BETTER_AUTH_SECRET must contain at least 32 characters.');
  const [db, client] = await Promise.all([getDb(), getMongoClient()]);
  return betterAuth({
    appName: 'Curevo',
    baseURL: configuredOrigin(),
    secret: process.env.BETTER_AUTH_SECRET!,
    database: mongodbAdapter(db, { client, transaction: process.env.MONGODB_TRANSACTIONS !== 'false' }),
    emailAndPassword: { enabled: false },
    socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, prompt: 'select_account' } },
    trustedOrigins: [configuredOrigin()],
    advanced: {
      cookiePrefix: 'curevo',
      useSecureCookies: process.env.NODE_ENV === 'production' || configuredOrigin().startsWith('https:'),
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax', path: '/' },
      // Outer auth handler supplies durable IP limits. Do not store raw IPs.
      ipAddress: { disableIpTracking: true },
    },
    account: { accountLinking: { enabled: false } },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 30 },
    logger: { disabled: true },
    plugins: [nextCookies()],
  });
}

let authPromise: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!authPromise) authPromise = createAuth().catch(error => { authPromise = undefined; throw error; });
  return authPromise;
}
