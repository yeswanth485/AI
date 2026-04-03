import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: "bg-border text-muted",
  success: "bg-accent-green/15 text-accent-green",
  danger: "bg-accent-red/15 text-accent-red",
  warning: "bg-yellow-500/15 text-yellow-400",
  info: "bg-accent/15 text-accent",
};

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
