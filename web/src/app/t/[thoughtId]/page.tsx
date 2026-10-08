import type { Metadata } from 'next';
import { ThoughtPage } from '@/components/secondary-pages';
import { getPublicThought } from '@/lib/domain';
import { emotionBySlug } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ thoughtId: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { thoughtId } = await params;
  try {
    // The public helper only returns approved public records, never owner data.
    const thought = await getPublicThought(thoughtId);
    if (thought) return { title: `${emotionBySlug(thought.emotion).name} — a human thought`, description: thought.thought.slice(0, 180), openGraph: { type: 'article', title: 'You’re not the only one. | Curevo', description: thought.thought.slice(0, 180) }, twitter: { card: 'summary_large_image' } };
  } catch { /* Missing or unavailable records receive an identity-free fallback. */ }
  return { title: 'A human thought — Curevo', description: 'A little of all of us in every feeling.', robots: { index: false, follow: false } };
}
export default async function Page({ params }: Props) { const { thoughtId } = await params; return <ThoughtPage thoughtId={thoughtId} />; }
