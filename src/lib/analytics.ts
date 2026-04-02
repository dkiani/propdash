import { Trade } from "@prisma/client";

export interface TradeStats {
  totalTrades: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  avgWinner: number;
  avgLoser: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  avgDuration: number;
  netPnl: number;
  currentStreak: { type: "win" | "loss"; count: number };
}

export function computeTradeStats(trades: Trade[]): TradeStats {
  const closedTrades = trades.filter((t) => t.realizedPnl !== null);

  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winCount: 0,
      lossCount: 0,
      winRate: 0,
      avgWinner: 0,
      avgLoser: 0,
      profitFactor: 0,
      largestWin: 0,
      largestLoss: 0,
      avgDuration: 0,
      netPnl: 0,
      currentStreak: { type: "win", count: 0 },
    };
  }

  const winners = closedTrades.filter((t) => (t.realizedPnl ?? 0) > 0);
  const losers = closedTrades.filter((t) => (t.realizedPnl ?? 0) < 0);

  const totalWins = winners.reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0);
  const totalLosses = Math.abs(losers.reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0));

  // Current streak
  let streakType: "win" | "loss" = (closedTrades[closedTrades.length - 1].realizedPnl ?? 0) > 0 ? "win" : "loss";
  let streakCount = 0;
  for (let i = closedTrades.length - 1; i >= 0; i--) {
    const isWin = (closedTrades[i].realizedPnl ?? 0) > 0;
    if ((isWin && streakType === "win") || (!isWin && streakType === "loss")) {
      streakCount++;
    } else {
      break;
    }
  }

  const durations = closedTrades.filter((t) => t.duration).map((t) => t.duration!);

  return {
    totalTrades: closedTrades.length,
    winCount: winners.length,
    lossCount: losers.length,
    winRate: closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0,
    avgWinner: winners.length > 0 ? totalWins / winners.length : 0,
    avgLoser: losers.length > 0 ? totalLosses / losers.length : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    largestWin: winners.length > 0 ? Math.max(...winners.map((t) => t.realizedPnl ?? 0)) : 0,
    largestLoss: losers.length > 0 ? Math.min(...losers.map((t) => t.realizedPnl ?? 0)) : 0,
    avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    netPnl: closedTrades.reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0),
    currentStreak: { type: streakType, count: streakCount },
  };
}

export function computePnlByDayOfWeek(trades: Trade[]): Record<string, number> {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const result: Record<string, number> = {};
  days.forEach((d) => (result[d] = 0));

  trades.forEach((t) => {
    if (t.realizedPnl !== null) {
      const day = days[new Date(t.entryTime).getDay()];
      result[day] += t.realizedPnl;
    }
  });

  return result;
}

export function computePnlByHour(trades: Trade[]): Record<number, number> {
  const result: Record<number, number> = {};
  for (let h = 0; h < 24; h++) result[h] = 0;

  trades.forEach((t) => {
    if (t.realizedPnl !== null) {
      const hour = new Date(t.entryTime).getHours();
      result[hour] += t.realizedPnl;
    }
  });

  return result;
}

export function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? "-" : amount > 0 ? "+" : "";
  return `${prefix}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  }
  return `${mins}m ${secs}s`;
}
