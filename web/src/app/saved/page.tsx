import type { Metadata } from 'next';
import { SavedPage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Saved thoughts", description: "A collection of thoughts that stayed with you.", robots: { index: false, follow: false } };
export default function Page() { return <SavedPage />; }
