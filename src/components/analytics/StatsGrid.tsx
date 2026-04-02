"use client";

import { Card, CardContent } from "@/components/ui/Card";

export interface Stats {
  winRate: number;
  avgWinner: number;
  avgLoser: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  avgDuration: string;
  netPnl: number;
  totalTrades: number;
  currentStreak: number;
}

interface StatsGridProps {
  stats: Stats;
}

function formatCurrency(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatCard({
  label,
  value,
  colorCode,
}: {
  label: string;
  value: string;
  colorCode?: "positive" | "negative" | "neutral";
}) {
  const valueColor =
    colorCode === "positive"
      ? "text-status-green"
      : colorCode === "negative"
      ? "text-status-red"
      : "text-text-primary";

  return (
    <Card>
      <CardContent className="py-3 px-4">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-mono text-lg font-semibold ${valueColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  const items: { label: string; value: string; colorCode?: "positive" | "negative" | "neutral" }[] =
    [
      { label: "Net P&L", value: formatCurrency(stats.netPnl), colorCode: stats.netPnl >= 0 ? "positive" : "negative" },
      { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%`, colorCode: stats.winRate >= 50 ? "positive" : "negative" },
      { label: "Total Trades", value: stats.totalTrades.toString() },
      { label: "Profit Factor", value: stats.profitFactor.toFixed(2), colorCode: stats.profitFactor >= 1 ? "positive" : "negative" },
      { label: "Avg Winner", value: formatCurrency(stats.avgWinner), colorCode: "positive" },
      { label: "Avg Loser", value: formatCurrency(stats.avgLoser), colorCode: "negative" },
      { label: "Largest Win", value: formatCurrency(stats.largestWin), colorCode: "positive" },
      { label: "Largest Loss", value: formatCurrency(stats.largestLoss), colorCode: "negative" },
      { label: "Avg Duration", value: stats.avgDuration },
      {
        label: "Current Streak",
        value: `${stats.currentStreak > 0 ? "+" : ""}${stats.currentStreak}`,
        colorCode: stats.currentStreak > 0 ? "positive" : stats.currentStreak < 0 ? "negative" : "neutral",
      },
    ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
