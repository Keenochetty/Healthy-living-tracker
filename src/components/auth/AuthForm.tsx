import { Href, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import {
  HealthOSAuthButton,
  HealthOSAuthCard,
  HealthOSAuthError,
  HealthOSAuthInput,
  HealthOSSocialButton,
} from "@/components/healthos/auth";
import { useAuth } from "@/context/AuthContext";
import {
  getHealthOSPalette,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

type AuthFormProps = {
  mode: "login" | "signup";
  onSuccess?: () => void;
};

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const colorMode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(colorMode);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function submit() {
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password, then try again.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result =
        mode === "signup"
          ? await signUp(email, password, displayName)
          : await signIn(email, password);

      if (result.error) {
        setError(
          mode === "signup"
            ? "Could not create your account. Please check your details."
            : "Check your email and password, then try again.",
        );
        return;
      }

      onSuccess?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function socialPending(provider: "Apple" | "Google") {
    setError(`${provider} sign-in is not connected yet. Use email and password for now.`);
  }

  return (
    <HealthOSAuthCard
      subtitle={
        mode === "signup"
          ? "Create a private care space for your health and family setup."
          : "Sign in to sync your profile, settings, and private health setup."
      }
      title={mode === "signup" ? "Create account" : "Welcome back"}
    >
      <View style={styles.stack}>
        {mode === "signup" ? (
          <HealthOSAuthInput
            autoCapitalize="words"
            label="Name"
            onChangeText={setDisplayName}
            placeholder="Your name"
            value={displayName}
          />
        ) : null}
        <HealthOSAuthInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
        />
        <HealthOSAuthInput
          label="Password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          value={password}
        />
        {mode === "signup" ? (
          <HealthOSAuthInput
            label="Confirm password"
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
          />
        ) : null}
        {mode === "login" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/auth/forgot-password" as Href)}
            style={styles.forgot}
          >
            <Text style={[healthOSTypography.buttonLabel, { color: palette.skyBlue }]}>
              Forgot password?
            </Text>
          </Pressable>
        ) : null}
        <HealthOSAuthError message={error} />
        <HealthOSAuthButton
          loading={loading}
          onPress={submit}
          title={mode === "signup" ? "Create account" : "Sign in"}
        />
        <Divider />
        <HealthOSSocialButton
          onPress={() => socialPending("Google")}
          provider="google"
        />
        <HealthOSSocialButton
          disabled
          onPress={() => socialPending("Apple")}
          provider="apple"
        />
      </View>
    </HealthOSAuthCard>
  );
}

function Divider() {
  const colorMode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(colorMode);
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: palette.borderSubtle }]} />
      <Text style={[healthOSTypography.caption, { color: palette.softText }]}>or</Text>
      <View style={[styles.dividerLine, { backgroundColor: palette.borderSubtle }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: healthOSSpacing.sm,
    paddingVertical: healthOSSpacing.xs,
  },
  forgot: {
    alignSelf: "flex-end",
    paddingVertical: healthOSSpacing.xs,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
