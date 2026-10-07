import { api, readJson } from '@/lib/api';
import { moderateAction, moderationQueue } from '@/lib/domain';
import { requireAdmin } from '@/lib/actor';
import { guardRequest } from '@/lib/security';
import { moderationActionSchema } from '@/lib/schemas';
export async function GET(request: Request) { return api(async () => moderationQueue(await requireAdmin(), new URL(request.url).searchParams.get('cursor') || undefined)); }
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'admin');
  return moderateAction(moderationActionSchema.parse(await readJson(request)), actor);
}); }
