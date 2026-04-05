import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
}

export default function Card({ children, className, hover = false, glow = false, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-2xl p-5 relative overflow-hidden transition-all duration-300",
        hover && "card-hover hover:border-border2",
        glow && "animate-borderGlow",
        gradient && "bg-gradient-to-br from-surface to-surface2",
        className
      )}
    >
      {children}
    </div>
  );
}
