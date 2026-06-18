import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSChecklistSection } from "./HealthOSPregnancyTypes";

type Props = {
  checklist: HealthOSChecklistSection;
  onToggle: (id: string) => void;
};

export function ChecklistCard({ checklist, onToggle }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const completed = checklist.items.filter((item) => item.completed).length;

  return (
    <HealthOSCard subtitle={checklist.description} title={checklist.title} variant="elevated">
      <View style={styles.stack}>
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          {completed}/{checklist.items.length} complete · {checklist.persisted ? "Saved" : "UI foundation only"}
        </Text>
        <View style={styles.items}>
          {checklist.items.map((item) => (
            <HealthOSPill
              key={item.id}
              label={`${item.completed ? "✓ " : ""}${item.label}`}
              onPress={() => onToggle(item.id)}
              selected={item.completed}
              variant="glass"
            />
          ))}
        </View>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
