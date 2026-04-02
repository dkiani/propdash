type Color = "gold" | "green" | "yellow" | "red";

interface ProgressBarProps {
  value: number; // 0-100
  color?: Color;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const colorStyles: Record<Color, string> = {
  gold: "bg-accent-gold",
  green: "bg-status-green",
  yellow: "bg-status-yellow",
  red: "bg-status-red",
};

const sizeStyles: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  color = "gold",
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-bg-elevated rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-text-muted text-right font-mono">
          {Math.round(clamped)}%
        </div>
      )}
    </div>
  );
}
