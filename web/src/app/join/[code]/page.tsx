import type { Metadata } from 'next';
import { JoinPage } from '@/components/secondary-pages';
export const metadata: Metadata = { title: 'An invitation to be human', description: 'Someone made room for you. Join the Curevo beta.', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ code: string }> }) { const { code } = await params; return <JoinPage code={code} />; }
