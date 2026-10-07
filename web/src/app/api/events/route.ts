import { api, readJson } from '@/lib/api';
import { getEvents, saveEvent } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
import { eventSchema } from '@/lib/schemas';
export async function GET() { return api(async () => ({ events: await getEvents() })); }
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'admin');
  return saveEvent(eventSchema.parse(await readJson(request)), actor);
}); }
