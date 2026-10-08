import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

export class ApiError extends Error {
  constructor(message: string, public status = 400, public retryAfter?: number) { super(message); this.name = 'ApiError'; }
}

export function configuredOrigin() {
  const value = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return new URL(value).origin;
}

export function assertSameOrigin(request: Request, expected = configuredOrigin()) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  const origin = request.headers.get('origin');
  // Require an actual Origin on cookie-authenticated writes. Host/X-Forwarded-Host
  // are deliberately not used as trust anchors.
  if (!origin || origin !== expected || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ApiError('This request did not come from Curevo. Refresh and try again.', 403);
  }
}

export function trustedClientIp(request: Request, header = process.env.TRUSTED_IP_HEADER, hops = Number(process.env.TRUSTED_PROXY_HOPS || 1)) {
  // The deployment must overwrite this header and prevent direct origin access.
  // Otherwise all requests deliberately share a bucket instead of trusting a
  // spoofable forwarding header.
  if (!header || !Number.isSafeInteger(hops) || hops < 1 || hops > 10) return 'untrusted-network';
  const chain = (request.headers.get(header) || '').split(',').map(v => v.trim());
  const candidate = chain[chain.length - hops];
  if (!candidate || !isIP(candidate)) return 'untrusted-network';
  if (isIP(candidate) === 6) {
    // Canonicalize IPv6, then use a /64 bucket so rotating interface addresses
    // cannot bypass per-network limits.
    const hostname = new URL(`http://[${candidate}]`).hostname.slice(1, -1);
    const [left, right = ''] = hostname.split('::');
    const start = left ? left.split(':') : [];
    const end = right ? right.split(':') : [];
    const groups = hostname.includes('::') ? [...start, ...Array(8 - start.length - end.length).fill('0'), ...end] : start;
    return `${groups.slice(0, 4).map(v => v.padStart(4, '0')).join(':')}::/64`;
  }
  return candidate;
}

export function privateHash(value: string) {
  const secret = process.env.BETTER_AUTH_SECRET || 'curevo-local-development-only';
  return createHash('sha256').update(`${secret}:${value}`).digest('hex');
}

export function guestActorId(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  return `g_${createHash('sha256').update(token).digest('hex')}`;
}

export const RATE_RULES: Record<string, { limit: number; seconds: number }> = {
  checkin: { limit: 5, seconds: 600 }, checkins: { limit: 5, seconds: 600 },
  same: { limit: 60, seconds: 600 }, reaction: { limit: 60, seconds: 600 }, reactions: { limit: 60, seconds: 600 },
  report: { limit: 10, seconds: 3600 }, reports: { limit: 10, seconds: 3600 },
  search: { limit: 60, seconds: 60 }, analytics: { limit: 60, seconds: 60 },
  auth: { limit: 20, seconds: 60 }, identity: { limit: 90, seconds: 60 },
  realtime: { limit: 20, seconds: 60 }, invite: { limit: 10, seconds: 600 },
  export: { limit: 5, seconds: 600 }, account: { limit: 10, seconds: 600 },
  outcome: { limit: 30, seconds: 600 }, admin: { limit: 120, seconds: 60 },
  data: { limit: 15, seconds: 600 }, save: { limit: 90, seconds: 600 }, read: { limit: 120, seconds: 60 },
  default: { limit: 90, seconds: 60 },
};

export function apiErrorResponse(error: unknown) {
  const candidate = error as { status?: number; message?: string; retryAfter?: number };
  const status = candidate.status && candidate.status >= 400 && candidate.status < 600 ? candidate.status : 503;
  return Response.json({ error: status < 500 ? candidate.message || 'Request could not be completed.' : 'Curevo is temporarily unavailable. Please try again shortly.' }, {
    status, headers: { 'Cache-Control': 'private, no-store', ...(candidate.retryAfter ? { 'Retry-After': String(candidate.retryAfter) } : {}) },
  });
}
