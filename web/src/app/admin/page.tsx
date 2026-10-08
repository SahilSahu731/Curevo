import type { Metadata } from 'next';
import { AdminPage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Curevo operations", description: "Community operations.", robots: { index: false, follow: false } };
export default function Page() { return <AdminPage />; }
