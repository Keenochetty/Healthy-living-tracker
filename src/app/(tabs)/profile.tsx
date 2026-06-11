import { Href, router, useFocusEffect } from "expo-router";
import { Palette, RotateCcw, Settings2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AuthStatusCard } from "@/components/auth/AuthStatusCard";
import { ModulePicker } from "@/components/modules/ModulePicker";
import { UnitPreviewCard } from "@/components/onboarding/UnitPreviewCard";
import { AppButton, AppCard, AppSection } from "@/components/ui";
import { APP_MODULES } from "@/constants/modules";
import { getUserTheme } from "@/constants/themes";
import { useAuth } from "@/context/AuthContext";
import {
  getUserPreferences,
  resetOnboarding,
  updateUserPreferences
} from "@/lib/userPreferences";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { UserPreferences } from "@/types/profile";

export default function ProfileScreen() {
  const { isAuthenticated } = useAuth();
  const { theme } = useAppTheme();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const selectedTheme = getUserTheme(preferences?.themeKey ?? "soft_lavender");
  const enabledModuleNames = APP_MODULES.filter((module) =>
    preferences?.enabledModules.includes(module.key)
  ).map((module) => module.name);

  const loadPreferences = useCallback(async () => {
    setPreferences(await getUserPreferences());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPreferences();
    }, [loadPreferences])
  );

  async function handleResetOnboarding() {
    await resetOnboarding();
    router.replace("/onboarding" as Href);
  }

  return (
    <AppMainLayout subtitle="Personal setup" title="Profile">
      <AppCard variant="primary">
        <Text style={{ color: "#ffffff", fontWeight: "700" }}>
          Your app, your way
        </Text>
        <Text
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: "900",
            marginTop: 8
          }}
        >
          Start simple. Add more when life changes.
        </Text>
        <Text style={{ color: "#ffffff", lineHeight: 21, marginTop: 8 }}>
          This app works for one person, couples, close friends, parents, children,
          elders and caregivers.
        </Text>
      </AppCard>

      <AuthStatusCard onSynced={loadPreferences} />

      {preferences ? (
        <>
          <AppCard>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              Profile summary
            </Text>
            <SummaryRow label="Name" value={preferences.displayName || "Not set"} />
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

          <View style={{ flexDirection: "row", gap: 10 }}>
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

          <AppButton
            fullWidth
            iconLeft={<Settings2 color={theme.primary} size={18} />}
            onPress={() => router.push("/settings/profile-contact" as Href)}
            title="Edit profile and contacts"
            variant="secondary"
          />

          <AppButton
            fullWidth
            iconLeft={<Settings2 color={theme.primary} size={18} />}
            onPress={() => router.push("/settings/privacy-center" as Href)}
            title="Privacy Center"
            variant="secondary"
          />

          <AppButton
            fullWidth
            iconLeft={<Settings2 color={theme.primary} size={18} />}
            onPress={() => router.push("/settings" as Href)}
            title="App settings"
            variant="secondary"
          />

          <AppSection title="Unit preferences">
            <UnitPreviewCard units={preferences.units} />
          </AppSection>

          <AppCard>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              Enabled modules
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 21, marginTop: 6 }}>
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
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
      }}
    >
      <Text style={{ color: "#64748b" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{value}</Text>
    </View>
  );
}
