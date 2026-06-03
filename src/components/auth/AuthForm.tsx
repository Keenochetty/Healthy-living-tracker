import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useAuth } from "@/context/AuthContext";

type AuthFormProps = {
  mode: "login" | "signup";
  onSuccess?: () => void;
};

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
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
          : "Could not sign in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
          {mode === "signup" ? "Create your private care space." : "Sign in"}
        </Text>

        {mode === "signup" ? (
          <TextInput
            autoCapitalize="words"
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor="#94a3b8"
            style={inputStyle}
            value={displayName}
          />
        ) : null}

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={inputStyle}
          value={password}
        />

        {mode === "signup" ? (
          <TextInput
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={inputStyle}
            value={confirmPassword}
          />
        ) : null}

        {error ? <Text style={{ color: "#dc2626", lineHeight: 20 }}>{error}</Text> : null}

        <TouchableOpacity activeOpacity={0.85} onPress={submit} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            {loading ? "Working..." : mode === "signup" ? "Sign up" : "Log in"}
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#7c3aed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
