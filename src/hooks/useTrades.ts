"use client";

import { useState, useEffect, useCallback } from "react";

interface Trade {
  id: string;
  instrument: string;
  side: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  realizedPnl: number | null;
  commission: number | null;
  entryTime: string;
  exitTime: string | null;
  duration: number | null;
}

interface UseTradesOptions {
  accountId: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useTrades({ accountId, from, to, page = 1, limit = 50 }: UseTradesOptions) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchTrades = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ accountId, page: String(page), limit: String(limit) });
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/trades?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch trades:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, from, to, page, limit]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, isLoading, total, refetch: fetchTrades };
}

export function useTodayTrades(accountId: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/trades/today?accountId=${accountId}`);
        if (res.ok) {
          const data = await res.json();
          setTrades(data.trades);
        }
      } catch (error) {
        console.error("Failed to fetch today's trades:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetch_();
  }, [accountId]);

  return { trades, isLoading };
}
