import type { Metadata } from 'next';
import { MePage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Your Curevo", description: "Your check-ins, feelings, and what happened next.", robots: { index: false, follow: false } };
export default function Page() { return <MePage />; }
