"use client";

import { Card, CardContent } from "@/components/ui/Card";

export interface WeekData {
  weekRange: string;
  trades: number;
  wins: number;
  winRate: number;
  netPnl: number;
  bestDay: { day: string; pnl: number };
  worstDay: { day: string; pnl: number };
  insight: string;
  streak: number;
}

interface WrappedCardProps {
  weekData: WeekData;
}

function formatCurrency(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function WrappedCard({ weekData }: WrappedCardProps) {
  return (
    <Card className="border-accent-gold/40">
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl text-text-primary">This Week</h3>
            <p className="text-text-muted text-xs font-mono">{weekData.weekRange}</p>
          </div>
          {weekData.streak > 0 && (
            <div className="text-right">
              <p className="text-accent-gold font-mono text-lg font-semibold">
                {weekData.streak}
              </p>
              <p className="text-text-muted text-xs">day streak</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              Net P&L
            </p>
            <p
              className={`font-mono text-lg font-semibold ${
                weekData.netPnl >= 0 ? "text-status-green" : "text-status-red"
              }`}
            >
              {formatCurrency(weekData.netPnl)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              Trades
            </p>
            <p className="font-mono text-lg font-semibold text-text-primary">
              {weekData.trades}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              Win Rate
            </p>
            <p
              className={`font-mono text-lg font-semibold ${
                weekData.winRate >= 50 ? "text-status-green" : "text-status-red"
              }`}
            >
              {weekData.winRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-bg-elevated rounded-lg">
            <p className="text-xs text-text-muted mb-1">Best Day</p>
            <p className="text-text-primary text-sm font-medium">{weekData.bestDay.day}</p>
            <p className="font-mono text-status-green text-sm">
              {formatCurrency(weekData.bestDay.pnl)}
            </p>
          </div>
          <div className="p-3 bg-bg-elevated rounded-lg">
            <p className="text-xs text-text-muted mb-1">Worst Day</p>
            <p className="text-text-primary text-sm font-medium">
              {weekData.worstDay.day}
            </p>
            <p className="font-mono text-status-red text-sm">
              {formatCurrency(weekData.worstDay.pnl)}
            </p>
          </div>
        </div>

        {weekData.insight && (
          <div className="p-4 bg-accent-gold-dim rounded-lg border border-accent-gold/20">
            <p className="text-accent-gold text-sm">{weekData.insight}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
