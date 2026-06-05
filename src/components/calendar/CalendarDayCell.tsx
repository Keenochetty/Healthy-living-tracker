import { Text, View } from "react-native";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { appColors, appRadius, appSpacing, typography } from "@/theme/designSystem";
import type { CalendarVisualIndicator } from "@/types/designSystem";
import { CalendarHalo } from "./CalendarHalo";

type CalendarDayCellProps = {
  day: number;
  indicators?: CalendarVisualIndicator[];
  isSelected?: boolean;
};

export function CalendarDayCell({ day, indicators = [], isSelected }: CalendarDayCellProps) {
  const halos = indicators.filter((indicator) => indicator.type.includes("halo")).slice(0, 2);
  const icons = indicators.filter((indicator) => indicator.icon).slice(0, 2);
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: isSelected ? appColors.primarySoft : appColors.surface,
        borderColor: appColors.border,
        borderRadius: appRadius.lg,
        borderWidth: 1,
        height: 64,
        justifyContent: "center",
        position: "relative",
        width: 48
      }}
    >
      {halos.map((indicator, index) => (
        <CalendarHalo color={indicator.color} key={indicator.id} size={46 - index * 7} type={indicator.type} />
      ))}
      <Text style={[typography.helper, { color: appColors.text }]}>{day}</Text>
      <View style={{ flexDirection: "row", gap: appSpacing.xxs, marginTop: appSpacing.xs }}>
        {icons.map((indicator) => (
          <AppIcon key={indicator.id} name={indicator.icon as AppIconName} size={10} variant="muted" />
        ))}
        {indicators.length > 2 ? <Text style={[typography.caption, { color: appColors.textMuted }]}>+{indicators.length - 2}</Text> : null}
      </View>
    </View>
  );
}
