import { ZodError } from 'zod';
import { DomainError } from './domain';

export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new DomainError('Send this request as JSON.', 415);
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > 16_384) throw new DomainError('This request is too large.', 413);
  const text = await request.text();
  if (text.length > 16_384) throw new DomainError('This request is too large.', 413);
  try { return JSON.parse(text); } catch { throw new DomainError('This request contains invalid JSON.'); }
}
export async function api(work: () => Promise<unknown>, status = 200): Promise<Response> {
  try {
    const result = await work();
    if (result instanceof Response) return result;
    return Response.json(result, { status, headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: error.issues[0]?.message || 'Please check your entry.' }, { status: 400 });
    const known = error as { status?: number; message?: string };
    if (known.status && known.status >= 400 && known.status < 600) return Response.json({ error: known.message || 'This request could not be completed.' }, { status: known.status });
    // Never serialize provider errors, database details, credentials, or thought bodies.
    const unconfigured = error instanceof Error && error.message.startsWith('MongoDB is not configured');
    return Response.json({ error: unconfigured ? 'The database is not connected yet. Set MONGODB_URI to enable Curevo.' : 'Curevo could not reach a required service. Please try again shortly.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
