import { ImageResponse } from 'next/og';
import { getPublicThought } from '@/lib/domain';
import { emotionBySlug } from '@/lib/taxonomy';
import type { Thought } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Curevo — Humanity, right now.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function Image({ params }: { params: Promise<{ thoughtId: string }> }) {
  const { thoughtId } = await params;
  let thought: Thought | null = null;
  try { thought = await getPublicThought(thoughtId); } catch { /* Never expose private or unavailable records. */ }
  const emotion = thought ? emotionBySlug(thought.emotion) : null;
  const quote = thought?.thought ? `“${thought.thought.slice(0, 240)}${thought.thought.length > 240 ? '…' : ''}”` : 'A little of all of us in every feeling.';
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#f5f3ed', color: '#24251f', padding: '64px 76px', fontFamily: 'sans-serif', justifyContent: 'space-between' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', fontSize: 30, color: '#67685f' }}>{emotion ? `Feeling ${emotion.name.toLowerCase()}` : 'Humanity, right now.'}</div><div style={{ display: 'flex', height: 44, width: 44, borderRadius: '50%', background: emotion?.color ?? '#d77c5c' }} /></div><div style={{ display: 'flex', fontSize: quote.length > 170 ? 44 : quote.length > 100 ? 50 : 64, letterSpacing: '-1.8px', lineHeight: 1.2, overflowWrap: 'break-word' }}>{quote}</div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderTop: '1px solid #d7d7cc', paddingTop: 26 }}><div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: '-2px' }}>curevo.</div><div style={{ display: 'flex', fontSize: 24, color: '#67685f' }}>{thought && thought.sameCount > 0 ? `${thought.sameCount.toLocaleString()} people felt this too` : 'Every feeling belongs.'}</div></div></div>, { ...size, headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
