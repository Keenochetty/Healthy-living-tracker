import type { ReactNode } from "react";
import {
  Button,
  type ButtonSize,
  type ButtonVariant,
} from "heroui-native/button";
import { ActivityIndicator, View, type PressableProps } from "react-native";
import { twMerge } from "tailwind-merge";

export type AppButtonProps = Omit<PressableProps, "children" | "disabled"> & {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  loading?: boolean;
  rightIcon?: ReactNode;
  size?: ButtonSize;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "soft";
};

const variantMap: Record<
  NonNullable<AppButtonProps["variant"]>,
  ButtonVariant
> = {
  primary: "primary",
  secondary: "outline",
  ghost: "ghost",
  danger: "danger",
  soft: "secondary",
};

export function AppButton({
  children,
  className,
  disabled = false,
  fullWidth = false,
  leftIcon,
  loading = false,
  rightIcon,
  size = "md",
  variant = "primary",
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      className={twMerge(
        "min-h-12 rounded-2xl",
        size === "sm" && "min-h-11",
        size === "lg" && "min-h-14",
        fullWidth && "w-full",
        className,
      )}
      isDisabled={isDisabled}
      size={size}
      variant={variantMap[variant]}
      {...props}
    >
      <View className="flex-row items-center justify-center gap-2">
        {loading ? <ActivityIndicator size="small" /> : leftIcon}
        <Button.Label>{children}</Button.Label>
        {!loading ? rightIcon : null}
      </View>
    </Button>
  );
}
