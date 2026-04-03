import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/20",
          error && "border-accent-red focus:border-accent-red focus:ring-accent-red/20",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent-red">{error}</span>}
    </div>
  );
}
