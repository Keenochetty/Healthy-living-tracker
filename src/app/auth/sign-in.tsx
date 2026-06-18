import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, useColorScheme } from "react-native";

import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export default function SignInScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <AuthShell
      subtitle="Your private family health companion"
      title="HealthOS"
    >
      <AuthForm mode="login" onSuccess={() => router.replace("/" as Href)} />
      <Pressable
        onPress={() => router.push("/auth/sign-up" as Href)}
        style={styles.switchLink}
      >
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          New to HealthOS?{" "}
          <Text style={{ color: palette.skyBlue, fontWeight: "700" }}>
            Create account
          </Text>
        </Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  switchLink: {
    alignItems: "center",
    marginTop: healthOSSpacing.md,
    padding: healthOSSpacing.sm,
  },
});
