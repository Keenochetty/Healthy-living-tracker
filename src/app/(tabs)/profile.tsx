import { Href, router, useFocusEffect } from "expo-router";
import {
  ChevronRight,
  Palette,
  RotateCcw,
  Settings2,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AuthStatusCard } from "@/components/auth/AuthStatusCard";
import { ModulePicker } from "@/components/modules/ModulePicker";
import { UnitPreviewCard } from "@/components/onboarding/UnitPreviewCard";
import {
  AppButton,
  AppCard,
  AppChip,
  AppIcon,
  AppSection,
} from "@/components/ui";
import { APP_MODULES } from "@/constants/modules";
import { getUserTheme } from "@/constants/themes";
import { useAuth } from "@/context/AuthContext";
import {
  getUserPreferences,
  resetOnboarding,
  updateUserPreferences,
} from "@/lib/userPreferences";
import { useAppTheme } from "@/theme/ThemeProvider";
import { fontSizes, spacing } from "@/theme/tokens";
import type { UserPreferences } from "@/types/profile";

export default function ProfileScreen() {
  const { isAuthenticated } = useAuth();
  const { theme } = useAppTheme();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const selectedTheme = getUserTheme(preferences?.themeKey ?? "soft_lavender");
  const enabledModuleNames = APP_MODULES.filter((module) =>
    preferences?.enabledModules.includes(module.key),
  ).map((module) => module.name);

  const loadPreferences = useCallback(async () => {
    setPreferences(await getUserPreferences());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [loadPreferences]),
  );

  async function handleResetOnboarding() {
    await resetOnboarding();
    router.replace("/onboarding" as Href);
  }

  return (
    <AppMainLayout subtitle="Identity and preferences" title="Profile">
      <AppCard
        style={[styles.hero, { borderColor: theme.border }]}
        variant="soft"
      >
        <View style={styles.heroHeading}>
          <AppIcon container name="profile" size={24} variant="primary" />
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              YOUR HEALTHOS
            </Text>
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              {preferences?.displayName || "Your profile"}
            </Text>
          </View>
          <AppChip
            label={isAuthenticated ? "Synced" : "Local"}
            variant={isAuthenticated ? "success" : "muted"}
          />
        </View>
        <Text style={[styles.heroDescription, { color: theme.mutedText }]}>
          Manage the modules, units, privacy, and account settings that shape
          your daily experience.
        </Text>
      </AppCard>

      <AuthStatusCard onSynced={loadPreferences} />

      {preferences ? (
        <>
          <AppCard>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Profile summary
            </Text>
            <SummaryRow
              label="Name"
              value={preferences.displayName || "Not set"}
            />
            <SummaryRow label="Country" value={preferences.country} />
            <SummaryRow label="Currency" value={preferences.currency} />
            <SummaryRow label="Timezone" value={preferences.timezone} />
            <SummaryRow label="Theme" value={selectedTheme.name} />
            <SummaryRow
              label="Onboarding"
              value={preferences.onboardingComplete ? "Complete" : "Incomplete"}
            />
            <SummaryRow
              label="Account"
              value={isAuthenticated ? "Signed in" : "Local mode"}
            />
          </AppCard>

          <AppSection
            subtitle="Keep setup changes separate from your health data."
            title="Personalize"
          >
            <View style={styles.actionGrid}>
              <AppButton
                fullWidth
                iconLeft={<Settings2 color="#ffffff" size={18} />}
                onPress={() => router.push("/onboarding/modules" as Href)}
                title="Edit modules"
              />
              <AppButton
                fullWidth
                iconLeft={<Palette color={theme.primary} size={18} />}
                onPress={() => router.push("/onboarding/theme" as Href)}
                title="Change theme"
                variant="secondary"
              />
            </View>
            <AppButton
              fullWidth
              iconLeft={<Settings2 color={theme.primary} size={18} />}
              onPress={() => router.push("/onboarding/units" as Href)}
              title="Change units"
              variant="secondary"
            />
          </AppSection>

          <AppSection
            subtitle="Account, privacy, and app-wide controls."
            title="Control panel"
          >
            <ControlRow
              description="Name, photo, email, and contact details"
              icon="profile"
              onPress={() => router.push("/settings/profile-contact" as Href)}
              title="Profile and contacts"
            />
            <ControlRow
              description="Consent and sensitive health areas"
              icon="privacy"
              onPress={() => router.push("/settings/privacy-center" as Href)}
              title="Privacy center"
            />
            <ControlRow
              description="Notifications, permissions, security, and account"
              icon="settings"
              onPress={() => router.push("/settings" as Href)}
              title="App settings"
            />
          </AppSection>

          <AppSection title="Unit preferences">
            <UnitPreviewCard units={preferences.units} />
          </AppSection>

          <AppCard>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Enabled modules
            </Text>
            <Text
              style={[
                styles.moduleSummary,
                { color: theme.mutedText },
              ]}
            >
              {enabledModuleNames.join(", ")}
            </Text>
          </AppCard>

          <ModulePicker
            onChange={(enabledModules) =>
              updateUserPreferences({ enabledModules }).then(setPreferences)
            }
          />

          <AppButton
            iconLeft={<RotateCcw color="#ffffff" size={18} />}
            onPress={handleResetOnboarding}
            title="Reset onboarding for testing"
            variant="danger"
          />
        </>
      ) : null}
    </AppMainLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.mutedText }}>{label}</Text>
      <Text style={[styles.summaryValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function ControlRow({
  description,
  icon,
  onPress,
  title,
}: {
  description: string;
  icon: "privacy" | "profile" | "settings";
  onPress: () => void;
  title: string;
}) {
  const { theme } = useAppTheme();

  return (
    <AppCard onPress={onPress} padding="sm" radius="lg">
      <View style={styles.controlRow}>
        <AppIcon container name={icon} size={20} variant="primary" />
        <View style={styles.controlCopy}>
          <Text style={[styles.controlTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.controlDescription, { color: theme.mutedText }]}>
            {description}
          </Text>
        </View>
        <ChevronRight color={theme.mutedText} size={18} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  actionGrid: { flexDirection: "row", gap: spacing.sm },
  controlCopy: { flex: 1, gap: spacing.xs },
  controlDescription: { fontSize: fontSizes.xs, lineHeight: 16 },
  controlRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  controlTitle: { fontSize: fontSizes.sm, fontWeight: "900" },
  eyebrow: { fontSize: fontSizes.xs, fontWeight: "900", letterSpacing: 1.2 },
  hero: { borderWidth: 1, gap: spacing.md },
  heroCopy: { flex: 1, gap: spacing.xs },
  heroDescription: { lineHeight: 20 },
  heroHeading: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  heroTitle: { fontSize: fontSizes.xl, fontWeight: "900" },
  moduleSummary: { lineHeight: 21, marginTop: spacing.sm },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: "900" },
  summaryRow: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 38,
  },
  summaryValue: {
    flexShrink: 1,
    fontWeight: "900",
    maxWidth: "62%",
    textAlign: "right",
  },
});
