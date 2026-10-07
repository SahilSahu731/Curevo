import { z } from 'zod';
import { api, readJson } from '@/lib/api';
import { getMe, updateSettings } from '@/lib/domain';
import { getActor } from '@/lib/actor';
import { guardRequest } from '@/lib/security';
export async function GET(request: Request) { return api(async () => getMe(await getActor(), new URL(request.url).searchParams.get('cursor') || undefined)); }
export async function PATCH(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'data');
  const input = z.object({ participateInAggregates: z.boolean() }).strict().parse(await readJson(request));
  return updateSettings(input.participateInAggregates, actor);
}); }
