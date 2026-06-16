import { useMemo, useState, type ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppFormInput, AppIcon } from "@/components/ui";
import type {
  GeneralHealthLogDraft,
  GeneralHealthLogType,
} from "@/lib/generalHealthMockData";
import { useAppTheme } from "@/theme/ThemeProvider";

const ACCENT = "#0f766e";
const NOTE_CATEGORIES = [
  "General",
  "Symptom",
  "Energy",
  "Sleep",
  "Medication",
  "Appointment",
] as const;
const TEMPERATURE_METHODS = [
  "Oral",
  "Ear",
  "Forehead",
  "Underarm",
  "Other",
] as const;

type FieldErrors = Partial<
  Record<
    | "bloodPressure"
    | "heartRate"
    | "noteTitle"
    | "oxygen"
    | "temperature"
    | "vitals"
    | "weight",
    string
  >
>;
type SheetConfig = { helper: string; subtitle: string; title: string };

const SHEET_CONFIG: Record<GeneralHealthLogType, SheetConfig> = {
  note: {
    helper: "Notes help you remember context. They are not medical findings.",
    subtitle: "Record anything useful about how you feel or what happened.",
    title: "Add health note",
  },
  temperature: {
    helper:
      "Temperature readings can vary by method. Contact a healthcare professional if you are worried.",
    subtitle: "Save a temperature reading.",
    title: "Add temperature",
  },
  vitals: {
    helper:
      "Save readings for your own records. Contact a healthcare professional if you are worried about symptoms or readings.",
    subtitle: "Log the readings you want to keep.",
    title: "Add vitals",
  },
  weight: {
    helper:
      "This entry is for tracking only. The app does not judge or diagnose body measurements.",
    subtitle: "Track body changes over time.",
    title: "Add weight",
  },
};

export function GeneralHealthLogSheet({
  logType,
  onCancel,
  profileName = "You",
  onSave,
}: {
  logType: GeneralHealthLogType | null;
  onCancel: () => void;
  profileName?: string;
  onSave: (draft: GeneralHealthLogDraft) => void;
}) {
  const config = logType ? SHEET_CONFIG[logType] : SHEET_CONFIG.vitals;
  const actionNoun = getActionNoun(logType ?? "vitals");
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [heartRate, setHeartRate] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [oxygen, setOxygen] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDetails, setNoteDetails] = useState("");
  const [category, setCategory] =
    useState<(typeof NOTE_CATEGORIES)[number]>("General");
  const [method, setMethod] =
    useState<(typeof TEMPERATURE_METHODS)[number]>("Oral");
  const [recordedAt] = useState(() => new Date().toISOString());

  const readingTime = useMemo(
    () => (recordedAt ? formatReadingTime(recordedAt) : "Now"),
    [recordedAt],
  );

  function cancel() {
    Keyboard.dismiss();
    onCancel();
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );
  }

  function save() {
    if (!logType) return;
    Keyboard.dismiss();
    const nextErrors = validate(logType, {
      diastolic,
      heartRate,
      noteTitle,
      oxygen,
      systolic,
      temperature,
      weight,
    });
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    // TODO: Persist health logs to the selected profile through the approved data layer.
    onSave({
      category,
      details: noteDetails.trim(),
      diastolic: diastolic.trim(),
      heartRate: heartRate.trim(),
      logType,
      method,
      notes: notes.trim(),
      noteTitle: noteTitle.trim(),
      oxygen: oxygen.trim(),
      recordedAt: recordedAt || new Date().toISOString(),
      systolic: systolic.trim(),
      temperature: temperature.trim(),
      weight: weight.trim(),
    });
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={cancel}
      statusBarTranslucent
      transparent
      visible={Boolean(logType)}
    >
      <View style={styles.modal}>
        <Pressable
          accessibilityLabel={`Cancel ${actionNoun}`}
          accessibilityRole="button"
          onPress={cancel}
          style={styles.scrim}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
          style={styles.keyboard}
        >
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                maxHeight: height - Math.max(insets.top, 16),
                width: Math.min(width, 480),
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
            <HealthLogSheetHeader
              profileName={profileName}
              subtitle={config.subtitle}
              title={config.title}
            />

            <ScrollView
              contentContainerStyle={styles.body}
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {logType === "vitals" ? (
                <VitalsForm
                  diastolic={diastolic}
                  errors={errors}
                  heartRate={heartRate}
                  notes={notes}
                  oxygen={oxygen}
                  setDiastolic={(value) => {
                    setDiastolic(value);
                    clearError("bloodPressure");
                    clearError("vitals");
                  }}
                  setHeartRate={(value) => {
                    setHeartRate(value);
                    clearError("heartRate");
                    clearError("vitals");
                  }}
                  setNotes={setNotes}
                  setOxygen={(value) => {
                    setOxygen(value);
                    clearError("oxygen");
                    clearError("vitals");
                  }}
                  setSystolic={(value) => {
                    setSystolic(value);
                    clearError("bloodPressure");
                    clearError("vitals");
                  }}
                  systolic={systolic}
                />
              ) : null}
              {logType === "weight" ? (
                <WeightForm
                  error={errors.weight}
                  notes={notes}
                  setNotes={setNotes}
                  setWeight={(value) => {
                    setWeight(value);
                    clearError("weight");
                  }}
                  weight={weight}
                />
              ) : null}
              {logType === "note" ? (
                <NoteForm
                  category={category}
                  details={noteDetails}
                  error={errors.noteTitle}
                  setCategory={setCategory}
                  setDetails={setNoteDetails}
                  setTitle={(value) => {
                    setNoteTitle(value);
                    clearError("noteTitle");
                  }}
                  title={noteTitle}
                />
              ) : null}
              {logType === "temperature" ? (
                <TemperatureForm
                  error={errors.temperature}
                  method={method}
                  notes={notes}
                  setMethod={setMethod}
                  setNotes={setNotes}
                  setTemperature={(value) => {
                    setTemperature(value);
                    clearError("temperature");
                  }}
                  temperature={temperature}
                />
              ) : null}
              <ReadingTime
                label={
                  logType === "note" || logType === "weight"
                    ? "Date and time"
                    : "Reading time"
                }
                value={readingTime}
              />
              <View
                style={[
                  styles.helper,
                  {
                    backgroundColor: `${ACCENT}0D`,
                    borderColor: `${ACCENT}30`,
                  },
                ]}
              >
                <AppIcon color={ACCENT} decorative name="health" size={17} />
                <Text style={[styles.helperText, { color: theme.mutedText }]}>
                  {config.helper}
                </Text>
              </View>
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
                accessibilityLabel={`Cancel ${actionNoun}`}
                accessibilityRole="button"
                onPress={cancel}
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
                accessibilityHint="Validates required fields and saves this entry locally"
                accessibilityLabel={`Save ${actionNoun}`}
                accessibilityRole="button"
                onPress={save}
                style={({ pressed }) => [
                  styles.save,
                  { backgroundColor: theme.primary },
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function HealthLogSheetHeader({
  profileName,
  subtitle,
  title,
}: {
  profileName: string;
  subtitle: string;
  title: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: theme.text }]}
      >
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: theme.mutedText }]}>
        {subtitle}
      </Text>
      <View
        accessibilityLabel={`Active profile, ${profileName}, personal health log`}
        accessible
        style={[
          styles.profile,
          { backgroundColor: theme.primarySoft, borderColor: theme.border },
        ]}
      >
        <View style={[styles.profileIcon, { backgroundColor: theme.surface }]}>
          <AppIcon color={ACCENT} decorative name="profile" size={17} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={[styles.profileName, { color: theme.text }]}>
            {profileName}
          </Text>
          <Text style={[styles.profileMeta, { color: theme.mutedText }]}>
            Personal health log
          </Text>
        </View>
      </View>
    </View>
  );
}

function VitalsForm(props: {
  diastolic: string;
  errors: FieldErrors;
  heartRate: string;
  notes: string;
  oxygen: string;
  setDiastolic: (value: string) => void;
  setHeartRate: (value: string) => void;
  setNotes: (value: string) => void;
  setOxygen: (value: string) => void;
  setSystolic: (value: string) => void;
  systolic: string;
}) {
  return (
    <View style={styles.form}>
      {props.errors.vitals ? (
        <InlineValidation message={props.errors.vitals} />
      ) : null}
      <UnitInput
        accessibilityHint="Enter beats per minute"
        accessibilityLabel="Heart rate input, beats per minute"
        errorText={props.errors.heartRate}
        label="Heart rate"
        onChangeText={props.setHeartRate}
        placeholder="Optional"
        unit="bpm"
        value={props.heartRate}
      />
      <FieldGroup label="Blood pressure">
        <View style={styles.split}>
          <AppFormInput
            accessibilityLabel="Systolic blood pressure input"
            containerStyle={styles.splitInput}
            errorText={props.errors.bloodPressure}
            keyboardType="number-pad"
            label="Systolic"
            onChangeText={props.setSystolic}
            placeholder="Optional"
            value={props.systolic}
          />
          <AppFormInput
            accessibilityLabel="Diastolic blood pressure input"
            containerStyle={styles.splitInput}
            keyboardType="number-pad"
            label="Diastolic"
            onChangeText={props.setDiastolic}
            placeholder="Optional"
            value={props.diastolic}
          />
        </View>
        <Text style={styles.unitNote}>mmHg</Text>
      </FieldGroup>
      <UnitInput
        accessibilityHint="Enter oxygen percentage"
        accessibilityLabel="Oxygen level input, percent"
        errorText={props.errors.oxygen}
        label="Oxygen level"
        onChangeText={props.setOxygen}
        placeholder="Optional"
        unit="%"
        value={props.oxygen}
      />
      <AppFormInput
        accessibilityLabel="Vitals notes"
        label="Notes (optional)"
        multiline
        onChangeText={props.setNotes}
        placeholder="Add context for your records"
        returnKeyType="default"
        value={props.notes}
      />
    </View>
  );
}

function WeightForm({
  error,
  notes,
  setNotes,
  setWeight,
  weight,
}: {
  error?: string;
  notes: string;
  setNotes: (value: string) => void;
  setWeight: (value: string) => void;
  weight: string;
}) {
  return (
    <View style={styles.form}>
      <UnitInput
        accessibilityHint="Enter weight in kilograms"
        accessibilityLabel="Weight input, kilograms"
        errorText={error}
        label="Weight (required)"
        onChangeText={setWeight}
        placeholder="Enter weight"
        unit="kg"
        value={weight}
      />
      {/* TODO: Use profile unit settings for kg and lb support. */}
      <AppFormInput
        accessibilityLabel="Weight notes"
        label="Notes (optional)"
        multiline
        onChangeText={setNotes}
        placeholder="Add context for this entry"
        returnKeyType="default"
        value={notes}
      />
    </View>
  );
}

function NoteForm({
  category,
  details,
  error,
  setCategory,
  setDetails,
  setTitle,
  title,
}: {
  category: (typeof NOTE_CATEGORIES)[number];
  details: string;
  error?: string;
  setCategory: (value: (typeof NOTE_CATEGORIES)[number]) => void;
  setDetails: (value: string) => void;
  setTitle: (value: string) => void;
  title: string;
}) {
  return (
    <View style={styles.form}>
      <AppFormInput
        accessibilityLabel="Health note title"
        errorText={error}
        label="Note title (required)"
        onChangeText={setTitle}
        placeholder="What would you like to remember?"
        returnKeyType="next"
        value={title}
      />
      <AppFormInput
        accessibilityLabel="Health note details"
        label="Details (optional)"
        multiline
        onChangeText={setDetails}
        placeholder="Add useful context"
        returnKeyType="default"
        style={styles.detailsInput}
        value={details}
      />
      <ChipSelector
        label="Category"
        onSelect={setCategory}
        options={NOTE_CATEGORIES}
        selected={category}
      />
    </View>
  );
}

function TemperatureForm({
  error,
  method,
  notes,
  setMethod,
  setNotes,
  setTemperature,
  temperature,
}: {
  error?: string;
  method: (typeof TEMPERATURE_METHODS)[number];
  notes: string;
  setMethod: (value: (typeof TEMPERATURE_METHODS)[number]) => void;
  setNotes: (value: string) => void;
  setTemperature: (value: string) => void;
  temperature: string;
}) {
  return (
    <View style={styles.form}>
      <UnitInput
        accessibilityHint="Enter degrees Celsius"
        accessibilityLabel="Temperature input, degrees Celsius"
        errorText={error}
        label="Temperature (required)"
        onChangeText={setTemperature}
        placeholder="Enter temperature"
        unit="\u00B0C"
        value={temperature}
      />
      {/* TODO: Use profile unit settings for Celsius and Fahrenheit support. */}
      <ChipSelector
        label="Reading method"
        onSelect={setMethod}
        options={TEMPERATURE_METHODS}
        selected={method}
      />
      <AppFormInput
        accessibilityLabel="Temperature notes"
        label="Notes (optional)"
        multiline
        onChangeText={setNotes}
        placeholder="Add context for this reading"
        returnKeyType="default"
        value={notes}
      />
    </View>
  );
}

function UnitInput({
  accessibilityHint,
  accessibilityLabel,
  errorText,
  label,
  onChangeText,
  placeholder,
  unit,
  value,
}: {
  accessibilityHint: string;
  accessibilityLabel: string;
  errorText?: string;
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  unit: string;
  value: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.unitField}>
      <AppFormInput
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        errorText={errorText}
        keyboardType="decimal-pad"
        label={label}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.unitInput}
        value={value}
      />
      <View
        pointerEvents="none"
        style={[styles.unit, { backgroundColor: theme.primarySoft }]}
      >
        <Text style={[styles.unitText, { color: theme.primary }]}>{unit}</Text>
      </View>
    </View>
  );
}

function ChipSelector<T extends string>({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: T) => void;
  options: readonly T[];
  selected: T;
}) {
  const { theme } = useAppTheme();
  return (
    <FieldGroup label={label}>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = selected === option;
          return (
            <Pressable
              accessibilityLabel={`${option}, ${active ? "selected" : "not selected"}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? theme.primarySoft : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <Text
                style={[
                  styles.chipMark,
                  { color: active ? theme.primary : theme.mutedText },
                ]}
              >
                {active ? "Selected" : "-"}
              </Text>
              <Text
                style={[
                  styles.chipText,
                  { color: active ? theme.primary : theme.text },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FieldGroup>
  );
}

function ReadingTime({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <FieldGroup label={label}>
      <View
        accessibilityLabel={`${label}, ${value}`}
        accessible
        style={[
          styles.time,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <AppIcon color={ACCENT} decorative name="calendar_timeline" size={18} />
        <Text style={[styles.timeText, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.timeMeta, { color: theme.mutedText }]}>
          Current time
        </Text>
      </View>
    </FieldGroup>
  );
}

function InlineValidation({ message }: { message: string }) {
  const { theme } = useAppTheme();
  return (
    <Text
      accessibilityLiveRegion="polite"
      style={[styles.validation, { color: theme.warning }]}
    >
      {message}
    </Text>
  );
}

function FieldGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: theme.text }]}>{label}</Text>
      {children}
    </View>
  );
}

function validate(
  logType: GeneralHealthLogType,
  values: Record<string, string>,
): FieldErrors {
  const errors: FieldErrors = {};
  if (logType === "vitals") {
    const readings = [
      values.heartRate,
      values.systolic,
      values.diastolic,
      values.oxygen,
    ].filter((value) => value.trim());
    if (!readings.length)
      errors.vitals = "Add at least one reading before saving.";
    if (values.heartRate.trim() && !isPositive(values.heartRate))
      errors.heartRate = "Enter a valid number.";
    if (values.oxygen.trim() && !isPositive(values.oxygen))
      errors.oxygen = "Enter a valid number.";
    if (Boolean(values.systolic.trim()) !== Boolean(values.diastolic.trim()))
      errors.bloodPressure = "Complete both blood pressure fields.";
    if (
      values.systolic.trim() &&
      values.diastolic.trim() &&
      (!isPositive(values.systolic) || !isPositive(values.diastolic))
    )
      errors.bloodPressure = "Enter valid numbers for both fields.";
  }
  if (logType === "weight" && !values.weight.trim())
    errors.weight = "Enter a value before saving.";
  else if (logType === "weight" && !isPositive(values.weight))
    errors.weight = "Enter a valid positive number.";
  if (logType === "temperature" && !values.temperature.trim())
    errors.temperature = "Enter a value before saving.";
  else if (logType === "temperature" && !isPositive(values.temperature))
    errors.temperature = "Enter a valid positive number.";
  if (logType === "note" && !values.noteTitle.trim())
    errors.noteTitle = "Add a short title for this note.";
  return errors;
}

function isPositive(value: string) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

function formatReadingTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

function getActionNoun(logType: GeneralHealthLogType) {
  if (logType === "note") return "health note";
  if (logType === "temperature") return "temperature log";
  if (logType === "weight") return "weight log";
  return "vitals log";
}

const styles = StyleSheet.create({
  body: { gap: 20, paddingBottom: 24, paddingHorizontal: 20, paddingTop: 20 },
  cancel: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  cancelText: { fontWeight: "900" },
  chip: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipMark: { fontSize: 13, fontWeight: "900" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipText: { fontSize: 13, fontWeight: "900" },
  detailsInput: { minHeight: 120 },
  footer: {
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  form: { gap: 18 },
  group: { gap: 8 },
  groupLabel: { fontSize: 14, fontWeight: "900" },
  handle: {
    alignSelf: "center",
    borderRadius: 999,
    height: 4,
    marginTop: 10,
    width: 46,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  helper: {
    alignItems: "flex-start",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 13,
  },
  helperText: { flex: 1, fontSize: 12, lineHeight: 19 },
  keyboard: { flex: 1, justifyContent: "flex-end" },
  modal: { flex: 1, justifyContent: "flex-end" },
  pressed: { opacity: 0.74 },
  profile: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  profileCopy: { flex: 1 },
  profileIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  profileMeta: { fontSize: 12, marginTop: 2 },
  profileName: { fontSize: 14, fontWeight: "900" },
  save: {
    alignItems: "center",
    borderRadius: 16,
    flex: 1.4,
    justifyContent: "center",
    minHeight: 52,
  },
  saveText: { color: "#ffffff", fontWeight: "900" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(15,23,42,0.58)" },
  sheet: {
    alignSelf: "center",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
  },
  split: { flexDirection: "row", gap: 10 },
  splitInput: { flex: 1, minWidth: 0 },
  subtitle: { lineHeight: 20, marginTop: 5 },
  time: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  timeMeta: { fontSize: 11, marginLeft: "auto" },
  timeText: { flexShrink: 1, fontSize: 13, fontWeight: "900" },
  title: { fontSize: 21, fontWeight: "900" },
  unit: {
    borderRadius: 12,
    minWidth: 48,
    paddingHorizontal: 9,
    paddingVertical: 8,
    position: "absolute",
    right: 8,
    top: 38,
  },
  unitField: { position: "relative" },
  unitInput: { paddingRight: 70 },
  unitNote: { color: "#64748b", fontSize: 12, lineHeight: 18 },
  unitText: { fontSize: 12, fontWeight: "900", textAlign: "center" },
  validation: { fontSize: 12, fontWeight: "800", lineHeight: 18 },
});
