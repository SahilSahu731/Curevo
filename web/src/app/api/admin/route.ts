import { api } from '@/lib/api';
import { getAdmin } from '@/lib/domain';
import { requireAdmin } from '@/lib/actor';
export async function GET() { return api(async () => getAdmin(await requireAdmin())); }
