import { api } from '@/lib/api';
import { getInvites } from '@/lib/domain';
import { getActor } from '@/lib/actor';
import { guardRequest } from '@/lib/security';
export async function GET() { return api(async () => getInvites(await getActor())); }
export async function POST(request: Request) { return api(async () => getInvites(await guardRequest(request, 'invite'), true)); }
