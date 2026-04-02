"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EquityCurveProps {
  data: Array<{ date: string; cumulativePnl: number }>;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-lg">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p
        className={`font-mono text-sm font-semibold ${
          value >= 0 ? "text-status-green" : "text-status-red"
        }`}
      >
        {value >= 0 ? "+" : ""}${Math.abs(value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

export function EquityCurve({ data }: EquityCurveProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a44a" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#c9a44a" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: "#475569", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#1e1e1e" }}
        />
        <YAxis
          tick={{ fill: "#475569", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cumulativePnl"
          stroke="#c9a44a"
          strokeWidth={2}
          fill="url(#goldGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#c9a44a", stroke: "#0a0a0a", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
