import { Chip, type ChipColor } from "heroui-native/chip";
import { twMerge } from "tailwind-merge";

export type AppBadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "neutral" | "success" | "warning" | "danger" | "info" | "private" | "ai";
};

const colorMap: Record<NonNullable<AppBadgeProps["variant"]>, ChipColor> = {
  neutral: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "accent",
  private: "default",
  ai: "accent",
};

export function AppBadge({
  children,
  className,
  variant = "neutral",
}: AppBadgeProps) {
  return (
    <Chip
      className={twMerge("self-start rounded-full", className)}
      color={colorMap[variant]}
      size="sm"
      variant="soft"
    >
      {children}
    </Chip>
  );
}
