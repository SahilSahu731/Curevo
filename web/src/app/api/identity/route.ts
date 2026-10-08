import { getActor } from '@/lib/actor';
import { googleAuthEnabled } from '@/lib/auth';
import { realtimeEnabled } from '@/lib/realtime';
import { apiErrorResponse } from '@/lib/security-core';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const actor = await getActor();
    return Response.json({
      authenticated: actor.type === 'user', user: actor.user, admin: actor.admin,
      googleEnabled: googleAuthEnabled(), realtimeEnabled: realtimeEnabled(),
      analyticsEnabled: !!process.env.POSTHOG_KEY,
      turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
      betaRequired: process.env.INVITE_ONLY === 'true',
      configured: !!process.env.MONGODB_URI,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiErrorResponse(error); }
}
