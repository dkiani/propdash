"use client";

import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDuration } from "@/lib/analytics";

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

interface TradeTableProps {
  trades: Trade[];
}

export function TradeTable({ trades }: TradeTableProps) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <svg
          className="w-12 h-12 mb-3 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6"
          />
        </svg>
        <p className="text-sm">No trades yet</p>
        <p className="text-xs mt-1">Trades will appear here once synced</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
            <th className="text-left py-3 px-3 font-medium">Time</th>
            <th className="text-left py-3 px-3 font-medium">Side</th>
            <th className="text-left py-3 px-3 font-medium">Instrument</th>
            <th className="text-right py-3 px-3 font-medium">Entry</th>
            <th className="text-right py-3 px-3 font-medium">Exit</th>
            <th className="text-right py-3 px-3 font-medium">P&L</th>
            <th className="text-right py-3 px-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr
              key={trade.id}
              className="border-b border-border-subtle/50 hover:bg-bg-elevated/50 transition-colors"
            >
              <td className="py-3 px-3 text-text-secondary font-mono text-xs">
                {new Date(trade.entryTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-3 px-3">
                <Badge variant={trade.side === "long" ? "success" : "danger"}>
                  {trade.side === "long" ? "LONG" : "SHORT"}
                </Badge>
              </td>
              <td className="py-3 px-3 text-text-primary font-medium">
                {trade.instrument}
              </td>
              <td className="py-3 px-3 text-right text-text-secondary font-mono">
                {trade.entryPrice.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right text-text-secondary font-mono">
                {trade.exitPrice.toFixed(2)}
              </td>
              <td
                className={`py-3 px-3 text-right font-mono font-semibold ${
                  trade.realizedPnl > 0
                    ? "text-status-green"
                    : trade.realizedPnl < 0
                    ? "text-status-red"
                    : "text-text-muted"
                }`}
              >
                {formatCurrency(trade.realizedPnl)}
              </td>
              <td className="py-3 px-3 text-right text-text-muted font-mono text-xs">
                {formatDuration(trade.duration)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
