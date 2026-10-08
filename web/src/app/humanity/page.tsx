import type { Metadata } from 'next';
import { HumanityPage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Humanity — real thoughts, shared feelings", description: "Explore anonymous human thoughts by emotion, cause, and moment." };
export default function Page() { return <HumanityPage />; }
