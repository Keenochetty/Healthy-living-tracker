import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  getHealthOSPalette,
  getHealthOSSurfaces,
  healthOSBorderWidth,
  healthOSRadius,
  healthOSSpacing,
  healthOSTypography,
  type HealthOSColorMode,
} from "@/theme/healthos";

import type {
  HealthOSPregnancyLogType,
  HealthOSPregnancyQuickLogDraft,
} from "./HealthOSPregnancyTypes";

type Props = {
  logType: HealthOSPregnancyLogType | null;
  onClose: () => void;
  onSave: (draft: HealthOSPregnancyQuickLogDraft) => void;
};

const SYMPTOMS = [
  "nausea",
  "fatigue",
  "cramps",
  "back pain",
  "headache",
  "swelling",
  "heartburn",
  "dizziness",
  "cravings",
  "sleep issues",
  "mood changes",
  "custom note",
];

const MOODS = ["calm", "happy", "anxious", "tired", "emotional", "stressed", "excited", "low"];

export function HealthOSPregnancyQuickLogSheet({ logType, onClose, onSave }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const [symptom, setSymptom] = useState("nausea");
  const [mood, setMood] = useState("calm");
  const [painArea, setPainArea] = useState("");
  const [severityScore, setSeverityScore] = useState(3);
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote("");
  }, [logType]);

  if (!logType) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, surfaces.elevatedCard]}>
        <HealthOSCard title={titleFor(logType)} variant="compact">
          <View style={styles.stack}>
            {logType === "symptom" ? (
              <View style={styles.pills}>
                {SYMPTOMS.map((item) => (
                  <HealthOSPill
                    key={item}
                    label={item}
                    onPress={() => setSymptom(item)}
                    selected={symptom === item}
                    variant="realm"
                  />
                ))}
              </View>
            ) : null}
            {logType === "mood" ? (
              <View style={styles.pills}>
                {MOODS.map((item) => (
                  <HealthOSPill
                    key={item}
                    label={item}
                    onPress={() => setMood(item)}
                    selected={mood === item}
                    variant="realm"
                  />
                ))}
              </View>
            ) : null}
            {logType === "pain" ? (
              <>
                <TextInput
                  accessibilityLabel="Pain area"
                  onChangeText={setPainArea}
                  placeholder="Pain area optional"
                  placeholderTextColor={palette.softText}
                  style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]}
                  value={painArea}
                />
                <View style={styles.pills}>
                  {[0, 2, 4, 6, 8, 10].map((value) => (
                    <HealthOSPill
                      key={value}
                      label={`${value}/10`}
                      onPress={() => setSeverityScore(value)}
                      selected={severityScore === value}
                      variant="realm"
                    />
                  ))}
                </View>
              </>
            ) : null}
            <TextInput
              accessibilityLabel="Pregnancy log note"
              multiline
              onChangeText={setNote}
              placeholder="Notes"
              placeholderTextColor={palette.softText}
              style={[styles.input, styles.note, { borderColor: palette.borderSubtle, color: palette.inkText }]}
              value={note}
            />
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              This log helps you track patterns. It does not replace medical care.
            </Text>
            <Text style={[healthOSTypography.caption, { color: palette.warning }]}>
              If symptoms feel severe or urgent, seek medical help.
            </Text>
            <View style={styles.actions}>
              <HealthOSPill
                label="Save privately"
                onPress={() => onSave({ logType, mood, note, painArea, severityScore, symptom })}
                variant="ai"
              />
              <HealthOSPill label="Cancel" onPress={onClose} variant="glass" />
            </View>
          </View>
        </HealthOSCard>
      </View>
    </Modal>
  );
}

function titleFor(logType: HealthOSPregnancyLogType) {
  if (logType === "appointmentNote") return "Appointment note";
  if (logType === "babyMovement") return "Baby movement note";
  return `Log ${logType}`;
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  backdrop: {
    flex: 1,
  },
  input: {
    borderRadius: healthOSRadius.lg,
    borderWidth: healthOSBorderWidth.thin,
    minHeight: 48,
    paddingHorizontal: healthOSSpacing.md,
  },
  note: {
    minHeight: 92,
    paddingTop: healthOSSpacing.md,
    textAlignVertical: "top",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: healthOSSpacing.sm,
  },
  sheet: {
    borderTopLeftRadius: healthOSRadius["3xl"],
    borderTopRightRadius: healthOSRadius["3xl"],
    maxHeight: "82%",
    padding: healthOSSpacing.lg,
  },
  stack: {
    gap: healthOSSpacing.md,
  },
});
