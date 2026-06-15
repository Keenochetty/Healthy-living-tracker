import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { signUp } from "@/lib/auth";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setErrorMessage(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const data = await signUp({ email, password });

      if (data.session) {
        router.replace("/auth/onboarding");
        return;
      }

      setNotice(
        "Account created. Check your email, then sign in to finish onboarding.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {isSubmitting ? (
        <ActivityIndicator />
      ) : (
        <Button onPress={handleSubmit} title="Create account" />
      )}

      <Link href="/auth/sign-in" style={styles.link}>
        Already have an account?
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24,
  },
  error: {
    color: "#b91c1c",
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  link: {
    color: "#2563eb",
    marginTop: 8,
  },
  notice: {
    color: "#166534",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
});
