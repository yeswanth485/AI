export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-3.5 w-3.5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} rounded-full border-accent/20 border-t-accent animate-spin`}
      />
    </div>
  );
}
