import { ScrollView, StyleSheet, TextInput, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  type HealthOSColorMode,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import type { HealthOSRecordCategory } from "./HealthOSRecordsTypes";
import { RecordsAction, recordsSharedStyles } from "./HealthOSRecordsShared";

const FILTERS: Array<{ key: HealthOSRecordCategory | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "prescription", label: "Scripts" },
  { key: "medicationLabel", label: "Medication" },
  { key: "labReport", label: "Lab reports" },
  { key: "vaccineCard", label: "Vaccine cards" },
  { key: "doctorNote", label: "Doctor notes" },
  { key: "pregnancy", label: "Pregnancy" },
  { key: "babyChild", label: "Baby/Child" },
  { key: "medicalAid", label: "Medical aid" },
  { key: "other", label: "Needs review" },
];

type Props = {
  activeFilters: HealthOSRecordCategory[];
  onClear: () => void;
  onQueryChange: (value: string) => void;
  onToggleFilter: (category: HealthOSRecordCategory) => void;
  query: string;
};

export function HealthOSRecordsSearchFilter({
  activeFilters,
  onClear,
  onQueryChange,
  onToggleFilter,
  query,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <HealthOSCard title="Find a record" subtitle="Search and filter local records.">
      <View style={recordsSharedStyles.row}>
        <View style={[styles.search, { borderColor: palette.borderSubtle }]}>
          <TextInput
            accessibilityLabel="Search records"
            onChangeText={onQueryChange}
            placeholder="Search records"
            placeholderTextColor={palette.softText}
            style={[styles.input, { color: palette.inkText }]}
            value={query}
          />
          {query ? <RecordsAction label="Clear" onPress={() => onQueryChange("")} /> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {FILTERS.map((filter) => {
              if (filter.key === "all") {
                return (
                  <HealthOSPill
                    key={filter.key}
                    label={filter.label}
                    onPress={onClear}
                    selected={!activeFilters.length}
                    size="sm"
                  />
                );
              }
              const key = filter.key;
              return (
                <HealthOSPill
                  key={key}
                  label={filter.label}
                  onPress={() => onToggleFilter(key)}
                  selected={activeFilters.includes(key)}
                  size="sm"
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.md,
  },
  input: {
    flex: 1,
    minHeight: 48,
  },
  search: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    minHeight: 52,
    paddingHorizontal: healthOSSpacing.md,
  },
});
