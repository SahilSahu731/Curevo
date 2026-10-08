import type { Metadata } from 'next';
import { NowPage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Curevo Now", description: "Different lives. The same moment. Join the daily Curevo Now at 8:30 PM India time." };
export default function Page() { return <NowPage />; }
