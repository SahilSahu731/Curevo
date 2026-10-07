import { api } from '@/lib/api';
import { getFeed, getPulse, outcomeStatistics } from '@/lib/domain';
import { getActor } from '@/lib/actor';
import { emotionSchema, validateSearchParams } from '@/lib/schemas';
export async function GET(request: Request, context: { params: Promise<{ emotion: string }> }) { return api(async () => {
  const emotion = emotionSchema.parse((await context.params).emotion);
  const params = validateSearchParams(new URL(request.url).searchParams);
  const actor = await getActor();
  const [pulse, feed, outcomes] = await Promise.all([getPulse({ emotion }), getFeed({ ...params, emotion }, actor), outcomeStatistics(emotion, params.cause)]);
  return { pulse, ...feed, outcomes };
}); }
