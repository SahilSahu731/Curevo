import { api, readJson } from '@/lib/api';
import { submitReport } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
import { reportSchema } from '@/lib/schemas';
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'report');
  return submitReport(reportSchema.parse(await readJson(request)), actor);
}, 201); }
