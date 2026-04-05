import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "lime" | "ghost" | "outline" | "danger";
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "lime",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    lime: "bg-accent text-ink font-semibold hover:bg-[#d8ff20] disabled:bg-accent/50 disabled:text-muted-dark",
    ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface/50",
    outline: "bg-transparent text-foreground border border-border2 hover:border-accent hover:text-accent",
    danger: "bg-accent-red/15 text-accent-red border border-accent-red/20 hover:bg-accent-red/25",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed tracking-wide",
        variants[variant],
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
