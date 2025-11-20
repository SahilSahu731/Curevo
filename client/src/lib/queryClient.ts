"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, 
      gcTime: 1000 * 60 * 10,   // cache for 10 minutes
      refetchOnWindowFocus: true,
      retry: 1,                // retry failed fetch once
    },
  },
});