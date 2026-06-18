import { useState } from "react";
import { StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type {
  HealthOSBabyGenderOption,
  HealthOSPregnancySetupDraft,
} from "./HealthOSPregnancyTypes";

type Props = {
  onLearnFirst: () => void;
  onStart: (draft: HealthOSPregnancySetupDraft) => Promise<string>;
};

const GENDER_OPTIONS: Array<{ key: HealthOSBabyGenderOption; label: string }> = [
  { key: "unknownUpdateLater", label: "Unknown / update later" },
  { key: "girl", label: "Girl" },
  { key: "boy", label: "Boy" },
  { key: "preferNotToSay", label: "Prefer not to say" },
];

export function HealthOSPregnancySetupCard({ onLearnFirst, onStart }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const [estimatedDueDate, setEstimatedDueDate] = useState("");
  const [lastMenstrualPeriodDate, setLastMenstrualPeriodDate] = useState("");
  const [babyNickname, setBabyNickname] = useState("");
  const [babyGender, setBabyGender] = useState<HealthOSBabyGenderOption>("unknownUpdateLater");
  const [message, setMessage] = useState("");

  async function start() {
    const nextMessage = await onStart({
      babyGender,
      babyNickname,
      estimatedDueDate,
      lastMenstrualPeriodDate,
    });
    setMessage(nextMessage);
  }

  return (
    <HealthOSCard
      subtitle="Your cycle history stays private. Pregnancy creates a new timeline only when you confirm."
      title="Start pregnancy mode?"
      variant="elevated"
    >
      <View style={styles.stack}>
        <Text style={[healthOSTypography.bodySmall, { color: palette.softText }]}>
          Add a due date or last period date if you want HealthOS to show estimated week and trimester details.
        </Text>
        <TextInput
          accessibilityLabel="Estimated due date"
          onChangeText={setEstimatedDueDate}
          placeholder="Estimated due date YYYY-MM-DD"
          placeholderTextColor={palette.softText}
          style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]}
          value={estimatedDueDate}
        />
        <TextInput
          accessibilityLabel="Last menstrual period date"
          onChangeText={setLastMenstrualPeriodDate}
          placeholder="Last period date YYYY-MM-DD"
          placeholderTextColor={palette.softText}
          style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]}
          value={lastMenstrualPeriodDate}
        />
        <TextInput
          accessibilityLabel="Baby nickname optional"
          onChangeText={setBabyNickname}
          placeholder="Baby nickname optional"
          placeholderTextColor={palette.softText}
          style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]}
          value={babyNickname}
        />
        <View style={styles.pills}>
          {GENDER_OPTIONS.map((option) => (
            <HealthOSPill
              key={option.key}
              label={option.label}
              onPress={() => setBabyGender(option.key)}
              realmColor={palette.pregnancy}
              selected={babyGender === option.key}
              variant="realm"
            />
          ))}
        </View>
        <View style={styles.actions}>
          <HealthOSPill label="Start pregnancy mode" onPress={start} variant="ai" />
          <HealthOSPill label="Learn first" onPress={onLearnFirst} variant="glass" />
        </View>
        {message ? (
          <Text style={[healthOSTypography.caption, { color: palette.success }]}>
            {message}
          </Text>
        ) : null}
        <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
          Pregnancy dating is an estimate based on dates you enter. Confirm dating with your healthcare professional.
        </Text>
      </View>
    </HealthOSCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
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
