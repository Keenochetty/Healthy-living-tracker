import { Input, type InputProps } from "heroui-native/input";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

import { AppText } from "@/components/ui-native/AppText";

export type AppInputProps = InputProps & {
  className?: string;
  containerClassName?: string;
  error?: string;
  errorText?: string;
  helperText?: string;
  label?: string;
};

export function AppInput({
  className,
  containerClassName,
  error,
  errorText,
  helperText,
  isInvalid,
  label,
  ...props
}: AppInputProps) {
  const resolvedError = error ?? errorText;

  return (
    <View className={twMerge("w-full gap-2", containerClassName)}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <Input
        className={twMerge("min-h-14 rounded-2xl px-4", className)}
        isInvalid={isInvalid ?? Boolean(resolvedError)}
        {...props}
      />
      {resolvedError ? (
        <AppText variant="danger">{resolvedError}</AppText>
      ) : helperText ? (
        <AppText variant="caption">{helperText}</AppText>
      ) : null}
    </View>
  );
}
