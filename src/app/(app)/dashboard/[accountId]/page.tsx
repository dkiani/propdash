"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DrawdownGauge } from "@/components/dashboard/DrawdownGauge";
import { DrawdownChart } from "@/components/dashboard/DrawdownChart";
import { EvalProgress } from "@/components/dashboard/EvalProgress";
import { TradeTable } from "@/components/dashboard/TradeTable";
import { PnlCalendar } from "@/components/dashboard/PnlCalendar";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/analytics";

interface Trade {
  id: string;
  instrument: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  entryTime: string;
  exitTime: string;
  duration: number;
  quantity: number;
}

interface Account {
  id: string;
  name: string;
  firm: string;
  plan: string;
  accountType: "evaluation" | "funded";
  currentBalance: number;
  startingBalance: number;
  maxDrawdown: number;
  drawdownType: "trailing" | "eod" | "static";
  highWaterMark: number;
  profitTarget: number | null;
  minTradingDays: number | null;
  tradingDaysCount: number;
  dailyPnl: number;
  drawdownRemaining: number;
  drawdownFloor: number;
  healthStatus: "healthy" | "caution" | "danger" | "critical";
}

// TODO: Replace mock data with real API responses once endpoints are ready
const MOCK_CHART_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const baseBalance = 50000 + Math.sin(i * 0.3) * 1500 + i * 50;
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    balance: Math.round(baseBalance * 100) / 100,
    drawdownFloor: 47500,
  };
});

const MOCK_PNL_DATA = Array.from({ length: 60 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (59 - i));
  const dateStr = date.toISOString().split("T")[0];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (isWeekend) return { date: dateStr, pnl: 0 };
  const pnl = (Math.random() - 0.4) * 800;
  return { date: dateStr, pnl: Math.round(pnl * 100) / 100 };
});

const TRADES_PER_PAGE = 10;

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.accountId as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeHistoryPage, setTradeHistoryPage] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // TODO: Fetch from real API endpoints
        const [accountRes, tradesRes] = await Promise.all([
          fetch(`/api/accounts/${accountId}`),
          fetch(`/api/trades?accountId=${accountId}`),
        ]);

        if (accountRes.ok) {
          const accountData = await accountRes.json();
          setAccount(accountData);
        }
        if (tradesRes.ok) {
          const tradesData = await tradesRes.json();
          setTrades(tradesData);
        }
      } catch (error) {
        console.error("Failed to fetch account data:", error);
        // TODO: Remove mock fallback when APIs are ready
        setAccount({
          id: accountId,
          name: "Tradeify 50K",
          firm: "Tradeify",
          plan: "50K Challenge",
          accountType: "evaluation",
          currentBalance: 51250.0,
          startingBalance: 50000.0,
          maxDrawdown: 2500,
          drawdownType: "trailing",
          highWaterMark: 51500.0,
          profitTarget: 3000,
          minTradingDays: 10,
          tradingDaysCount: 7,
          dailyPnl: 325.5,
          drawdownRemaining: 1750.0,
          drawdownFloor: 49000.0,
          healthStatus: "caution",
        });
        setTrades([
          {
            id: "1",
            instrument: "ES",
            side: "long",
            entryPrice: 5125.5,
            exitPrice: 5131.25,
            realizedPnl: 287.5,
            entryTime: new Date().toISOString(),
            exitTime: new Date().toISOString(),
            duration: 420,
            quantity: 1,
          },
          {
            id: "2",
            instrument: "NQ",
            side: "short",
            entryPrice: 18245.0,
            exitPrice: 18230.75,
            realizedPnl: 285.0,
            entryTime: new Date(Date.now() - 3600000).toISOString(),
            exitTime: new Date(Date.now() - 3000000).toISOString(),
            duration: 600,
            quantity: 1,
          },
          {
            id: "3",
            instrument: "ES",
            side: "long",
            entryPrice: 5118.0,
            exitPrice: 5114.25,
            realizedPnl: -187.5,
            entryTime: new Date(Date.now() - 7200000).toISOString(),
            exitTime: new Date(Date.now() - 6800000).toISOString(),
            duration: 400,
            quantity: 1,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [accountId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <p className="text-lg text-text-primary">Account not found</p>
          <Link
            href="/dashboard"
            className="text-sm text-accent-gold hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const todayTrades = trades.filter((t) => {
    const tradeDate = new Date(t.entryTime).toDateString();
    return tradeDate === new Date().toDateString();
  });

  const totalPages = Math.ceil(trades.length / TRADES_PER_PAGE);
  const paginatedTrades = trades.slice(
    tradeHistoryPage * TRADES_PER_PAGE,
    (tradeHistoryPage + 1) * TRADES_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>

      {/* Hero stats bar */}
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-display font-semibold text-text-primary">
                {account.name}
              </h1>
              <Badge
                variant={
                  account.accountType === "funded" ? "gold" : "default"
                }
              >
                {account.accountType === "funded" ? "FUNDED" : "EVALUATION"}
              </Badge>
            </div>
            <p className="text-sm text-text-muted">
              {account.firm} &middot; {account.plan} &middot;{" "}
              {account.drawdownType.charAt(0).toUpperCase() +
                account.drawdownType.slice(1)}{" "}
              Drawdown
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Drawdown Remaining — prominent */}
            <div>
              <DrawdownGauge
                drawdownRemaining={account.drawdownRemaining}
                maxDrawdown={account.maxDrawdown}
                healthStatus={account.healthStatus}
              />
            </div>

            {/* Balance */}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                Balance
              </p>
              <p className="text-2xl font-mono font-semibold text-text-primary">
                {formatCurrency(account.currentBalance).replace(/^[+-]/, "$")}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Started at{" "}
                {formatCurrency(account.startingBalance).replace(/^[+-]/, "$")}
              </p>
            </div>

            {/* Daily P&L */}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                Daily P&L
              </p>
              <p
                className={`text-2xl font-mono font-semibold ${
                  account.dailyPnl > 0
                    ? "text-status-green"
                    : account.dailyPnl < 0
                    ? "text-status-red"
                    : "text-text-muted"
                }`}
              >
                {formatCurrency(account.dailyPnl)}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {todayTrades.length} trade
                {todayTrades.length !== 1 ? "s" : ""} today
              </p>
            </div>

            {/* High Water Mark */}
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                High Water Mark
              </p>
              <p className="text-2xl font-mono font-semibold text-accent-gold">
                {formatCurrency(account.highWaterMark).replace(/^[+-]/, "$")}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Floor at{" "}
                {formatCurrency(account.drawdownFloor).replace(/^[+-]/, "$")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drawdown Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Balance vs Drawdown Floor
          </h2>
        </CardHeader>
        <CardContent>
          {/* TODO: Replace with real chart data from API */}
          <DrawdownChart
            data={MOCK_CHART_DATA}
            maxDrawdown={account.maxDrawdown}
          />
        </CardContent>
      </Card>

      {/* Today's Trades + Eval Progress side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Today&apos;s Trades
            </h2>
          </CardHeader>
          <CardContent>
            <TradeTable trades={todayTrades} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              {account.accountType === "evaluation"
                ? "Eval Progress"
                : "Account Status"}
            </h2>
          </CardHeader>
          <CardContent>
            <EvalProgress
              currentBalance={account.currentBalance}
              startingBalance={account.startingBalance}
              profitTarget={account.profitTarget}
              tradingDaysCount={account.tradingDaysCount}
              minTradingDays={account.minTradingDays}
              accountType={account.accountType}
            />
          </CardContent>
        </Card>
      </div>

      {/* P&L Calendar */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            P&L Calendar
          </h2>
        </CardHeader>
        <CardContent>
          {/* TODO: Replace with real PnL data from API */}
          <PnlCalendar data={MOCK_PNL_DATA} />
        </CardContent>
      </Card>

      {/* Trade History (paginated) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Trade History
            </h2>
            <span className="text-xs text-text-muted">
              {trades.length} total trade{trades.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <TradeTable trades={paginatedTrades} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
              <button
                onClick={() =>
                  setTradeHistoryPage((p) => Math.max(0, p - 1))
                }
                disabled={tradeHistoryPage === 0}
                className="text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-text-muted">
                Page {tradeHistoryPage + 1} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setTradeHistoryPage((p) =>
                    Math.min(totalPages - 1, p + 1)
                  )
                }
                disabled={tradeHistoryPage >= totalPages - 1}
                className="text-sm text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
