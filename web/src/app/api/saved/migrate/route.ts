import { api, readJson } from '@/lib/api';
import { migrateSaved } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
import { migrateSavedSchema } from '@/lib/schemas';
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'save');
  return migrateSaved(migrateSavedSchema.parse(await readJson(request)).ids, actor);
}); }
