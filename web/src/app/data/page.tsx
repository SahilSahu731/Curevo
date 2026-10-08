import type { Metadata } from 'next';
import { DataPage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Your data & privacy", description: "Export your data, manage your choices, or delete your history.", robots: { index: false, follow: false } };
export default function Page() { return <DataPage />; }
