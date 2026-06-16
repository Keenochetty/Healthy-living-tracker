import { Pressable, View } from "react-native";
import { twMerge } from "tailwind-merge";

import { AppText } from "@/components/ui-native/AppText";

export type AppSectionHeaderProps = {
  actionLabel?: string;
  className?: string;
  onActionPress?: () => void;
  subtitle?: string;
  title: string;
};

export function AppSectionHeader({
  actionLabel,
  className,
  onActionPress,
  subtitle,
  title,
}: AppSectionHeaderProps) {
  return (
    <View
      className={twMerge(
        "w-full flex-row items-end justify-between gap-4",
        className,
      )}
    >
      <View className="flex-1 gap-1">
        <AppText variant="subtitle">{title}</AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          className="min-h-11 justify-center px-1"
          onPress={onActionPress}
        >
          <AppText className="text-accent" variant="label">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
