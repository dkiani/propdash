"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { calculateEvalProgress } from "@/lib/drawdown";
import { formatCurrency } from "@/lib/analytics";

interface EvalProgressProps {
  currentBalance: number;
  startingBalance: number;
  profitTarget: number | null;
  tradingDaysCount: number;
  minTradingDays: number | null;
  accountType: string;
}

export function EvalProgress({
  currentBalance,
  startingBalance,
  profitTarget,
  tradingDaysCount,
  minTradingDays,
  accountType,
}: EvalProgressProps) {
  if (accountType !== "evaluation") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-text-muted uppercase tracking-wider">
          Funded Account
        </p>
        <p className="text-sm text-text-secondary">
          Payout eligible. Check firm portal for payout schedule.
        </p>
      </div>
    );
  }

  if (profitTarget === null || minTradingDays === null) {
    return null;
  }

  const progress = calculateEvalProgress({
    currentBalance,
    startingBalance,
    profitTarget,
    tradingDaysCount,
    minTradingDays,
  });

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted uppercase tracking-wider">
            Profit Target
          </span>
          <span className="text-xs font-mono text-text-secondary">
            {formatCurrency(progress.currentProfit)} / {formatCurrency(profitTarget)}
          </span>
        </div>
        <ProgressBar
          value={progress.profitProgress}
          color={progress.profitTargetMet ? "green" : "gold"}
          size="sm"
        />
        {progress.profitTargetMet && (
          <p className="text-xs text-status-green mt-0.5 font-medium">Target met</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted uppercase tracking-wider">
            Trading Days
          </span>
          <span className="text-xs font-mono text-text-secondary">
            {tradingDaysCount} / {minTradingDays}
          </span>
        </div>
        <ProgressBar
          value={progress.daysProgress}
          color={progress.daysTargetMet ? "green" : "gold"}
          size="sm"
        />
        {progress.daysTargetMet && (
          <p className="text-xs text-status-green mt-0.5 font-medium">Requirement met</p>
        )}
      </div>

      {!progress.passed && progress.remainingDays > 0 && (
        <p className="text-xs text-text-muted">
          Estimated {progress.remainingDays} more trading day{progress.remainingDays !== 1 ? "s" : ""} needed
        </p>
      )}

      {progress.passed && (
        <p className="text-sm text-status-green font-medium">
          All requirements met
        </p>
      )}
    </div>
  );
}
