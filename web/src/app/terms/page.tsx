import type { Metadata } from 'next';
import { PolicyPage } from '@/components/secondary-pages';
export const metadata: Metadata = { title: "Terms of use" };
export default function Page() { return <PolicyPage policy="terms" />; }
