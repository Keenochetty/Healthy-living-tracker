import type { ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "heroui-native/button";
import { twMerge } from "tailwind-merge";

export type AppIconButtonProps = {
  accessibilityLabel: string;
  className?: string;
  disabled?: boolean;
  icon: ReactNode;
  onPress?: () => void;
  shape?: "circle" | "square";
  size?: ButtonSize;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "soft";
};

const variantMap: Record<
  NonNullable<AppIconButtonProps["variant"]>,
  ButtonVariant
> = {
  primary: "primary",
  secondary: "outline",
  ghost: "ghost",
  danger: "danger",
  soft: "secondary",
};

export function AppIconButton({
  accessibilityLabel,
  className,
  disabled = false,
  icon,
  onPress,
  shape = "circle",
  size = "md",
  variant = "ghost",
}: AppIconButtonProps) {
  return (
    <Button
      accessibilityLabel={accessibilityLabel}
      className={twMerge(
        "min-h-11 min-w-11",
        shape === "circle" ? "rounded-full" : "rounded-2xl",
        className,
      )}
      isDisabled={disabled}
      isIconOnly
      onPress={onPress}
      size={size}
      variant={variantMap[variant]}
    >
      {icon}
    </Button>
  );
}
