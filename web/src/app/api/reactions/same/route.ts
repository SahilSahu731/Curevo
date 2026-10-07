import { api, readJson } from '@/lib/api';
import { setSame } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
import { reactionSchema } from '@/lib/schemas';
async function mutate(request: Request, active?: boolean) { return api(async () => {
  const actor = await guardRequest(request, 'same');
  const raw = await readJson(request);
  const input = reactionSchema.parse(active === undefined ? raw : { ...(raw as object), active });
  return setSame(input.checkInId, input.active, actor);
}); }
export async function POST(request: Request) { return mutate(request); }
export async function PUT(request: Request) { return mutate(request, true); }
export async function DELETE(request: Request) { return mutate(request, false); }
