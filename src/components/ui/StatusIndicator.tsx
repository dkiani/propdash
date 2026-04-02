type Status = "healthy" | "caution" | "danger" | "critical" | "offline" | "syncing";

interface StatusIndicatorProps {
  status: Status;
  label?: string;
  size?: "sm" | "md";
}

const statusStyles: Record<Status, { dot: string; text: string; label: string }> = {
  healthy: { dot: "bg-status-green", text: "text-status-green", label: "Healthy" },
  caution: { dot: "bg-status-yellow", text: "text-status-yellow", label: "Caution" },
  danger: { dot: "bg-status-red", text: "text-status-red", label: "Danger" },
  critical: { dot: "bg-status-red animate-pulse", text: "text-status-red", label: "Critical" },
  offline: { dot: "bg-text-muted", text: "text-text-muted", label: "Offline" },
  syncing: { dot: "bg-accent-gold animate-pulse", text: "text-accent-gold", label: "Syncing" },
};

const sizeStyles: Record<string, { dot: string; text: string }> = {
  sm: { dot: "h-2 w-2", text: "text-xs" },
  md: { dot: "h-2.5 w-2.5", text: "text-sm" },
};

export function StatusIndicator({ status, label, size = "sm" }: StatusIndicatorProps) {
  const styles = statusStyles[status];
  const sizes = sizeStyles[size];

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`rounded-full ${styles.dot} ${sizes.dot}`} />
      <span className={`${styles.text} ${sizes.text} font-medium`}>
        {label || styles.label}
      </span>
    </div>
  );
}
