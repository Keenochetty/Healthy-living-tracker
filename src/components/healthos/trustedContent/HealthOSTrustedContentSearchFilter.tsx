import { ScrollView, StyleSheet, TextInput, useColorScheme, View } from "react-native";
import { Search, X } from "lucide-react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  HEALTHOS_TRUSTED_CONTENT_FILTERS,
  type HealthOSTrustedContentFilterKey,
} from "@/features/trustedContent";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSSpacing,
  type HealthOSColorMode,
} from "@/theme/healthos";

type Props = {
  activeFilters: HealthOSTrustedContentFilterKey[];
  onClear: () => void;
  onQueryChange: (query: string) => void;
  onToggleFilter: (filter: HealthOSTrustedContentFilterKey) => void;
  query: string;
};

export function HealthOSTrustedContentSearchFilter({
  activeFilters,
  onClear,
  onQueryChange,
  onToggleFilter,
  query,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);

  return (
    <View style={styles.stack}>
      <View style={[styles.search, surfaces.glassPill]}>
        <Search color={palette.softText} size={18} />
        <TextInput
          accessibilityLabel="Search articles, guides, and tips"
          onChangeText={onQueryChange}
          placeholder="Search articles, guides, and tips"
          placeholderTextColor={palette.softText}
          style={[styles.input, { color: palette.inkText }]}
          value={query}
        />
        {query ? (
          <HealthOSPill
            icon={<X size={12} />}
            label="Clear"
            onPress={onClear}
            size="sm"
            variant="glass"
          />
        ) : null}
      </View>
      <ScrollView contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false}>
        {HEALTHOS_TRUSTED_CONTENT_FILTERS.map((filter) => (
          <HealthOSPill
            key={filter.key}
            label={filter.label}
            onPress={() => onToggleFilter(filter.key as HealthOSTrustedContentFilterKey)}
            selected={activeFilters.includes(filter.key as HealthOSTrustedContentFilterKey)}
            size="sm"
            variant="glass"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: healthOSSpacing.sm,
    paddingRight: healthOSSpacing.lg,
  },
  input: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 0,
  },
  search: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
