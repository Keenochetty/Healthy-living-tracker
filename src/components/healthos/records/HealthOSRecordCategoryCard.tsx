import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type { HealthOSRecordCategorySummary } from "./HealthOSRecordsTypes";

type Props = {
  category: HealthOSRecordCategorySummary;
  selected: boolean;
  onPress: () => void;
};

export function HealthOSRecordCategoryCard({ category, onPress, selected }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <Pressable
      accessibilityLabel={`${category.label}. ${category.count} records.`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? `${palette.records}20` : palette.glassWhite,
          borderColor: selected ? palette.records : palette.borderSubtle,
        },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.marker, { backgroundColor: `${palette.records}24` }]} />
      <Text style={[healthOSTypography.cardTitle, { color: palette.inkText }]}>{category.label}</Text>
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
        {category.count ? `${category.count} saved` : "No records"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: healthOSSpacing.xs,
    minHeight: 112,
    padding: healthOSSpacing.md,
  },
  marker: {
    borderRadius: 999,
    height: 30,
    width: 30,
  },
  pressed: {
    opacity: 0.75,
  },
});
