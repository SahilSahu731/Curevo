"use client";

import React from 'react';
import useRequireAuth from '@/hooks/useRequireAuth';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { PageLoader } from '@/components/common/Loader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { checking } = useRequireAuth({ role: 'admin' });

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <PageLoader text="Verifying admin privileges..." />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background z-10 sticky top-0">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <h1 className="text-lg font-semibold text-foreground">System Administration</h1>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
