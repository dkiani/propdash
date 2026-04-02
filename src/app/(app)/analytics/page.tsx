"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { StatsGrid, Stats } from "@/components/analytics/StatsGrid";
import { EquityCurve } from "@/components/analytics/EquityCurve";
import { DayOfWeekChart } from "@/components/analytics/DayOfWeekChart";
import { TimeOfDayChart } from "@/components/analytics/TimeOfDayChart";
import { WrappedCard, WeekData } from "@/components/analytics/WrappedCard";

interface AnalyticsData {
  stats: Stats;
  equityCurve: Array<{ date: string; cumulativePnl: number }>;
  dayOfWeek: Record<string, number>;
  timeOfDay: Record<number, number>;
  weekSummary: WeekData;
}

const MOCK_DATA: AnalyticsData = {
  stats: {
    winRate: 58.3,
    avgWinner: 342.5,
    avgLoser: -215.8,
    profitFactor: 1.87,
    largestWin: 1250.0,
    largestLoss: -680.0,
    avgDuration: "24m",
    netPnl: 4825.6,
    totalTrades: 48,
    currentStreak: 3,
  },
  equityCurve: [
    { date: "Mar 3", cumulativePnl: 0 },
    { date: "Mar 4", cumulativePnl: 320 },
    { date: "Mar 5", cumulativePnl: 185 },
    { date: "Mar 6", cumulativePnl: 640 },
    { date: "Mar 7", cumulativePnl: 520 },
    { date: "Mar 10", cumulativePnl: 890 },
    { date: "Mar 11", cumulativePnl: 1240 },
    { date: "Mar 12", cumulativePnl: 1050 },
    { date: "Mar 13", cumulativePnl: 1580 },
    { date: "Mar 14", cumulativePnl: 1920 },
    { date: "Mar 17", cumulativePnl: 2350 },
    { date: "Mar 18", cumulativePnl: 2180 },
    { date: "Mar 19", cumulativePnl: 2640 },
    { date: "Mar 20", cumulativePnl: 3100 },
    { date: "Mar 21", cumulativePnl: 2870 },
    { date: "Mar 24", cumulativePnl: 3420 },
    { date: "Mar 25", cumulativePnl: 3780 },
    { date: "Mar 26", cumulativePnl: 4120 },
    { date: "Mar 27", cumulativePnl: 3950 },
    { date: "Mar 28", cumulativePnl: 4350 },
    { date: "Mar 31", cumulativePnl: 4825.6 },
  ],
  dayOfWeek: {
    Mon: 1240,
    Tue: 860,
    Wed: -320,
    Thu: 1580,
    Fri: 1465.6,
  },
  timeOfDay: {
    9: 1820,
    10: 1340,
    11: 420,
    12: -180,
    13: -350,
    14: 680,
    15: 1095.6,
  },
  weekSummary: {
    weekRange: "Mar 31 - Apr 2",
    trades: 8,
    wins: 5,
    winRate: 62.5,
    netPnl: 875.6,
    bestDay: { day: "Monday", pnl: 520 },
    worstDay: { day: "Tuesday", pnl: -145 },
    insight:
      "Your morning sessions (9-10am) are driving most of your profits. Consider limiting afternoon trades where your edge decreases.",
    streak: 5,
  },
};

const MOCK_ACCOUNTS = [
  { value: "acc_1", label: "FTMO Challenge" },
  { value: "acc_2", label: "MFF Funded" },
];

export default function AnalyticsPage() {
  const [selectedAccount, setSelectedAccount] = useState(MOCK_ACCOUNTS[0].value);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/${selectedAccount}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          // Fall back to mock data
          setData(MOCK_DATA);
        }
      } catch {
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [selectedAccount]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-3xl text-text-primary">
          Performance Analytics
        </h1>
        {MOCK_ACCOUNTS.length > 1 && (
          <div className="w-full sm:w-56">
            <Select
              options={MOCK_ACCOUNTS}
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            />
          </div>
        )}
      </div>

      <StatsGrid stats={data.stats} />

      <Card>
        <CardHeader>
          <h2 className="text-text-primary font-medium">Equity Curve</h2>
        </CardHeader>
        <CardContent>
          <EquityCurve data={data.equityCurve} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-text-primary font-medium">P&L by Day of Week</h2>
          </CardHeader>
          <CardContent>
            <DayOfWeekChart data={data.dayOfWeek} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-text-primary font-medium">P&L by Time of Day</h2>
          </CardHeader>
          <CardContent>
            <TimeOfDayChart data={data.timeOfDay} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-display text-2xl text-text-primary mb-4">
          Weekly Wrapped
        </h2>
        <WrappedCard weekData={data.weekSummary} />
      </div>
    </div>
  );
}
