"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DrawdownGauge } from "@/components/dashboard/DrawdownGauge";
import { EvalProgress } from "@/components/dashboard/EvalProgress";
import { calculateDrawdown } from "@/lib/drawdown";

interface Account {
  id: string;
  accountName: string | null;
  accountType: string;
  status: string;
  currentBalance: number;
  highWaterMark: number;
  drawdownFloor: number;
  drawdownRemaining: number;
  tradingDaysCount: number;
  lastSyncAt: string | null;
  plan: {
    firmName: string;
    planName: string;
    startingBalance: number;
    maxDrawdown: number;
    drawdownType: string;
    profitTarget: number | null;
    minTradingDays: number | null;
  };
}

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  const drawdown = calculateDrawdown({
    drawdownType: account.plan.drawdownType as "trailing" | "eod" | "static",
    startingBalance: account.plan.startingBalance,
    maxDrawdown: account.plan.maxDrawdown,
    currentBalance: account.currentBalance,
    highWaterMark: account.highWaterMark,
  });

  const typeBadgeVariant = account.accountType === "evaluation" ? "gold" : "success";

  return (
    <Card health={drawdown.healthStatus} hoverable>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {account.plan.firmName}
            </p>
            <p className="text-xs text-text-muted">
              {account.plan.planName}
              {account.accountName ? ` \u00B7 ${account.accountName}` : ""}
            </p>
          </div>
          <Badge variant={typeBadgeVariant}>
            {account.accountType === "evaluation" ? "Evaluation" : "Funded"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <DrawdownGauge
          drawdownRemaining={drawdown.drawdownRemaining}
          maxDrawdown={account.plan.maxDrawdown}
          healthStatus={drawdown.healthStatus}
        />

        <div className="space-y-2 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted uppercase tracking-wider">
              Balance
            </span>
            <span className="text-sm font-mono text-text-primary">
              ${account.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted uppercase tracking-wider">
              Daily P&L
            </span>
            <span className="text-sm font-mono text-text-muted">
              {"\u2014"}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-border-subtle">
          <EvalProgress
            currentBalance={account.currentBalance}
            startingBalance={account.plan.startingBalance}
            profitTarget={account.plan.profitTarget}
            tradingDaysCount={account.tradingDaysCount}
            minTradingDays={account.plan.minTradingDays}
            accountType={account.accountType}
          />
        </div>

        <div className="pt-2 border-t border-border-subtle">
          <Link
            href={`/dashboard/${account.id}`}
            className="text-sm text-accent-gold hover:underline font-medium"
          >
            View Details &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
