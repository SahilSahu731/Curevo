import { api } from '@/lib/api';
import { getEvent } from '@/lib/domain';
import { getActor } from '@/lib/actor';
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) { return api(async () => getEvent((await context.params).slug, await getActor())); }
