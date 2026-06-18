import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { AppIcon } from "@/components/ui/AppIcon";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
} from "@/theme/healthos";
import { useColorScheme } from "react-native";

import { HealthOSHealthMetricTile } from "./HealthOSHealthMetricTile";
import { HealthOSHealthSectionCard } from "./HealthOSHealthSectionCard";
import type { HealthOSHealthSectionMeta } from "./HealthOSHealthTypes";

type RecordsSummary = {
  pinnedRecords?: unknown[];
  recentRecords?: unknown[];
  recentVisits?: unknown[];
  recordsNeedingAttention?: number;
};

type HealthOSRecordsAccordionSectionProps = {
  onLongPress: () => void;
  recordsSummary: RecordsSummary | null;
  section: HealthOSHealthSectionMeta;
};

const RECORD_CATEGORIES = [
  "Prescriptions",
  "Lab reports",
  "Vaccine cards",
  "Doctor notes",
  "Medical aid / insurance",
  "Child documents",
  "Pregnancy documents",
];

export function HealthOSRecordsAccordionSection({
  onLongPress,
  recordsSummary,
  section,
}: HealthOSRecordsAccordionSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const palette = getHealthOSPalette(useColorScheme() === "dark" ? "dark" : "light");
  const recentCount = recordsSummary?.recentRecords?.length ?? 0;
  const attentionCount = recordsSummary?.recordsNeedingAttention ?? 0;

  return (
    <HealthOSHealthSectionCard
      icon={<AppIcon decorative name="records" size={20} variant="private" />}
      onLongPress={onLongPress}
      onPress={() => setExpanded((value) => !value)}
      privacyLabel={expanded ? "Expanded" : "Collapsed"}
      rightAccessory={
        <Text style={[healthOSTypography.cardTitle, { color: palette.softText }]}>
          {expanded ? "⌃" : "⌄"}
        </Text>
      }
      section={section}
      variant="accordion"
    >
      <View style={styles.grid}>
        <HealthOSHealthMetricTile metric={{ label: "Recent", value: `${recentCount}` }} />
        <HealthOSHealthMetricTile
          metric={{
            label: "Needs review",
            status: attentionCount > 0 ? "warning" : "default",
            value: `${attentionCount}`,
          }}
        />
      </View>
      <Text
        accessibilityLabel={`Records accordion ${expanded ? "expanded" : "collapsed"}`}
        style={[healthOSTypography.bodySmall, { color: palette.softText }]}
      >
        Scripts, vaccine cards, reports, and documents.
      </Text>
      {expanded ? (
        <View style={styles.expanded}>
          <View style={styles.categoryGrid}>
            {RECORD_CATEGORIES.map((category) => (
              <HealthOSPill
                key={category}
                label={category}
                onPress={() => router.push("/records")}
                size="sm"
                variant="glass"
              />
            ))}
          </View>
          <View style={styles.actions}>
            <HealthOSPill label="Open records" onPress={() => router.push("/records")} size="sm" variant="realm" />
            <HealthOSPill label="Upload / scan" onPress={() => router.push("/(tabs)/scan")} size="sm" variant="glass" />
            <HealthOSPill label="Emergency packet" onPress={() => router.push("/records")} size="sm" variant="glass" />
          </View>
        </View>
      ) : null}
    </HealthOSHealthSectionCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  expanded: {
    gap: healthOSSpacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
});
