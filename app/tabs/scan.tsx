import { StyleSheet, Text, View } from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

const scanOptions = [
  {
    description: "Capture meals and nutrition labels for assisted logging.",
    label: "Food",
    tone: colors.status.success,
  },
  {
    description: "Capture medication packaging and prescription details.",
    label: "Medication",
    tone: colors.status.warning,
  },
  {
    description: "Capture health documents and records for review.",
    label: "Records",
    tone: colors.status.ai,
  },
] as const;

export default function ScanScreen() {
  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={<StatusPill label="AI assisted" tone="ai" />}
          eyebrow="Quick capture"
          subtitle="Capture health information and review it before anything is saved."
          title="Scan"
        />

        <WidgetCard
          accentColor={colors.brand.primary}
          subtitle="Choose what you want to capture. Camera and document permissions are requested only when needed."
          title="Start a scan"
        >
          <View style={styles.list}>
            {scanOptions.map((option) => (
              <View key={option.label} style={styles.option}>
                <View
                  style={[
                    styles.iconShell,
                    { backgroundColor: `${option.tone}20` },
                  ]}
                >
                  <AppIcon
                    color={option.tone}
                    name="camera"
                    size={24}
                    variant="filled"
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.label}>{option.label}</Text>
                  <Text style={styles.description}>{option.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  description: {
    color: colors.text.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  iconShell: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  label: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900",
  },
  list: {
    gap: spacing.md,
  },
  option: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 68,
    padding: spacing.md,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
});
