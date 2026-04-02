"use client";

import { useEffect, useCallback } from "react";
import { useDashboardStore } from "@/stores/dashboardStore";

export function useAccounts() {
  const { accounts, isLoading, setAccounts, setLoading } = useDashboardStore();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  }, [setAccounts, setLoading]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, isLoading, refetch: fetchAccounts };
}
