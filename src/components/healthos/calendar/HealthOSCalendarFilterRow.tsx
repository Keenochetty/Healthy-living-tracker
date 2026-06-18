import { ScrollView, StyleSheet, useColorScheme } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing } from "@/theme/healthos";
import type { HealthOSCalendarFilter } from "./HealthOSCalendarTypes";

const filters: Array<{ key: HealthOSCalendarFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "health", label: "Health" },
  { key: "medication", label: "Medication" },
  { key: "family", label: "Family" },
  { key: "fitness", label: "Fitness" },
  { key: "nutrition", label: "Food" },
  { key: "babyChild", label: "Baby/Child" },
  { key: "women", label: "Women" },
  { key: "pregnancy", label: "Pregnancy" },
  { key: "work", label: "Work" },
  { key: "private", label: "Private" },
];

type HealthOSCalendarFilterRowProps = {
  activeFilters: HealthOSCalendarFilter[];
  onClearFilters: () => void;
  onToggleFilter: (filter: HealthOSCalendarFilter) => void;
};

export function HealthOSCalendarFilterRow({
  activeFilters,
  onClearFilters,
  onToggleFilter,
}: HealthOSCalendarFilterRowProps) {
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");

  return (
    <ScrollView
      accessibilityLabel="Calendar filters"
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {filters.map((filter) => {
        const selected =
          filter.key === "all" ? !activeFilters.length : activeFilters.includes(filter.key);
        return (
          <HealthOSPill
            key={filter.key}
            label={selected ? `${filter.label} selected` : filter.label}
            onPress={() =>
              filter.key === "all" ? onClearFilters() : onToggleFilter(filter.key)
            }
            realmColor={filter.key === "private" ? palette.medication : undefined}
            selected={selected}
            variant={filter.key === "private" ? "realm" : "glass"}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
});
