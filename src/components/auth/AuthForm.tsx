import { useState } from "react";
import { Text, View } from "react-native";

import { AppButton, AppCard, AppFormInput } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/theme/ThemeProvider";

type AuthFormProps = {
  mode: "login" | "signup";
  onSuccess?: () => void;
};

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const { theme } = useAppTheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function submit() {
    setError("");

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
        setError(result.error);
        return;
      }

      if (mode === "signup") {
        setError("Check your email if confirmation is enabled.");
      }

      onSuccess?.();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not sign in. Please check your details.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppCard radius="xl" style={{ borderColor: theme.border, borderWidth: 1 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ color: theme.text, fontSize: 22, fontWeight: "900" }}>
          {mode === "signup" ? "Create your private care space." : "Sign in"}
        </Text>

        {mode === "signup" ? (
          <AppFormInput
            autoCapitalize="words"
            label="Display name"
            onChangeText={setDisplayName}
            placeholder="Display name"
            value={displayName}
          />
        ) : null}

        <AppFormInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="Email"
          value={email}
        />
        <AppFormInput
          label="Password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          value={password}
        />

        {mode === "signup" ? (
          <AppFormInput
            label="Confirm password"
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
          />
        ) : null}

        {error ? (
          <Text style={{ color: theme.danger, lineHeight: 20 }}>{error}</Text>
        ) : null}

        <AppButton
          fullWidth
          loading={loading}
          onPress={submit}
          size="lg"
          title={mode === "signup" ? "Create account" : "Sign in"}
        />
      </View>
    </AppCard>
  );
}
