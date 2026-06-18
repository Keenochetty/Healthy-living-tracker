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

export default function SignUpScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  return (
    <AuthShell
      subtitle="Plan, track, and care for your family in one calm place"
      title="HealthOS"
    >
      <AuthForm mode="signup" onSuccess={() => router.replace("/" as Href)} />
      <Pressable
        onPress={() => router.push("/auth/sign-in" as Href)}
        style={styles.switchLink}
      >
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Already have an account?{" "}
          <Text style={{ color: palette.skyBlue, fontWeight: "700" }}>
            Sign in
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
