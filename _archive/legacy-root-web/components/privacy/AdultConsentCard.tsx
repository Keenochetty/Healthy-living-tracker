import { StyleSheet, Text, View } from "react-native";

import {
  AppIcon,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type AdultConsentCardProps = {
  consentRequired?: boolean;
  onRequestConsent?: () => void;
};

export function AdultConsentCard({
  consentRequired = true,
  onRequestConsent,
}: AdultConsentCardProps) {
  return (
    <WidgetCard
      accentColor={colors.status.warning}
      action={
        <StatusPill
          label={consentRequired ? "Consent required" : "Consent not required"}
          tone={consentRequired ? "warning" : "success"}
        />
      }
      subtitle="Admins can manage the circle, but adult private health data stays controlled by the adult member."
      title="Adult consent"
    >
      <View style={styles.body}>
        <View style={styles.iconShell}>
          <AppIcon color={colors.status.warning} name="privacy" size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Private health access is opt-in</Text>
          <Text style={styles.text}>
            Adult members must grant access before health summaries, medication,
            or documents are shared.
          </Text>
        </View>
      </View>
      <QuickActionButton
        label="Request consent placeholder"
        onPress={onRequestConsent ?? (() => undefined)}
        toneColor={colors.status.warning}
      />
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.status.warningSoft,
    borderRadius: 16,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  text: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "900",
  },
});
