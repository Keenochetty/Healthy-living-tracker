import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { HealthOSCard } from "./HealthOSCard";
import type { HealthOSCardVariant } from "./HealthOSCard";
import { HealthOSPill } from "./HealthOSPill";
import { healthOSSpacing } from "@/theme/healthos";

type HealthOSWidgetProps = {
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  onLongPress?: () => void;
  onPress?: () => void;
  removable?: boolean;
  reorderable?: boolean;
  rightAccessory?: ReactNode;
  subtitle?: string;
  testID?: string;
  title: string;
  variant?: HealthOSCardVariant;
  widgetKey: string;
};

export function HealthOSWidget({
  children,
  footer,
  icon,
  onLongPress,
  onPress,
  removable = false,
  reorderable = false,
  rightAccessory,
  subtitle,
  testID,
  title,
  variant = "glass",
  widgetKey,
}: HealthOSWidgetProps) {
  const accessory =
    rightAccessory ??
    (removable || reorderable ? (
      <View style={styles.flags}>
        {reorderable ? <HealthOSPill label="Move" size="sm" variant="glass" /> : null}
        {removable ? <HealthOSPill label="Remove" size="sm" variant="glass" /> : null}
      </View>
    ) : null);

  return (
    <HealthOSCard
      icon={icon}
      onLongPress={onLongPress}
      onPress={onPress}
      rightAccessory={accessory}
      subtitle={subtitle}
      testID={testID ?? `healthos-widget-${widgetKey}`}
      title={title}
      variant={variant}
    >
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: healthOSSpacing.sm,
  },
  flags: {
    alignItems: "flex-end",
    gap: healthOSSpacing.xs,
  },
  footer: {
    marginTop: healthOSSpacing.md,
  },
});
