"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { clearSessionState, useAuthStore } from "@/store/authStore";
import { QueryStatus } from "@/components/common/QueryStatus";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: "offlineFirst",
      placeholderData: (previousData: unknown) => previousData,
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
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        storageKey="curevo-theme"
        disableTransitionOnChange
      >
        {children}
        <QueryStatus />
        <SonnerToaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
