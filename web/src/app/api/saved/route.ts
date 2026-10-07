import { api, readJson } from '@/lib/api';
import { getFeed, setSaved } from '@/lib/domain';
import { getActor } from '@/lib/actor';
import { guardRequest } from '@/lib/security';
import { reactionSchema } from '@/lib/schemas';
export async function GET(request: Request) { return api(async () => getFeed({ saved: true, cursor: new URL(request.url).searchParams.get('cursor') || undefined }, await getActor())); }
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'save');
  const input = reactionSchema.parse(await readJson(request));
  return setSaved(input.checkInId, input.active, actor);
}); }
