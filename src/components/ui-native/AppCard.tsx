import type { ReactNode } from "react";
import { Card } from "heroui-native/card";
import { Pressable, type ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";

export type AppCardProps = ViewProps & {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onPress?: () => void;
  variant?: "compact" | "default" | "elevated";
};

const variantClasses = {
  compact: "rounded-2xl p-4",
  default: "rounded-3xl p-5",
  elevated: "rounded-3xl p-5 shadow-sm",
} as const;

export function AppCard({
  children,
  className,
  disabled = false,
  onPress,
  variant = "default",
  ...props
}: AppCardProps) {
  const cardClassName = twMerge(
    "w-full overflow-hidden border border-border bg-surface",
    variantClasses[variant],
    disabled && "opacity-50",
    className,
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        className={cardClassName}
        disabled={disabled}
        onPress={onPress}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <Card className={cardClassName} {...props}>
      {children}
    </Card>
  );
}
