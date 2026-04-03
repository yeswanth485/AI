export function formatCurrency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export function formatWeight(value: number): string {
  return `${value.toFixed(1)} kg`;
}

export function formatDimensions(l: number, w: number, h: number): string {
  return `${l.toFixed(1)} × ${w.toFixed(1)} × ${h.toFixed(1)} cm`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
