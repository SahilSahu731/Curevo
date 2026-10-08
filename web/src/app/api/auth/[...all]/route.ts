import { getAuth, googleAuthEnabled } from '@/lib/auth';
import { assertSameOrigin, guardIp, apiErrorResponse } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function handler(request: Request) {
  if (!googleAuthEnabled()) return Response.json({ error: 'Google sign-in is not configured yet. You can continue as a guest.' }, { status: 503 });
  try {
    assertSameOrigin(request);
    await guardIp(request, 'auth');
    return await (await getAuth()).handler(request);
  } catch (error) { return apiErrorResponse(error); }
}
export const GET = handler;
export const POST = handler;
