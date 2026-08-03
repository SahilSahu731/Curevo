"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { clearSessionState, useAuthStore } from "@/store/authStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().getCurrentUser();
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("curevo-auth");
    channel.onmessage = (event) => {
      if (event.data?.type === "logout") clearSessionState(false);
    };
    return () => channel.close();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <Toaster position="top-right" />
        <SonnerToaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
