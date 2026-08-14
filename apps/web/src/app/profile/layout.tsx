"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppearanceControl } from "@/components/common/AppearanceControl";
import { PageLoader } from "@/components/common/Loader";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { checking } = useRequireAuth();
  if (checking) return <div className="grid min-h-screen place-items-center"><PageLoader text="Opening account settings..." /></div>;
  return <SidebarProvider><AppSidebar /><SidebarInset><header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl"><SidebarTrigger className="-ml-1" /><Separator orientation="vertical" className="h-5" /><h1 className="flex-1 text-sm font-semibold">Profile and account</h1><AppearanceControl /></header><main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main></SidebarInset></SidebarProvider>;
}
