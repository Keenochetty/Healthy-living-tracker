import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";
import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import { getHealthOSPalette, getHealthOSSurfaces, healthOSBorderWidth, healthOSRadius, healthOSSpacing, healthOSTypography, type HealthOSColorMode } from "@/theme/healthos";

import type { HealthOSBabyChildQuickLogDraft, HealthOSChildCareLogType, HealthOSDiaperType } from "./HealthOSBabyChildTypes";

type Props = {
  activeChildId?: string;
  logType: HealthOSChildCareLogType | null;
  onClose: () => void;
  onSave: (draft: HealthOSBabyChildQuickLogDraft) => void;
};

export function HealthOSBabyChildQuickLogSheet({ activeChildId, logType, onClose, onSave }: Props) {
  const mode: HealthOSColorMode = useColorScheme() === "dark" ? "dark" : "light";
  const palette = getHealthOSPalette(mode);
  const surfaces = getHealthOSSurfaces(mode);
  const [note, setNote] = useState("");
  const [amountMl, setAmountMl] = useState("");
  const [foodName, setFoodName] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [symptom, setSymptom] = useState("");
  const [temperature, setTemperature] = useState("");
  const [diaperType, setDiaperType] = useState<HealthOSDiaperType>("wet");

  useEffect(() => {
    setNote("");
    setAmountMl("");
    setFoodName("");
    setMedicineName("");
    setSymptom("");
    setTemperature("");
  }, [logType]);

  if (!logType) return null;

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, surfaces.elevatedCard]}>
        <HealthOSCard title={`Log ${labelFor(logType)}`} variant="compact">
          <View style={styles.stack}>
            {logType === "feed" ? (
              <TextInput keyboardType="numeric" onChangeText={setAmountMl} placeholder="Amount ml optional" placeholderTextColor={palette.softText} style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]} value={amountMl} />
            ) : null}
            {logType === "diaper" ? (
              <View style={styles.pills}>
                {(["wet", "dirty", "both", "unknown"] as HealthOSDiaperType[]).map((item) => (
                  <HealthOSPill key={item} label={item} onPress={() => setDiaperType(item)} selected={diaperType === item} variant="realm" />
                ))}
              </View>
            ) : null}
            {logType === "solidFood" ? (
              <TextInput onChangeText={setFoodName} placeholder="Food name" placeholderTextColor={palette.softText} style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]} value={foodName} />
            ) : null}
            {logType === "medicine" ? (
              <TextInput onChangeText={setMedicineName} placeholder="Medicine name" placeholderTextColor={palette.softText} style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]} value={medicineName} />
            ) : null}
            {logType === "symptom" ? (
              <TextInput onChangeText={setSymptom} placeholder="Symptom, e.g. cough, fever, rash" placeholderTextColor={palette.softText} style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]} value={symptom} />
            ) : null}
            {logType === "temperature" ? (
              <TextInput onChangeText={setTemperature} placeholder="Temperature and unit" placeholderTextColor={palette.softText} style={[styles.input, { borderColor: palette.borderSubtle, color: palette.inkText }]} value={temperature} />
            ) : null}
            <TextInput
              multiline
              onChangeText={setNote}
              placeholder="Note"
              placeholderTextColor={palette.softText}
              style={[styles.input, styles.note, { borderColor: palette.borderSubtle, color: palette.inkText }]}
              value={note}
            />
            <Text style={[healthOSTypography.caption, { color: palette.softText }]}>
              This log helps you track care. It does not replace medical advice.
            </Text>
            <Text style={[healthOSTypography.caption, { color: palette.warning }]}>
              If symptoms feel severe or urgent, seek medical help.
            </Text>
            <View style={styles.pills}>
              <HealthOSPill
                label="Save privately"
                onPress={() =>
                  onSave({
                    amountMl: amountMl ? Number(amountMl) : undefined,
                    childProfileId: activeChildId,
                    diaperType,
                    foodName,
                    logType,
                    medicineName,
                    note: note || symptom || temperature,
                    symptom,
                    temperature,
                  })
                }
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

function labelFor(type: HealthOSChildCareLogType) {
  return type.replace(/([A-Z])/g, " $1").toLowerCase();
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
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
