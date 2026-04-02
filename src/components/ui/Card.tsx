import { HTMLAttributes, forwardRef } from "react";

type HealthStatus = "healthy" | "caution" | "danger" | "critical" | "default";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  health?: HealthStatus;
  hoverable?: boolean;
}

const healthBorderColors: Record<HealthStatus, string> = {
  healthy: "border-status-green/30",
  caution: "border-status-yellow/30",
  danger: "border-status-red/30",
  critical: "pulse-danger border-status-red",
  default: "border-border-subtle",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ health = "default", hoverable = false, className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-bg-surface rounded-xl border ${healthBorderColors[health]} ${hoverable ? "hover:border-border-default hover:bg-bg-elevated transition-colors cursor-pointer" : ""} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 border-b border-border-subtle ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
