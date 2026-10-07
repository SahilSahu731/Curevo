import { api, readJson } from '@/lib/api';
import { setHidden } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
import { hideSchema } from '@/lib/schemas';
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'save');
  return setHidden(hideSchema.parse(await readJson(request)), actor);
}); }
