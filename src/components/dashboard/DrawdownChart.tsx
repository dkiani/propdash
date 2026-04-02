"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DrawdownChartProps {
  data: Array<{ date: string; balance: number; drawdownFloor: number }>;
  maxDrawdown: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-mono" style={{ color: entry.color }}>
          {entry.dataKey === "balance" ? "Balance" : "Floor"}:{" "}
          ${entry.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export function DrawdownChart({ data, maxDrawdown }: DrawdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        <div className="text-center">
          <p className="text-sm">No chart data available</p>
          <p className="text-xs mt-1">Balance history will appear after trading</p>
        </div>
      </div>
    );
  }

  const allValues = data.flatMap((d) => [d.balance, d.drawdownFloor]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.1 || 500;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a44a" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#c9a44a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#374151" }}
        />
        <YAxis
          domain={[minVal - padding, maxVal + padding]}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#c9a44a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#c9a44a" }}
        />
        <Line
          type="stepAfter"
          dataKey="drawdownFloor"
          stroke="#ef4444"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          activeDot={{ r: 3, fill: "#ef4444" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
