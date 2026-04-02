"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";

interface DailyTargetBarProps {
  currentDailyPnl: number;
  dailyTarget: number;
}

export function DailyTargetBar({ currentDailyPnl, dailyTarget }: DailyTargetBarProps) {
  const progress = dailyTarget > 0 ? Math.min(100, Math.max(0, (currentDailyPnl / dailyTarget) * 100)) : 0;
  const isHit = currentDailyPnl >= dailyTarget && dailyTarget > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted uppercase tracking-wider">
          Daily Target
        </span>
        <span className="text-xs font-mono text-text-secondary">
          {isHit ? (
            <span className="text-status-green font-medium">HIT &#10003;</span>
          ) : (
            <>
              ${currentDailyPnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {" / "}
              ${dailyTarget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </>
          )}
        </span>
      </div>
      <ProgressBar
        value={progress}
        color={isHit ? "green" : "gold"}
        size="sm"
      />
    </div>
  );
}
