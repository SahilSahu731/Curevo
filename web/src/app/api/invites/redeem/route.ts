import { z } from 'zod';
import { api, readJson } from '@/lib/api';
import { redeemInvite } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'invite');
  const input = z.object({ token: z.string().regex(/^[a-zA-Z0-9_-]{20,100}$/) }).strict().parse(await readJson(request));
  return redeemInvite(input.token, actor);
}); }
