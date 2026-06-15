import { Href, router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { AuthShell } from "@/components/auth/AuthShell";
import { AppButton, AppCard, AppFormInput } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useAppTheme } from "@/theme/ThemeProvider";

export default function ForgotPasswordScreen() {
  const { theme } = useAppTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function sendReset() {
    if (!email.trim()) {
      setMessage("Enter your account email.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setMessage(
      error
        ? error.message
        : "Password reset instructions were sent if that account exists.",
    );
    setLoading(false);
  }

  return (
    <AuthShell
      subtitle="Enter your account email and we will send a secure reset link."
      title="Reset your password"
    >
      <AppCard style={{ borderColor: theme.border, borderWidth: 1 }}>
        <AppFormInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
        />
        {message ? (
          <Text
            style={{ color: theme.mutedText, lineHeight: 20, marginTop: 12 }}
          >
            {message}
          </Text>
        ) : null}
        <AppButton
          fullWidth
          loading={loading}
          onPress={sendReset}
          style={{ marginTop: 16 }}
          title="Send reset link"
        />
      </AppCard>
      <AppButton
        fullWidth
        onPress={() => router.replace("/auth/sign-in" as Href)}
        title="Back to sign in"
        variant="outline"
      />
    </AuthShell>
  );
}
