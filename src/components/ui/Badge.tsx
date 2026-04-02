type Variant = "default" | "success" | "warning" | "danger" | "gold";

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default: "bg-bg-elevated text-text-secondary",
  success: "bg-status-green/10 text-status-green",
  warning: "bg-status-yellow/10 text-status-yellow",
  danger: "bg-status-red/10 text-status-red",
  gold: "bg-accent-gold-dim text-accent-gold",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
