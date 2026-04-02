"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

interface DrawdownGaugeProps {
  drawdownRemaining: number;
  maxDrawdown: number;
  healthStatus: "healthy" | "caution" | "danger" | "critical";
}

const healthColorMap: Record<DrawdownGaugeProps["healthStatus"], string> = {
  healthy: "text-status-green",
  caution: "text-status-yellow",
  danger: "text-status-red",
  critical: "text-status-red",
};

const barColorMap: Record<DrawdownGaugeProps["healthStatus"], "green" | "yellow" | "red"> = {
  healthy: "green",
  caution: "yellow",
  danger: "red",
  critical: "red",
};

export function DrawdownGauge({ drawdownRemaining, maxDrawdown, healthStatus }: DrawdownGaugeProps) {
  const remainingPercent = maxDrawdown > 0 ? (drawdownRemaining / maxDrawdown) * 100 : 0;
  const isCritical = healthStatus === "critical";

  return (
    <div className={`space-y-3 ${isCritical ? "pulse-danger" : ""}`}>
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          Drawdown Left
        </p>
        <p className={`text-3xl font-mono font-semibold ${healthColorMap[healthStatus]}`}>
          ${drawdownRemaining.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <ProgressBar
        value={remainingPercent}
        color={barColorMap[healthStatus]}
        size="md"
      />

      <div className="flex items-center justify-between">
        <StatusIndicator status={healthStatus} />
        {isCritical && (
          <span className="text-xs font-semibold text-status-red uppercase tracking-wider animate-pulse">
            Stop Trading
          </span>
        )}
      </div>
    </div>
  );
}
