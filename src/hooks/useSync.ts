"use client";

import { useState, useCallback } from "react";
import { useDashboardStore } from "@/stores/dashboardStore";

export function useSync() {
  const { setSyncing } = useDashboardStore();
  const [error, setError] = useState<string | null>(null);

  const syncAccount = useCallback(
    async (accountId: string) => {
      setSyncing(true);
      setError(null);
      try {
        const res = await fetch(`/api/sync/${accountId}`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Sync failed");
          return false;
        }
        return true;
      } catch {
        setError("Network error during sync");
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [setSyncing]
  );

  const syncAll = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/sync/all", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Sync failed");
        return false;
      }
      return true;
    } catch {
      setError("Network error during sync");
      return false;
    } finally {
      setSyncing(false);
    }
  }, [setSyncing]);

  return { syncAccount, syncAll, error };
}
