import { api } from '@/lib/api';
import { deleteThought, getThought } from '@/lib/domain';
import { getActor } from '@/lib/actor';
import { guardRequest } from '@/lib/security';
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) { return api(async () => ({ thought: await getThought((await context.params).id, await getActor()) })); }
export async function DELETE(request: Request, context: Context) { return api(async () => deleteThought((await context.params).id, await guardRequest(request, 'data'))); }
