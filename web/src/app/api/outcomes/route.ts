import { api, readJson } from '@/lib/api';
import { createOutcome, outcomeStatistics } from '@/lib/domain';
import { guardRequest } from '@/lib/security';
import { outcomeSchema, validateSearchParams } from '@/lib/schemas';
export async function POST(request: Request) { return api(async () => {
  const actor = await guardRequest(request, 'outcome');
  return createOutcome(outcomeSchema.parse(await readJson(request)), actor);
}, 201); }
export async function GET(request: Request) { return api(async () => {
  const options = validateSearchParams(new URL(request.url).searchParams);
  return outcomeStatistics(options.emotion, options.cause);
}); }
