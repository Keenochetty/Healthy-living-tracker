import { useState } from "react";
import { StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, healthOSBorderWidth, healthOSRadius, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSChildSetupDraft } from "./HealthOSBabyChildTypes";

type Props = {
  onConnectPregnancy: (draft: HealthOSChildSetupDraft) => Promise<string>;
  onCreateProfile: (draft: HealthOSChildSetupDraft) => Promise<string>;
  onLearnPrivacy: () => void;
};

export function HealthOSBabyChildSetupCard({
  onConnectPregnancy,
  onCreateProfile,
  onLearnPrivacy,
}: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [message, setMessage] = useState("");
  const draft = { dateOfBirth, displayName };

  return (
    <HealthOSCard
      subtitle="Track feeding, sleep, vaccines, growth, milestones, and care notes."
      title="Create a baby or child profile"
      variant="elevated"
    >
      <View style={styles.stack}>
        <TextInput
          accessibilityLabel="Baby or child name"
          onChangeText={setDisplayName}
          placeholder="Name or nickname"
          placeholderTextColor={palette.softText}
          style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]}
          value={displayName}
        />
        <TextInput
          accessibilityLabel="Date of birth"
          onChangeText={setDateOfBirth}
          placeholder="Date of birth YYYY-MM-DD optional"
          placeholderTextColor={palette.softText}
          style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]}
          value={dateOfBirth}
        />
        <View style={styles.pills}>
          <HealthOSPill label="Create profile" onPress={() => void onCreateProfile(draft).then(setMessage)} variant="ai" />
          <HealthOSPill label="Connect from pregnancy" onPress={() => void onConnectPregnancy(draft).then(setMessage)} variant="glass" />
          <HealthOSPill label="Learn privacy" onPress={onLearnPrivacy} variant="glass" />
        </View>
        {message ? <Text style={[healthOSTypography.caption, { color: palette.success }]}>{message}</Text> : null}
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: healthOSRadius.lg,
    borderWidth: healthOSBorderWidth.thin,
    minHeight: 48,
    paddingHorizontal: healthOSSpacing.md,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
