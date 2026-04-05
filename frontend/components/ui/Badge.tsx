import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "info" | "purple" | "orange";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: "bg-border text-muted",
  success: "bg-accent-green/10 text-accent-green",
  danger: "bg-accent-red/10 text-accent-red",
  warning: "bg-accent/10 text-accent",
  info: "bg-accent-blue/10 text-accent-blue",
  purple: "bg-accent-purple/10 text-accent-purple",
  orange: "bg-accent-orange/10 text-accent-orange",
};

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
