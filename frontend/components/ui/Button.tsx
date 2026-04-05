import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "lime" | "ghost" | "outline" | "danger" | "teal" | "purple";
  loading?: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "lime",
  loading = false,
  className,
  children,
  disabled,
  size = "md",
  ...props
}: ButtonProps) {
  const variants = {
    lime: "bg-accent text-ink font-semibold hover:bg-[#d8ff20] hover:shadow-[0_4px_20px_rgba(200,255,0,.25)] disabled:bg-accent/50 disabled:text-muted-dark",
    ghost: "bg-transparent text-muted hover:text-foreground hover:bg-white/[.04]",
    outline: "bg-transparent text-foreground border border-border2 hover:border-accent hover:text-accent hover:bg-accent/5",
    danger: "bg-accent-red/15 text-accent-red border border-accent-red/20 hover:bg-accent-red/25",
    teal: "bg-accent-green/15 text-accent-green border border-accent-green/20 hover:bg-accent-green/25 hover:shadow-[0_4px_20px_rgba(0,228,200,.15)]",
    purple: "bg-accent-purple/15 text-accent-purple border border-accent-purple/20 hover:bg-accent-purple/25 hover:shadow-[0_4px_20px_rgba(167,139,250,.15)]",
  };

  const sizes = {
    sm: "rounded-full px-3.5 py-2 text-[11px]",
    md: "rounded-full px-5 py-2.5 text-xs",
    lg: "rounded-full px-7 py-3 text-sm",
  };

  return (
    <button
      className={cn(
        "btn-primary inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:cursor-not-allowed tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
