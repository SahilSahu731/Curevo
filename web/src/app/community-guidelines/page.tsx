import type { Metadata } from 'next';
import { PolicyPage } from '@/components/secondary-pages';
export const metadata: Metadata = { title: "Community guidelines" };
export default function Page() { return <PolicyPage policy="community-guidelines" />; }
