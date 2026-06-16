import { Switch, type SwitchProps } from "heroui-native/switch";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

import { AppText } from "@/components/ui-native/AppText";

export type AppSwitchProps = SwitchProps & {
  className?: string;
  description?: string;
  label?: string;
};

export function AppSwitch({
  className,
  description,
  label,
  ...props
}: AppSwitchProps) {
  if (!label && !description) {
    return <Switch className={twMerge("shrink-0", className)} {...props} />;
  }

  return (
    <View className="w-full flex-row items-center justify-between gap-4">
      <View className="flex-1 gap-1">
        {label ? <AppText variant="label">{label}</AppText> : null}
        {description ? (
          <AppText variant="caption">{description}</AppText>
        ) : null}
      </View>
      <Switch className={twMerge("shrink-0", className)} {...props} />
    </View>
  );
}
