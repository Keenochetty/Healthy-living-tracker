import { Href, router } from "expo-router";
import { Text } from "react-native";

import { AuthShell } from "@/components/auth/AuthShell";
import { AppButton, AppCard } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function AuthLandingScreen() {
  const { setLocalMode } = useAuth();
  const { theme } = useAppTheme();

  async function continueLocalMode() {
    await setLocalMode(true);
    router.replace("/" as Href);
  }

  return (
    <AuthShell subtitle="Sign in to keep your health and care settings synced, or continue privately on this device." title="Welcome">
      <AppCard variant="soft" style={{ borderColor: theme.border, borderWidth: 1 }}>
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: "900" }}>
          Local testing mode
        </Text>
        <Text style={{ color: theme.mutedText, lineHeight: 21, marginTop: 6 }}>
          Local mode is for testing. Your data will stay on this device.
        </Text>
      </AppCard>

      <AppButton fullWidth onPress={() => router.push("/auth/sign-in" as Href)} size="lg" title="Sign in" />
      <AppButton fullWidth onPress={() => router.push("/auth/sign-up" as Href)} title="Create account" variant="outline" />
      <AppButton fullWidth onPress={continueLocalMode} title="Continue local/testing mode" variant="ghost" />
    </AuthShell>
  );
}
