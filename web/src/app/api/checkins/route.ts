import { api, readJson } from '@/lib/api';
import { createCheckIn, getFeed } from '@/lib/domain';
import { getActor } from '@/lib/actor';
import { guardRequest, verifyTurnstile } from '@/lib/security';
import { checkInSchema, idSchema, validateSearchParams } from '@/lib/schemas';
export const runtime = 'nodejs';
export async function GET(request: Request) { return api(async () => {
  const params = new URL(request.url).searchParams;
  const options = validateSearchParams(params);
  const ids = params.get('ids')?.split(',').filter(Boolean).slice(0, 100).map(id => idSchema.parse(id));
  return getFeed({ ...options, ids }, await getActor());
}); }
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'checkin');
  const input = checkInSchema.parse(await readJson(request));
  await verifyTurnstile(request, input.turnstileToken);
  return createCheckIn(input, actor);
}, 201); }
