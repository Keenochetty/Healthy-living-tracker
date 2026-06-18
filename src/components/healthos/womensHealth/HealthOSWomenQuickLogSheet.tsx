import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, getHealthOSSurfaces, healthOSBottomSheetSizes, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSWomenQuickLogDraft } from "./useHealthOSWomenHealthActions";
import type { HealthOSPeriodFlow, HealthOSWomenLogType } from "./HealthOSWomenHealthTypes";

type Props = {
  logType: HealthOSWomenLogType | null;
  onClose: () => void;
  onSave: (draft: HealthOSWomenQuickLogDraft) => void;
};

const flowOptions: HealthOSPeriodFlow[] = ["spotting", "light", "medium", "heavy"];
const symptoms = ["Cramps", "Headache", "Bloating", "Acne", "Fatigue", "Nausea", "Back pain"];
const moods = ["Calm", "Happy", "Sad", "Anxious", "Irritated", "Stressed", "Tired", "Energetic"];

export function HealthOSWomenQuickLogSheet({ logType, onClose, onSave }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const [flow, setFlow] = useStateValue<HealthOSPeriodFlow>("medium", logType);
  const [symptom, setSymptom] = useStateValue("Cramps", logType);
  const [mood, setMood] = useStateValue("Calm", logType);
  const [note, setNote] = useStateValue("", logType);
  const [contraceptionStatus, setContraceptionStatus] = useStateValue<"taken" | "missed" | "side_effect">("taken", logType);

  if (!logType) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, surfaces.elevatedCard]}>
        <View style={styles.handle} />
        <Text style={[healthOSTypography.sectionTitle, { color: palette.inkText }]}>
          Log {logType}
        </Text>
        <Text style={[healthOSTypography.caption, styles.copy, { color: palette.softText }]}>
          Only you can see this unless you choose to share it.
        </Text>
        {logType === "period" ? (
          <View style={styles.options}>{flowOptions.map((item) => <HealthOSPill key={item} label={item} onPress={() => setFlow(item)} selected={flow === item} />)}</View>
        ) : null}
        {logType === "symptom" ? (
          <View style={styles.options}>{symptoms.map((item) => <HealthOSPill key={item} label={item} onPress={() => setSymptom(item)} selected={symptom === item} />)}</View>
        ) : null}
        {logType === "mood" ? (
          <View style={styles.options}>{moods.map((item) => <HealthOSPill key={item} label={item} onPress={() => setMood(item)} selected={mood === item} />)}</View>
        ) : null}
        {logType === "sex" ? (
          <Text style={[healthOSTypography.bodySmall, styles.copy, { color: palette.softText }]}>
            Sex-day logging UI is prepared, but dedicated private persistence is pending.
          </Text>
        ) : null}
        {logType === "contraception" ? (
          <View style={styles.options}>
            {(["taken", "missed", "side_effect"] as const).map((item) => (
              <HealthOSPill key={item} label={item.replace(/_/g, " ")} onPress={() => setContraceptionStatus(item)} selected={contraceptionStatus === item} />
            ))}
          </View>
        ) : null}
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="Private note optional"
          placeholderTextColor={palette.softText}
          style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]}
          value={note}
        />
        <View style={styles.actions}>
          <HealthOSPill label="Cancel" onPress={onClose} variant="glass" />
          <HealthOSPill
            label={logType === "sex" || logType === "note" ? "Close" : "Save privately"}
            onPress={() =>
              onSave({ contraceptionStatus, flow, mood, note, symptom, type: logType })
            }
            variant="active"
          />
        </View>
      </View>
    </Modal>
  );
}

function useStateValue<T>(initial: T, resetKey: unknown) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => setValue(initial), [initial, resetKey]);
  return [value, setValue] as const;
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  backdrop: {
    backgroundColor: "rgba(2, 6, 23, 0.32)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  copy: {
    marginTop: healthOSSpacing.xs,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(148, 163, 184, 0.4)",
    borderRadius: 999,
    height: 4,
    marginBottom: healthOSSpacing.md,
    width: 44,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: healthOSSpacing.md,
    minHeight: 88,
    padding: healthOSSpacing.md,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
    marginTop: healthOSSpacing.md,
  },
  sheet: {
    borderTopLeftRadius: healthOSBottomSheetSizes.cornerRadius,
    borderTopRightRadius: healthOSBottomSheetSizes.cornerRadius,
    bottom: 0,
    left: 0,
    padding: healthOSSpacing.lg,
    position: "absolute",
    right: 0,
  },
});
