import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { useAppTheme } from "@/theme/ThemeProvider";

export type HealthWidgetId =
  | "blood_pressure"
  | "heart"
  | "medication"
  | "mood"
  | "notes"
  | "sleep"
  | "steps"
  | "temperature"
  | "water"
  | "weight";

export type HealthWidgetOption = {
  category: string;
  description: string;
  icon: AppIconName;
  id: HealthWidgetId;
  label: string;
  status: string;
  value: string;
};

export const DEFAULT_SELECTED_HEALTH_WIDGET_IDS: HealthWidgetId[] = [
  "heart",
  "weight",
  "water",
  "medication",
  "notes",
];

export const AVAILABLE_HEALTH_WIDGETS: HealthWidgetOption[] = [
  {
    category: "Biometrics",
    description: "Resting heart rate",
    icon: "vitals",
    id: "heart",
    label: "Heart",
    status: "usual",
    value: "78 bpm",
  },
  {
    category: "Biometrics",
    description: "Body weight",
    icon: "weight",
    id: "weight",
    label: "Weight",
    status: "stable",
    value: "72.2 kg",
  },
  {
    category: "Wellness",
    description: "Water logged today",
    icon: "water",
    id: "water",
    label: "Water",
    status: "today",
    value: "1.2 L",
  },
  {
    category: "Medication",
    description: "Reminders",
    icon: "medication",
    id: "medication",
    label: "Medication",
    status: "due later",
    value: "1 due",
  },
  {
    category: "Records",
    description: "Health notes",
    icon: "edit",
    id: "notes",
    label: "Notes",
    status: "this week",
    value: "2",
  },
  {
    category: "Wellness",
    description: "Last sleep log",
    icon: "sleep",
    id: "sleep",
    label: "Sleep",
    status: "logged",
    value: "6h 40m",
  },
  {
    category: "Movement",
    description: "Steps today",
    icon: "fitness",
    id: "steps",
    label: "Steps",
    status: "today",
    value: "4,820",
  },
  {
    category: "Wellness",
    description: "Mood check-in",
    icon: "mood",
    id: "mood",
    label: "Mood",
    status: "not logged",
    value: "Add",
  },
  {
    category: "Biometrics",
    description: "Latest temperature log",
    icon: "biometrics",
    id: "temperature",
    label: "Temperature",
    status: "not logged",
    value: "Add",
  },
  {
    category: "Biometrics",
    description: "Latest blood pressure log",
    icon: "vitals",
    id: "blood_pressure",
    label: "Blood Pressure",
    status: "not logged",
    value: "Add",
  },
];

export function HealthWidgetCustomizerSheet({
  onCancel,
  onSave,
  selectedIds,
  visible,
}: {
  onCancel: () => void;
  onSave: (selectedIds: HealthWidgetId[]) => void;
  selectedIds: HealthWidgetId[];
  visible: boolean;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [draftIds, setDraftIds] = useState<HealthWidgetId[]>(selectedIds);
  const [helperText, setHelperText] = useState("");

  useEffect(() => {
    if (visible) {
      setDraftIds(selectedIds);
      setHelperText("");
    }
  }, [selectedIds, visible]);

  function toggle(id: HealthWidgetId) {
    const selected = draftIds.includes(id);
    if (selected && draftIds.length === 1) {
      setHelperText("Keep at least one widget in your health bar.");
      return;
    }
    if (!selected && draftIds.length === 6) {
      setHelperText("You can show up to 6 quick widgets.");
      return;
    }
    setHelperText("");
    setDraftIds((current) =>
      selected ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modal}>
        <Pressable
          accessibilityLabel="Cancel customizing health bar"
          accessibilityRole="button"
          onPress={onCancel}
          style={styles.scrim}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              maxHeight: height * 0.88,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.copy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Customize health bar
              </Text>
              <Text style={[styles.subtitle, { color: theme.mutedText }]}>
                Choose what you want to see first.
              </Text>
            </View>
            <View
              style={[styles.count, { backgroundColor: theme.primarySoft }]}
            >
              <Text style={[styles.countText, { color: theme.text }]}>
                {draftIds.length} selected
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <View style={styles.options}>
              {AVAILABLE_HEALTH_WIDGETS.map((option) => (
                <HealthWidgetOptionCard
                  key={option.id}
                  onPress={() => toggle(option.id)}
                  option={option}
                  selected={draftIds.includes(option.id)}
                />
              ))}
            </View>
            <Text
              style={[
                styles.helper,
                { color: helperText ? "#b45309" : theme.mutedText },
              ]}
            >
              {helperText || "Choose between 1 and 6 quick widgets."}
            </Text>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
                paddingBottom: Math.max(insets.bottom, 12) + 8,
              },
            ]}
          >
            <Pressable
              accessibilityLabel="Use suggested health widgets"
              accessibilityRole="button"
              onPress={() => {
                setDraftIds(DEFAULT_SELECTED_HEALTH_WIDGET_IDS);
                setHelperText("");
              }}
              style={({ pressed }) => [
                styles.reset,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.resetText, { color: theme.primary }]}>
                Use suggested
              </Text>
            </Pressable>
            <View style={styles.actions}>
              <Pressable
                accessibilityLabel="Cancel health bar changes"
                accessibilityRole="button"
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.cancel,
                  { borderColor: theme.border },
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={[styles.cancelText, { color: theme.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`Save ${draftIds.length} health bar widgets`}
                accessibilityRole="button"
                onPress={() => onSave(draftIds)}
                style={({ pressed }) => [
                  styles.save,
                  { backgroundColor: theme.primary },
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.saveText}>Save changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function HealthWidgetOptionCard({
  onPress,
  option,
  selected,
}: {
  onPress: () => void;
  option: HealthWidgetOption;
  selected: boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={`${option.label}, ${option.value}, ${option.status}, ${selected ? "selected" : "not selected"}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? theme.primarySoft : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: theme.surface }]}>
        <AppIcon
          color={theme.primary}
          decorative
          name={option.icon}
          size={20}
        />
      </View>
      <View style={styles.copy}>
        <View style={styles.optionHeading}>
          <Text style={[styles.optionTitle, { color: theme.text }]}>
            {option.label}
          </Text>
          <Text
            style={[
              styles.selectedText,
              { color: selected ? theme.primary : theme.mutedText },
            ]}
          >
            {selected ? "Selected" : "Add"}
          </Text>
        </View>
        <Text style={[styles.optionDescription, { color: theme.mutedText }]}>
          {option.description} - {option.category}
        </Text>
        <Text style={[styles.optionValue, { color: theme.text }]}>
          {option.value} - {option.status}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 10 },
  body: { padding: 18 },
  cancel: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  cancelText: { fontWeight: "900" },
  copy: { flex: 1 },
  count: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  countText: { fontSize: 12, fontWeight: "900" },
  footer: { borderTopWidth: 1, gap: 10, paddingHorizontal: 18, paddingTop: 12 },
  handle: {
    alignSelf: "center",
    borderRadius: 999,
    height: 4,
    marginTop: 10,
    width: 46,
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 18,
  },
  helper: { fontSize: 12, fontWeight: "800", lineHeight: 18, marginTop: 14 },
  modal: { flex: 1, justifyContent: "flex-end" },
  option: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 100,
    padding: 14,
  },
  optionDescription: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  optionHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  optionIcon: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  optionTitle: { fontSize: 16, fontWeight: "900" },
  optionValue: { fontSize: 13, fontWeight: "900", marginTop: 5 },
  options: { gap: 10 },
  pressed: { opacity: 0.76 },
  reset: { alignSelf: "flex-start", minHeight: 40, paddingVertical: 9 },
  resetText: { fontWeight: "900" },
  save: {
    alignItems: "center",
    borderRadius: 18,
    flex: 1.4,
    justifyContent: "center",
    minHeight: 50,
  },
  saveText: { color: "#ffffff", fontWeight: "900" },
  scroll: { flexShrink: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.58)" },
  selectedText: { fontSize: 12, fontWeight: "900" },
  sheet: {
    alignSelf: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    maxWidth: 520,
    overflow: "hidden",
    width: "100%",
  },
  subtitle: { lineHeight: 20, marginTop: 4 },
  title: { fontSize: 21, fontWeight: "900" },
});
