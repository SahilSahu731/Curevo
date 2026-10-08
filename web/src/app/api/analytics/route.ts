import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { guardRequest, apiErrorResponse } from '@/lib/security';

const schema = z.object({ event: z.enum(['checkin_started', 'emotion_selected', 'cause_selected', 'checkin_completed', 'mirror_viewed', 'same_clicked', 'thought_saved', 'thought_shared', 'share_opened', 'signup_started', 'signup_completed', 'humanity_search', 'outcome_completed', 'curevo_now_joined']), consent: z.literal(true) }).strict();

export async function POST(request: Request) {
  try {
    if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1' || !process.env.POSTHOG_KEY) return new Response(null, { status: 204 });
    const raw = await request.text();
    if (raw.length > 1024) return Response.json({ error: 'Event too large.' }, { status: 413 });
    let json: unknown; try { json = JSON.parse(raw); } catch { return Response.json({ error: 'Invalid analytics event.' }, { status: 400 }); }
    const body = schema.safeParse(json);
    if (!body.success) return Response.json({ error: 'Invalid analytics event.' }, { status: 400 });
    await guardRequest(request, 'analytics');
    const host = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';
    if (!['https://us.i.posthog.com', 'https://eu.i.posthog.com'].includes(host)) return Response.json({ error: 'Analytics configuration unavailable.' }, { status: 503 });
    // Fresh event identity: cannot link actions to an account, device, or each
    // other. Only anonymous action counts are exported to the provider.
    await fetch(`${host}/capture/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(3000),
      body: JSON.stringify({ api_key: process.env.POSTHOG_KEY, event: body.data.event, properties: { distinct_id: randomUUID(), $process_person_profile: false, $geoip_disable: true, $ip: null, $lib: 'curevo' } }),
    });
    return new Response(null, { status: 204 });
  } catch (error) { return apiErrorResponse(error); }
}
