import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-3xl bg-white/[0.07] shadow-inner",
        className,
      )}
      {...props}
    />
  );
}
