import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmotionPage } from '@/components/secondary-pages';
import { emotions } from '@/lib/taxonomy';

type Props = { params: Promise<{ emotion: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { emotion: slug } = await params;
  const emotion = emotions.find(item => item.slug === slug);
  if (!emotion) return { title: 'Feeling not found' };
  return { title: `${emotion.name} — the human feeling`, description: `What real people think and want to do when they feel ${emotion.name.toLowerCase()}. Find a little of yourself in the Pulse.` };
}
export default async function Page({ params }: Props) {
  const { emotion } = await params;
  if (!emotions.some(item => item.slug === emotion)) notFound();
  return <EmotionPage emotion={emotion} />;
}
