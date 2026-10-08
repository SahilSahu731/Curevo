import { Rest } from 'ably';

export const PUBLIC_CHANNEL = 'curevo:public';
export function realtimeEnabled() { return !!process.env.ABLY_API_KEY; }
export function getAbly() {
  if (!process.env.ABLY_API_KEY) throw new Error('Realtime is not configured.');
  return new Rest({ key: process.env.ABLY_API_KEY });
}

// Broadcast only invalidations. Access-checked APIs remain the source of truth
// for moderation, visibility, blocked actors and minimum-cohort statistics.
export async function publishChange(type: string, _data?: unknown) {
  void _data;
  if (!realtimeEnabled()) return;
  const event = ['checkin', 'reaction', 'same', 'outcome', 'moderation', 'event', 'now', 'delete', 'pulse'].includes(type) ? type : 'pulse';
  try {
    await getAbly().channels.get(PUBLIC_CHANNEL).publish('change', { type: event, updatedAt: new Date().toISOString() });
  } catch {
    const { recordOperationalError } = await import('@/lib/monitoring');
    recordOperationalError('realtime_publish');
  }
}
