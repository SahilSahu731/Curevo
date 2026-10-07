import { api } from '@/lib/api';
import { getFeed } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
import { validateSearchParams } from '@/lib/schemas';
export async function GET(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'search');
  return getFeed(validateSearchParams(new URL(request.url).searchParams), actor);
}); }
