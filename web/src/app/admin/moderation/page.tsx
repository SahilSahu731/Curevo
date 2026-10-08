import type { Metadata } from 'next';
import { ModerationPage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Moderation — Curevo", description: "Community moderation.", robots: { index: false, follow: false } };
export default function Page() { return <ModerationPage />; }
