import { ScrollView } from "react-native";

import { HealthQuickWidget } from "./HealthQuickWidget";
import type { AppIconName } from "@/constants/appIcons";
import { appSpacing } from "@/theme/designSystem";
import type { PrivacyBadgeType } from "@/types/designSystem";

export type HealthMainBarItem = {
  color: string;
  icon: AppIconName;
  key: string;
  label: string;
  onPress?: () => void;
  privacyBadge?: PrivacyBadgeType;
  value: string;
};

type HealthMainBarProps = {
  items: HealthMainBarItem[];
};

export function HealthMainBar({ items }: HealthMainBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -4 }}
      contentContainerStyle={{ gap: appSpacing.md, paddingHorizontal: 4 }}
    >
      {items.map((item) => (
        <HealthQuickWidget
          color={item.color}
          icon={item.icon}
          key={item.key}
          label={item.label}
          onPress={item.onPress}
          privacyBadge={item.privacyBadge}
          value={item.value}
        />
      ))}
    </ScrollView>
  );
}
