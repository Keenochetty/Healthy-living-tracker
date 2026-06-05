import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { AppButton, AppIcon } from "@/components/ui";
import { lightImpact, successImpact } from "@/lib/haptics";

export function PresetChipGroup({
  onSelect,
  presets,
  selectedValue,
  suffix = ""
}: {
  onSelect: (value: number) => void;
  presets: number[];
  selectedValue?: number;
  suffix?: string;
}) {
  return (
    <View style={styles.chipRow}>
      {presets.map((preset) => (
        <Pressable
          accessibilityRole="button"
          key={preset}
          onPress={() => {
            lightImpact();
            onSelect(preset);
          }}
          style={[styles.presetChip, selectedValue === preset ? styles.presetChipSelected : null]}
        >
          <Text style={[styles.presetText, selectedValue === preset ? styles.presetTextSelected : null]}>
            {preset}
            {suffix}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ManualEntryToggle({
  enabled,
  onToggle
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onToggle} style={styles.manualToggle}>
      <AppIcon color="#6ee7c8" decorative name="edit" size={18} />
      <Text style={styles.manualToggleText}>{enabled ? "Use presets" : "Manual entry"}</Text>
    </Pressable>
  );
}

export function NumberWheelPicker({
  max = 30,
  min = 0,
  onChange,
  step = 1,
  suffix = "",
  value
}: {
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  step?: number;
  suffix?: string;
  value: number;
}) {
  const values = useMemo(() => {
    const nextValues: number[] = [];
    for (let next = min; next <= max; next += step) {
      nextValues.push(Number(next.toFixed(2)));
    }
    return nextValues;
  }, [max, min, step]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wheelRow}>
      {values.map((item) => (
        <Pressable
          accessibilityRole="button"
          key={`${item}`}
          onPress={() => {
            lightImpact();
            onChange(item);
          }}
          style={[styles.wheelItem, value === item ? styles.wheelItemSelected : null]}
        >
          <Text style={[styles.wheelText, value === item ? styles.wheelTextSelected : null]}>
            {item}
            {suffix}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function TimeWheelPicker({
  onChange,
  valueMinutes
}: {
  onChange: (value: number) => void;
  valueMinutes: number;
}) {
  return (
    <NumberWheelPicker
      max={120}
      min={5}
      onChange={onChange}
      step={5}
      suffix="m"
      value={valueMinutes}
    />
  );
}

export function DateWheelPicker({
  onChange,
  value
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <TextInput
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor="#94a3b8"
      style={styles.input}
      value={value}
    />
  );
}

export function QuickNoteField({
  onChangeText,
  value
}: {
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <TextInput
      multiline
      onChangeText={onChangeText}
      placeholder="Quick note optional"
      placeholderTextColor="#94a3b8"
      style={[styles.input, styles.noteInput]}
      value={value}
    />
  );
}

export function QuickSaveButton({
  onPress,
  title = "Save"
}: {
  onPress: () => void;
  title?: string;
}) {
  return (
    <AppButton
      onPress={() => {
        successImpact();
        onPress();
      }}
      title={title}
    />
  );
}

export function QuickLogBottomSheet({
  children,
  onClose,
  title,
  visible
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalRoot}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.scrim} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable accessibilityLabel="Close quick input" accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>x</Text>
            </Pressable>
          </View>
          <View style={styles.sheetBody}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  closeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44
  },
  closeText: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "900"
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#f8fafc",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  manualToggle: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
    minHeight: 44
  },
  manualToggleText: {
    color: "#6ee7c8",
    fontWeight: "900"
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  noteInput: {
    minHeight: 82,
    textAlignVertical: "top"
  },
  presetChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  presetChipSelected: {
    backgroundColor: "#6ee7c8",
    borderColor: "#6ee7c8"
  },
  presetText: {
    color: "#e2e8f0",
    fontWeight: "900"
  },
  presetTextSelected: {
    color: "#10201d"
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(2,6,23,0.56)"
  },
  sheet: {
    backgroundColor: "#111827",
    borderColor: "rgba(255,255,255,0.14)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 18
  },
  sheetBody: {
    gap: 14,
    paddingBottom: 12
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    height: 4,
    marginBottom: 12,
    width: 46
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  sheetTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "900"
  },
  wheelItem: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    minWidth: 64,
    paddingHorizontal: 12
  },
  wheelItemSelected: {
    backgroundColor: "#fed7aa"
  },
  wheelRow: {
    gap: 8,
    paddingVertical: 4
  },
  wheelText: {
    color: "#e2e8f0",
    fontWeight: "900"
  },
  wheelTextSelected: {
    color: "#431407"
  }
});
