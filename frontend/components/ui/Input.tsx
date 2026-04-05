import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[11px] font-bold text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full rounded-xl border border-border2 bg-surface2 px-3.5 py-2.5 text-sm text-foreground placeholder-muted-dark/50 outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,255,0,.08)]",
          error && "border-accent-red focus:border-accent-red focus:shadow-none",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-accent-red">{error}</span>}
    </div>
  );
}
