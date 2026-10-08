import { getAbly, PUBLIC_CHANNEL, realtimeEnabled } from '@/lib/realtime';
import { guardRequest, apiErrorResponse } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!realtimeEnabled()) return Response.json({ error: 'Live connection is unavailable. The Pulse will refresh periodically.' }, { status: 503 });
  try {
    await guardRequest(request, 'realtime');
    const token = await getAbly().auth.createTokenRequest({ ttl: 60 * 60 * 1000, capability: JSON.stringify({ [PUBLIC_CHANNEL]: ['subscribe'] }) });
    return Response.json(token, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return apiErrorResponse(error); }
}
