import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { hasCompletedOnboarding, signIn } from "@/lib/auth";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      const onboardingComplete = await hasCompletedOnboarding();

      router.replace(onboardingComplete ? "/tabs/home" : "/auth/onboarding");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

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
      {isSubmitting ? <ActivityIndicator /> : <Button onPress={handleSubmit} title="Sign in" />}

      <Link href="/auth/sign-up" style={styles.link}>
        Create an account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24
  },
  error: {
    color: "#b91c1c"
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  link: {
    color: "#2563eb",
    marginTop: 8
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8
  }
});
