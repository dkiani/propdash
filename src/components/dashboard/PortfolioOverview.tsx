"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { useDashboardStore } from "@/stores/dashboardStore";
import { formatCurrency } from "@/lib/analytics";

export function PortfolioOverview() {
  const { accounts } = useDashboardStore();

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const activeCount = accounts.filter((a) => a.status === "active").length;

  const stats = [
    {
      label: "Total Balance",
      value: `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "text-text-primary",
    },
    {
      label: "Daily P&L",
      value: "\u2014",
      color: "text-text-muted",
    },
    {
      label: "Active Accounts",
      value: String(activeCount),
      color: "text-text-primary",
    },
    {
      label: "Trades Today",
      value: "\u2014",
      color: "text-text-muted",
    },
  ];

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-mono font-medium ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
