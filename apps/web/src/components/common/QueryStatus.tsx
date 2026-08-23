"use client";

import { useCallback, useSyncExternalStore } from "react";
import { notifyManager, onlineManager, useIsFetching, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

function subscribeToOnlineStatus(callback: () => void) {
  return onlineManager.subscribe(callback);
}

function getOnlineStatus() {
  return onlineManager.isOnline();
}

export function QueryStatus() {
  const queryClient = useQueryClient();
  const queryCache = queryClient.getQueryCache();
  const isFetching = useIsFetching();
  const online = useSyncExternalStore(subscribeToOnlineStatus, getOnlineStatus, () => true);
  const subscribeToQueryCache = useCallback(
    (callback: () => void) => queryCache.subscribe(notifyManager.batchCalls(callback)),
    [queryCache],
  );
  const getQueryCacheSnapshot = useCallback(
    () =>
      queryCache
        .getAll()
        .map(
          (query) =>
            `${query.queryHash}:${query.state.status}:${query.state.dataUpdatedAt}:${query.state.errorUpdatedAt}`,
        )
        .join("|"),
    [queryCache],
  );
  const cacheVersion = useSyncExternalStore(
    subscribeToQueryCache,
    getQueryCacheSnapshot,
    () => "",
  );

  const queries = queryCache.getAll();
  const failed = queries.filter((query) => query.state.status === "error");
  const failedWithSavedData = failed.some((query) => query.state.data !== undefined);
  const hasSavedData = queries.some((query) => query.state.data !== undefined);
  void cacheVersion;

  return (
    <>
      {isFetching > 0 && hasSavedData && (
        <div className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-emerald-100 dark:bg-emerald-950" role="status" aria-label="Refreshing information">
          <div className="h-full w-1/3 animate-pulse bg-emerald-600" />
        </div>
      )}

      {(!online || failed.length > 0) && (
        <aside
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-2xl flex-col gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-950 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 sm:flex-row sm:items-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {!online ? <WifiOff className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
            <p className="min-w-0 text-sm leading-5">
              {!online
                ? hasSavedData
                  ? "You are offline. Showing saved information where available."
                  : "You are offline. Information will load when the connection returns."
                : failedWithSavedData
                  ? "Some information could not be refreshed. Saved information remains visible."
                  : "Some information could not be loaded."}
            </p>
          </div>
          {online && failed.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 border-amber-400 bg-transparent"
              onClick={() => queryClient.refetchQueries({ predicate: (query) => query.state.status === "error" })}
            >
              <RefreshCw className="size-4" /> Retry
            </Button>
          )}
        </aside>
      )}
    </>
  );
}
