import { StyleSheet, Text, View } from "react-native";

import {
  AppIcon,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import { openEmail, openPhoneCall } from "@/lib/contact-actions";
import type { CaregiverProfile } from "@/types/caregiver";

type CaregiverContactWidgetProps = {
  caregiver: CaregiverProfile;
  onShare?: () => void;
  onStatus?: (message: string) => void;
};

export function CaregiverContactWidget({
  caregiver,
  onShare,
  onStatus,
}: CaregiverContactWidgetProps) {
  async function handleCall() {
    try {
      await openPhoneCall(caregiver.cellNumber);
    } catch (error) {
      onStatus?.(
        error instanceof Error ? error.message : "Unable to start call.",
      );
    }
  }

  async function handleEmail() {
    try {
      await openEmail(
        caregiver.email,
        `Caregiver profile: ${caregiver.firstName} ${caregiver.lastName}`,
      );
    } catch (error) {
      onStatus?.(
        error instanceof Error ? error.message : "Unable to open email.",
      );
    }
  }

  return (
    <WidgetCard
      accentColor={colors.status.success}
      action={<StatusPill label="Contact" tone="success" />}
      subtitle="Call and email use the device contact handlers."
      title="Contact caregiver"
    >
      <View style={styles.contactRows}>
        <View style={styles.contactRow}>
          <AppIcon color={colors.status.success} name="emergency" size={20} />
          <Text style={styles.contactText}>{caregiver.cellNumber}</Text>
        </View>
        <View style={styles.contactRow}>
          <AppIcon
            color={colors.brand.primary}
            name="notifications"
            size={20}
          />
          <Text style={styles.contactText}>{caregiver.email}</Text>
        </View>
        <View style={styles.actions}>
          <QuickActionButton
            icon={
              <AppIcon
                color={colors.status.success}
                name="emergency"
                size={18}
              />
            }
            label="Call"
            onPress={handleCall}
            toneColor={colors.status.success}
          />
          <QuickActionButton
            icon={
              <AppIcon
                color={colors.brand.primary}
                name="notifications"
                size={18}
              />
            }
            label="Email"
            onPress={handleEmail}
            toneColor={colors.brand.primary}
          />
          <QuickActionButton
            icon={<AppIcon color={colors.status.ai} name="sync" size={18} />}
            label="Share card"
            onPress={
              onShare ??
              (() =>
                onStatus?.("Sharing caregiver cards is a placeholder for now."))
            }
            toneColor={colors.status.ai}
          />
        </View>
      </View>
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  contactRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  contactRows: {
    gap: spacing.sm,
  },
  contactText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "800",
  },
});
