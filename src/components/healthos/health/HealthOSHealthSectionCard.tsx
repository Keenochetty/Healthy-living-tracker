import type { ReactNode } from "react";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { HealthOSWidget } from "@/components/healthos/HealthOSWidget";
import type { HealthOSCardVariant } from "@/components/healthos/HealthOSCard";

import type { HealthOSHealthSectionMeta } from "./HealthOSHealthTypes";

type HealthOSHealthSectionCardProps = {
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  onLongPress?: () => void;
  onPress?: () => void;
  privacyLabel?: string;
  rightAccessory?: ReactNode;
  section: HealthOSHealthSectionMeta;
  testID?: string;
  variant?: HealthOSCardVariant;
};

export function HealthOSHealthSectionCard({
  children,
  footer,
  icon,
  onLongPress,
  onPress,
  privacyLabel,
  rightAccessory,
  section,
  testID,
  variant = "elevated",
}: HealthOSHealthSectionCardProps) {
  return (
    <HealthOSWidget
      footer={footer}
      icon={icon}
      onLongPress={onLongPress}
      onPress={onPress}
      removable={section.removable}
      reorderable
      rightAccessory={
        rightAccessory ??
        (privacyLabel ? (
          <HealthOSPill label={privacyLabel} size="sm" variant="glass" />
        ) : undefined)
      }
      subtitle={section.subtitle}
      testID={testID}
      title={section.title}
      variant={variant}
      widgetKey={section.key}
    >
      {children}
    </HealthOSWidget>
  );
}

