import { Href, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { AuthShell } from "@/components/auth/AuthShell";
import {
  HealthOSAuthButton,
  HealthOSAuthCard,
  HealthOSAuthError,
  HealthOSAuthInput,
} from "@/components/healthos/auth";
import { supabase } from "@/lib/supabase";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

export default function ForgotPasswordScreen() {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendReset() {
    setError("");

    if (!email.trim()) {
      setError("Enter your email and we will send reset instructions.");
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
    );
    setLoading(false);

    if (resetError) {
      setError("Reset instructions could not be sent. Please try again.");
      return;
    }

    setSent(true);
  }

  return (
    <AuthShell
      subtitle="Enter your email and we will send reset instructions."
      title="HealthOS"
    >
      <HealthOSAuthCard
        subtitle="For privacy, we will not reveal whether an account exists."
        title="Reset password"
      >
        <View style={styles.stack}>
          <HealthOSAuthInput
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <HealthOSAuthError message={error} />
          {sent ? (
            <Text style={[healthOSTypography.bodySmall, { color: palette.success }]}>
              If an account exists for that email, reset instructions have been sent.
            </Text>
          ) : null}
          <HealthOSAuthButton
            loading={loading}
            onPress={sendReset}
            title="Send reset link"
          />
          <HealthOSAuthButton
            onPress={() => router.replace("/auth/sign-in" as Href)}
            title="Back to sign in"
            variant="secondary"
          />
        </View>
      </HealthOSAuthCard>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: healthOSSpacing.md,
  },
});
