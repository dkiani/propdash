"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TimeOfDayChartProps {
  data: Record<number, number>;
}

function formatHour(hour: number): string {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
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

export function TimeOfDayChart({ data }: TimeOfDayChartProps) {
  const chartData = Object.entries(data)
    .map(([hour, pnl]) => ({
      hour: formatHour(Number(hour)),
      hourNum: Number(hour),
      pnl,
    }))
    .sort((a, b) => a.hourNum - b.hourNum);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-[250px] text-text-muted text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <XAxis
          dataKey="hour"
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
        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
