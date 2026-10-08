import type { Metadata } from 'next';
import { EventPage } from '@/components/secondary-pages';
import { getEvent } from '@/lib/domain';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ eventSlug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug } = await params;
  try { const { event } = await getEvent(eventSlug); return { title: `${event.title} — Event Pulse`, description: event.description }; }
  catch { return { title: 'A shared moment — Curevo', description: 'One moment. Many ways to feel.' }; }
}
export default async function Page({ params }: Props) { const { eventSlug } = await params; return <EventPage eventSlug={eventSlug} />; }
