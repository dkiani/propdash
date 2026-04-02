"use client";

interface PnlCalendarProps {
  data: Array<{ date: string; pnl: number }>;
}

function getPnlColor(pnl: number | undefined): string {
  if (pnl === undefined) return "bg-bg-elevated";
  if (pnl === 0) return "bg-bg-elevated";
  if (pnl > 0) {
    if (pnl >= 500) return "bg-status-green";
    if (pnl >= 200) return "bg-status-green/70";
    if (pnl >= 50) return "bg-status-green/40";
    return "bg-status-green/20";
  }
  // negative
  if (pnl <= -500) return "bg-status-red";
  if (pnl <= -200) return "bg-status-red/70";
  if (pnl <= -50) return "bg-status-red/40";
  return "bg-status-red/20";
}

function getTooltipText(date: string, pnl: number | undefined): string {
  const formatted = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (pnl === undefined || pnl === 0) return `${formatted}: No trades`;
  const prefix = pnl > 0 ? "+" : "";
  return `${formatted}: ${prefix}$${pnl.toFixed(2)}`;
}

export function PnlCalendar({ data }: PnlCalendarProps) {
  // Build a map of date -> pnl
  const pnlMap = new Map<string, number>();
  data.forEach((d) => pnlMap.set(d.date, d.pnl));

  // Determine date range: last 26 weeks (approx 6 months)
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 26 * 7);

  // Align startDate to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // Build weeks
  const weeks: Array<Array<{ date: string; pnl: number | undefined } | null>> = [];
  const monthLabels: Array<{ label: string; weekIndex: number }> = [];

  const current = new Date(startDate);
  let lastMonth = -1;

  while (current <= endDate) {
    const week: Array<{ date: string; pnl: number | undefined } | null> = [];
    for (let day = 0; day < 7; day++) {
      if (current > endDate) {
        week.push(null);
      } else {
        const dateStr = current.toISOString().split("T")[0];
        week.push({ date: dateStr, pnl: pnlMap.get(dateStr) });

        // Track month labels (on first day of a new month appearing)
        if (current.getMonth() !== lastMonth && day === 0) {
          monthLabels.push({
            label: current.toLocaleDateString("en-US", { month: "short" }),
            weekIndex: weeks.length,
          });
          lastMonth = current.getMonth();
        }
      }
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="space-y-2">
      {/* Month labels */}
      <div className="flex text-xs text-text-muted ml-8">
        {weeks.map((_, weekIdx) => {
          const label = monthLabels.find((m) => m.weekIndex === weekIdx);
          return (
            <div key={weekIdx} className="flex-shrink-0" style={{ width: 14, marginRight: 2 }}>
              {label ? label.label : ""}
            </div>
          );
        })}
      </div>

      <div className="flex">
        {/* Day-of-week labels */}
        <div className="flex flex-col mr-2 text-xs text-text-muted">
          {dayLabels.map((label, i) => (
            <div key={i} style={{ height: 14, marginBottom: 2 }} className="flex items-center">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-0.5">
              {week.map((cell, dayIdx) => (
                <div
                  key={dayIdx}
                  title={cell ? getTooltipText(cell.date, cell.pnl) : ""}
                  className={`w-3.5 h-3.5 rounded-sm ${
                    cell ? getPnlColor(cell.pnl) : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
        <span>Loss</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-status-red" />
          <div className="w-3 h-3 rounded-sm bg-status-red/70" />
          <div className="w-3 h-3 rounded-sm bg-status-red/40" />
          <div className="w-3 h-3 rounded-sm bg-bg-elevated" />
          <div className="w-3 h-3 rounded-sm bg-status-green/40" />
          <div className="w-3 h-3 rounded-sm bg-status-green/70" />
          <div className="w-3 h-3 rounded-sm bg-status-green" />
        </div>
        <span>Profit</span>
      </div>
    </div>
  );
}
