import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import {
  AppHeader,
  AppIcon,
  AppScreen,
  QuickActionButton,
  StatusPill,
  WidgetCard,
} from "@/components/ui";
import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";
import type { CaregiverCareType } from "@/types/caregiver";

function openRoute(route: string) {
  router.push(route as Parameters<typeof router.push>[0]);
}

const careTypeLabels = {
  adults: "Adults",
  both: "Children and adults",
  children: "Children",
} as const satisfies Record<CaregiverCareType, string>;

export default function EditCaregiverProfileScreen() {
  const [firstName, setFirstName] = useState("Maya");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("Stone");
  const [age, setAge] = useState("34");
  const [email, setEmail] = useState("caregiver@example.com");
  const [cellNumber, setCellNumber] = useState("+1 555 014 2700");
  const [serviceArea, setServiceArea] = useState(
    "North side and nearby suburbs",
  );
  const [yearsOfExperience, setYearsOfExperience] = useState("8");
  const [careType, setCareType] = useState<CaregiverCareType>("both");
  const [experienceSummary, setExperienceSummary] = useState(
    "Experienced caregiver focused on calm routines and safe handoffs.",
  );
  const [availabilityDays, setAvailabilityDays] = useState(
    "Monday, Tuesday, Wednesday, Thursday, Friday",
  );
  const [availableFromTime, setAvailableFromTime] = useState("08:00");
  const [availableToTime, setAvailableToTime] = useState("17:00");
  const [hourlyRate, setHourlyRate] = useState("24");
  const [dailyRate, setDailyRate] = useState("180");
  const [rateNotes, setRateNotes] = useState(
    "Rates vary by weekend coverage and overnight care.",
  );

  function handleSavePlaceholder() {
    openRoute("/caregiver/profile");
  }

  return (
    <View style={styles.root}>
      <AppScreen>
        <AppHeader
          action={
            <QuickActionButton
              label="Cancel"
              onPress={() => openRoute("/caregiver/profile")}
              toneColor={colors.text.muted}
            />
          }
          eyebrow="Caregiver"
          subtitle="Edit caregiver profile fields locally for now. Persistence comes later."
          title="Edit caregiver profile"
        />

        <WidgetCard
          accentColor={colors.brand.primary}
          action={<StatusPill label="Profile photo placeholder" />}
          subtitle="Caregiver identity and public profile details."
          title="Basic details"
        >
          <View style={styles.form}>
            <View style={styles.photoPlaceholder}>
              <AppIcon color={colors.brand.primary} name="camera" size={26} />
              <Text style={styles.muted}>Profile photo placeholder</Text>
            </View>
            <TextInput
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={firstName}
            />
            <TextInput
              onChangeText={setMiddleName}
              placeholder="Middle name optional"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={middleName}
            />
            <TextInput
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={lastName}
            />
            <TextInput
              onChangeText={setAge}
              placeholder="Age or date of birth optional"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={age}
            />
            <TextInput
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={email}
            />
            <TextInput
              onChangeText={setCellNumber}
              placeholder="Cell number"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={cellNumber}
            />
            <TextInput
              onChangeText={setServiceArea}
              placeholder="Address / service area"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={serviceArea}
            />
          </View>
        </WidgetCard>

        <WidgetCard
          accentColor={colors.status.ai}
          subtitle="Experience, care type, availability, and rates."
          title="Caregiver work details"
        >
          <View style={styles.form}>
            <TextInput
              onChangeText={setYearsOfExperience}
              placeholder="Years of caregiving experience"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={yearsOfExperience}
            />
            <View style={styles.pillRow}>
              {(["children", "adults", "both"] as const).map((type) => (
                <QuickActionButton
                  key={type}
                  icon={
                    careType === type ? (
                      <AppIcon color={colors.status.ai} name="sync" size={18} />
                    ) : undefined
                  }
                  label={careTypeLabels[type]}
                  onPress={() => setCareType(type)}
                  toneColor={
                    careType === type ? colors.status.ai : colors.text.muted
                  }
                />
              ))}
            </View>
            <TextInput
              multiline
              onChangeText={setExperienceSummary}
              placeholder="Experience summary"
              placeholderTextColor={colors.text.muted}
              style={[styles.input, styles.textArea]}
              value={experienceSummary}
            />
            <TextInput
              onChangeText={setAvailabilityDays}
              placeholder="Availability days"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={availabilityDays}
            />
            <TextInput
              onChangeText={setAvailableFromTime}
              placeholder="Available from time"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={availableFromTime}
            />
            <TextInput
              onChangeText={setAvailableToTime}
              placeholder="Available to time"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={availableToTime}
            />
            <TextInput
              onChangeText={setHourlyRate}
              placeholder="Hourly rate"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={hourlyRate}
            />
            <TextInput
              onChangeText={setDailyRate}
              placeholder="Daily rate"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              value={dailyRate}
            />
            <TextInput
              multiline
              onChangeText={setRateNotes}
              placeholder="Rate notes"
              placeholderTextColor={colors.text.muted}
              style={[styles.input, styles.textArea]}
              value={rateNotes}
            />
            <QuickActionButton
              icon={
                <AppIcon
                  color={colors.brand.primary}
                  name="settings"
                  size={20}
                />
              }
              label="Save placeholder"
              onPress={handleSavePlaceholder}
              toneColor={colors.brand.primary}
            />
          </View>
        </WidgetCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.card.background,
    borderColor: colors.border.soft,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text.primary,
    fontSize: 16,
    minHeight: 50,
    padding: spacing.md,
  },
  muted: {
    color: colors.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  photoPlaceholder: {
    alignItems: "center",
    backgroundColor: colors.background.warm,
    borderColor: colors.border.soft,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 120,
    padding: spacing.lg,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  root: {
    backgroundColor: colors.background.app,
    flex: 1,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
