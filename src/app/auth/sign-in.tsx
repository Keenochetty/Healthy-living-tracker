import { Href, router } from "expo-router";
import { Pressable, Text } from "react-native";

import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { AppButton } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function SignInScreen() {
  const { theme } = useAppTheme();
  return (
    <AuthShell subtitle="Sync your profile, settings, modules, widgets, theme, country and units." title="Welcome back">
      <AuthForm mode="login" onSuccess={() => router.replace("/" as Href)} />
      <Pressable onPress={() => router.push("/auth/forgot-password" as Href)} style={{ alignItems: "center", padding: 8 }}>
        <Text style={{ color: theme.primary, fontWeight: "800" }}>Forgot password?</Text>
      </Pressable>
      <AppButton fullWidth onPress={() => router.push("/auth/sign-up" as Href)} title="Create an account" variant="outline" />
    </AuthShell>
  );
}
