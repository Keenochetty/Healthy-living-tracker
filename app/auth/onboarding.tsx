import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  completeOnboarding,
  type FamilySetupChoice,
  type PrimaryRole,
} from "@/lib/auth";

const roleOptions: Array<{ label: string; value: PrimaryRole }> = [
  { label: "Parent / Guardian", value: "parent_guardian" },
  { label: "Caregiver", value: "caregiver" },
  { label: "Woman", value: "woman" },
  { label: "Man", value: "man" },
  { label: "Child", value: "child" },
  { label: "Baby", value: "baby" },
  { label: "Elderly dependent", value: "elderly_dependent" },
];

export default function OnboardingScreen() {
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [primaryRole, setPrimaryRole] =
    useState<PrimaryRole>("parent_guardian");
  const [familySetup, setFamilySetup] = useState<FamilySetupChoice>("create");
  const [familyName, setFamilyName] = useState("");
  const [enableCaregiverWorkProfile, setEnableCaregiverWorkProfile] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await completeOnboarding({
        displayName,
        enableCaregiverWorkProfile,
        familyName,
        familySetup,
        fullName,
        primaryRole,
      });

      router.replace("/tabs/home");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete onboarding.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding</Text>

      <TextInput
        onChangeText={setFullName}
        placeholder="Full name"
        style={styles.input}
        value={fullName}
      />
      <TextInput
        onChangeText={setDisplayName}
        placeholder="Display name"
        style={styles.input}
        value={displayName}
      />

      <Text style={styles.label}>Primary role</Text>
      <View style={styles.optionGroup}>
        {roleOptions.map((role) => (
          <Button
            key={role.value}
            onPress={() => setPrimaryRole(role.value)}
            title={`${primaryRole === role.value ? "Selected: " : ""}${role.label}`}
          />
        ))}
      </View>

      <Text style={styles.label}>Family setup</Text>
      <View style={styles.row}>
        <Button
          onPress={() => setFamilySetup("create")}
          title={
            familySetup === "create"
              ? "Selected: Create family"
              : "Create family"
          }
        />
        <Button
          onPress={() => setFamilySetup("join")}
          title={
            familySetup === "join" ? "Selected: Join family" : "Join family"
          }
        />
      </View>

      {familySetup === "create" ? (
        <TextInput
          onChangeText={setFamilyName}
          placeholder="Family name"
          style={styles.input}
          value={familyName}
        />
      ) : (
        <Text style={styles.helpText}>
          Joining a family can be completed after onboarding with an invite.
        </Text>
      )}

      {primaryRole === "caregiver" ? (
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable caregiver work profile</Text>
          <Switch
            onValueChange={setEnableCaregiverWorkProfile}
            value={enableCaregiverWorkProfile}
          />
        </View>
      ) : null}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {isSubmitting ? (
        <ActivityIndicator />
      ) : (
        <Button onPress={handleSubmit} title="Finish onboarding" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 24,
    paddingTop: 64,
  },
  error: {
    color: "#b91c1c",
  },
  helpText: {
    color: "#475569",
  },
  input: {
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
  },
  optionGroup: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  switchLabel: {
    flex: 1,
  },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
});
