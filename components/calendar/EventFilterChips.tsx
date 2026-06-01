import { StyleSheet, View } from "react-native";

import { QuickActionButton } from "@/components/ui";
import { calendarFilterLabels, calendarFilters } from "@/constants/calendar";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { CalendarFilter, CalendarFilterKey } from "@/types/calendar";

type EventFilterChipsProps = {
  filter: CalendarFilter;
  onChange: (filter: CalendarFilter) => void;
};

export function EventFilterChips({ filter, onChange }: EventFilterChipsProps) {
  function selectFilter(key: CalendarFilterKey) {
    onChange({ key });
  }

  return (
    <View style={styles.container}>
      {calendarFilters.map((key) => (
        <QuickActionButton
          key={key}
          label={calendarFilterLabels[key]}
          onPress={() => selectFilter(key)}
          toneColor={filter.key === key ? colors.brand.primary : colors.text.muted}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
