import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { ShieldAlert } from "lucide-react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";
import type { HealthOSReminderReviewCandidate } from "@/features/reminders";

type Props = {
  items: HealthOSReminderReviewCandidate[];
  onReview: (item: HealthOSReminderReviewCandidate) => void;
};

export function HealthOSNeedsReviewQueue({ items, onReview }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);

  return (
    <HealthOSCard
      icon={<ShieldAlert color={palette.warning} size={20} />}
      subtitle="AI import and assistant reminders must be reviewed before saving or scheduling."
      title="Needs review"
    >
      <View style={styles.stack}>
        {items.length ? (
          items.map((item) => (
            <HealthOSCard key={item.id} onPress={() => onReview(item)} title={item.title} subtitle={item.reason} variant="compact">
              <HealthOSPill label="Review required" size="sm" variant="warning" />
            </HealthOSCard>
          ))
        ) : (
          <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
            Nothing is waiting for review. AI-created reminder drafts will appear here only after the user chooses to import them.
          </Text>
        )}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.sm,
  },
});
