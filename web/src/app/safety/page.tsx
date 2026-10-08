import type { Metadata } from 'next';
import { SafetyPage } from '@/components/secondary-pages';

export const metadata: Metadata = { title: "Find human support", description: "Connect with human support when a shared thought is not enough." };
export default function Page() { return <SafetyPage />; }
