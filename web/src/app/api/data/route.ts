import { z } from 'zod';
import { api, readJson } from '@/lib/api';
import { deleteData, exportData } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
export async function GET(request: Request) { return api(async () => exportData(await guardRequest(request, 'data'))); }
export async function DELETE(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'data');
  const input = z.object({ scope: z.enum(['history', 'account']) }).strict().parse(await readJson(request));
  return deleteData(actor, input.scope);
}); }
