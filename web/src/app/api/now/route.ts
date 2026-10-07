import { api } from '@/lib/api';
import { getNow } from '@/lib/domain';
export async function GET() { return api(getNow); }
