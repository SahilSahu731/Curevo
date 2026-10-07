import { api } from '@/lib/api';
import { getPulse } from '@/lib/domain';
import { validateSearchParams } from '@/lib/schemas';
export async function GET(request: Request) { return api(async () => getPulse(validateSearchParams(new URL(request.url).searchParams))); }
