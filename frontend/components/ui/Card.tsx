import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-2xl p-5 relative overflow-hidden transition-all",
        hover && "hover:border-border2 hover:translate-y-[-1px]",
        className
      )}
    >
      {children}
    </div>
  );
}
