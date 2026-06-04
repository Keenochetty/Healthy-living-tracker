import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon } from "@/components/ui/AppIcon";
import type { AppIconName } from "@/constants/appIcons";
import {
  BIOMETRIC_TYPE_EMPTY_TEXT,
  BIOMETRIC_TYPE_LABELS,
  calculateBiometricTrend,
  createBiometricLog,
  createBloodGlucoseLog,
  createBloodPressureLog,
  createBodyMeasurementLog,
  createDigestionLog,
  createEnergyLog,
  createHeartRateLog,
  createMoodLog,
  createSleepLog,
  createSymptomLog,
  createWeightLog,
  deleteBiometricLog,
  formatBiometricLogValue,
  getBiometricDashboardSummary,
  getBiometricLogsByType
} from "@/lib/biometricsStorage";
import type {
  BiometricDashboardSummary,
  BiometricLog,
  BiometricTrend,
  BiometricType,
  BloodGlucoseTiming,
  SleepQuality
} from "@/types/biometrics";

const BIOMETRIC_TYPES: BiometricType[] = [
  "weight",
  "body_measurement",
  "sleep",
  "heart_rate",
  "blood_pressure",
  "blood_glucose",
  "energy",
  "mood",
  "digestion",
  "symptom"
];

const ENERGY_OPTIONS = ["Very low", "Low", "Okay", "Good", "Great"];
const MOOD_OPTIONS = ["Very low", "Low", "Okay", "Good", "Great", "Stressed", "Calm", "Tired", "Motivated"];
const DIGESTION_OPTIONS = ["Normal", "Bloated", "Constipated", "Loose stool", "Stomach pain", "Nausea", "Reflux", "Other"];
const SLEEP_QUALITY_OPTIONS: SleepQuality[] = ["poor", "okay", "good", "great"];
const GLUCOSE_TIMING_OPTIONS: BloodGlucoseTiming[] = ["fasting", "before_meal", "after_meal", "bedtime", "other"];

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 48,
  paddingHorizontal: 14
};

export default function BiometricsScreen() {
  const params = useLocalSearchParams<{ type?: BiometricType }>();
  const [summary, setSummary] = useState<BiometricDashboardSummary | null>(null);
  const [selectedType, setSelectedType] = useState<BiometricType | null>(
    params.type && BIOMETRIC_TYPES.includes(params.type) ? params.type : null
  );
  const [logs, setLogs] = useState<BiometricLog[]>([]);
  const [trend, setTrend] = useState<BiometricTrend | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadDashboard = useCallback(async () => {
    setSummary(await getBiometricDashboardSummary());
  }, []);

  const loadType = useCallback(async (type: BiometricType) => {
    const [nextLogs, nextTrend] = await Promise.all([
      getBiometricLogsByType(type),
      calculateBiometricTrend(type)
    ]);

    setLogs(nextLogs);
    setTrend(nextTrend);
  }, []);

  useEffect(() => {
    Promise.resolve()
      .then(loadDashboard)
      .catch(() => undefined);
  }, [loadDashboard]);

  useEffect(() => {
    if (!selectedType) return;

    Promise.resolve()
      .then(() => loadType(selectedType))
      .catch(() => undefined);
  }, [loadType, selectedType]);

  async function refreshAll(type = selectedType) {
    await loadDashboard();
    if (type) await loadType(type);
  }

  if (selectedType) {
    return (
      <ScreenWrapper backgroundColor="#fffaf0">
        <View style={{ gap: 4 }}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => setSelectedType(null)}>
            <Text style={{ color: "#92400e", fontWeight: "900" }}>Back to biometrics</Text>
          </TouchableOpacity>
          <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
            {BIOMETRIC_TYPE_LABELS[selectedType]}
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20 }}>
            Latest values, simple trends and recent notes.
          </Text>
        </View>

        <BiometricDetail
          logs={logs}
          onDeleted={async (id) => {
            await deleteBiometricLog(id);
            await refreshAll(selectedType);
          }}
          onSaved={async () => {
            setShowForm(false);
            await refreshAll(selectedType);
          }}
          showForm={showForm}
          trend={trend}
          type={selectedType}
          onAdd={() => setShowForm((value) => !value)}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>Health realm</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>Biometrics</Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Track body, recovery, energy and symptoms with calm manual logs.
        </Text>
      </View>

      <AppCard backgroundColor="#eff6ff">
        <Text style={{ color: "#1d4ed8", fontWeight: "900" }}>Personal tracking only</Text>
        <Text style={{ color: "#334155", lineHeight: 21, marginTop: 6 }}>
          Biometric logs are for personal tracking only and are not a diagnosis. For concerning
          symptoms, unusual readings, pregnancy, children, medication concerns, or medical
          conditions, speak to a healthcare professional.
        </Text>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {(summary?.items ?? []).map((item) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={item.type}
            onPress={() => {
              setSelectedType(item.type);
              setShowForm(false);
            }}
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#fde68a",
              borderRadius: 20,
              borderWidth: 1,
              flexGrow: 1,
              minHeight: 164,
              minWidth: "45%",
              padding: 14
            }}
          >
            <AppIcon color={getTypeColor(item.type)} container containerVariant="white" name={getTypeIcon(item.type)} size={21} />
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900", marginTop: 10 }}>
              {item.title}
            </Text>
            <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900", marginTop: 6 }}>
              {item.latestDisplay}
            </Text>
            <Text style={{ color: "#64748b", lineHeight: 19, marginTop: 5 }}>
              {item.latestLoggedAt ? `Last logged ${formatRelativeDate(item.latestLoggedAt)}` : item.emptyText}
            </Text>
            <Text style={{ color: "#92400e", fontWeight: "900", marginTop: 10 }}>Add Log</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

function BiometricDetail({
  logs,
  onAdd,
  onDeleted,
  onSaved,
  showForm,
  trend,
  type
}: {
  logs: BiometricLog[];
  onAdd: () => void;
  onDeleted: (id: string) => void;
  onSaved: () => void;
  showForm: boolean;
  trend: BiometricTrend | null;
  type: BiometricType;
}) {
  const latest = logs[0];

  return (
    <View style={{ gap: 14 }}>
      <AppCard>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#64748b", fontWeight: "900" }}>Latest</Text>
              <Text style={{ color: "#0f172a", fontSize: 24, fontWeight: "900", marginTop: 4 }}>
                {latest ? formatBiometricLogValue(latest) : "No log"}
              </Text>
              <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 5 }}>
                {latest ? `Last logged ${formatRelativeDate(latest.loggedAt)}` : BIOMETRIC_TYPE_EMPTY_TEXT[type]}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onAdd}
              style={{
                alignItems: "center",
                backgroundColor: "#f59e0b",
                borderRadius: 16,
                justifyContent: "center",
                paddingHorizontal: 14
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "900" }}>{showForm ? "Close" : "Add Log"}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <MetricTile label="7-day average" value={formatTrendAverage(trend?.sevenDayAverage, trend?.unit, type)} />
            <MetricTile label="30-day average" value={formatTrendAverage(trend?.thirtyDayAverage, trend?.unit, type)} />
            <MetricTile label="Change" value={formatTrendAverage(trend?.changeSinceLastLog, trend?.unit, type)} />
            <MetricTile label="Range" value={formatRange(trend)} />
          </View>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>{trend?.message ?? BIOMETRIC_TYPE_EMPTY_TEXT[type]}</Text>
        </View>
      </AppCard>

      {showForm ? <BiometricForm type={type} onSaved={onSaved} /> : null}

      {(type === "blood_pressure" || type === "blood_glucose") ? (
        <AppCard backgroundColor="#fff7ed">
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>
            Follow guidance from your healthcare professional when interpreting blood pressure or glucose readings.
          </Text>
        </AppCard>
      ) : null}

      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>Recent logs</Text>
          {logs.length ? (
            logs.slice(0, 12).map((log) => (
              <View key={log.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, gap: 6, padding: 12 }}>
                <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0f172a", fontWeight: "900" }}>{formatBiometricLogValue(log)}</Text>
                    <Text style={{ color: "#64748b", marginTop: 3 }}>{new Date(log.loggedAt).toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => onDeleted(log.id)}>
                    <Text style={{ color: "#dc2626", fontWeight: "900" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
                {log.notes ? <Text style={{ color: "#64748b", lineHeight: 20 }}>{log.notes}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={{ color: "#64748b", lineHeight: 21 }}>Add your first log to start seeing trends.</Text>
          )}
        </View>
      </AppCard>
    </View>
  );
}

function BiometricForm({ onSaved, type }: { onSaved: () => void; type: BiometricType }) {
  const [notes, setNotes] = useState("");
  const [loggedAt, setLoggedAt] = useState(() => new Date().toISOString());
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [tertiary, setTertiary] = useState("");
  const [quaternary, setQuaternary] = useState("");
  const [quinary, setQuinary] = useState("");
  const [senary, setSenary] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [quality, setQuality] = useState<SleepQuality>("okay");
  const [timing, setTiming] = useState<BloodGlucoseTiming>("fasting");
  const [unit, setUnit] = useState<"mmol/L" | "mg/dL">("mmol/L");
  const [label, setLabel] = useState(getDefaultLabel(type));

  const canSave = useMemo(() => {
    if (type === "energy" || type === "mood" || type === "digestion") return Boolean(label.trim());
    if (type === "symptom") return Boolean(label.trim()) && Number(primary) > 0;
    return Number(primary) > 0;
  }, [label, primary, type]);

  async function save() {
    const loggedAtValue = loggedAt.trim() || new Date().toISOString();

    switch (type) {
      case "weight":
        await createWeightLog({ loggedAt: loggedAtValue, notes, weightKg: Number(primary) });
        break;
      case "body_measurement":
        await createBodyMeasurementLog({
          armCm: Number(tertiary) || undefined,
          bodyFatPercentage: Number(quinary) || undefined,
          chestCm: Number(secondary) || undefined,
          hipCm: Number(senary) || undefined,
          loggedAt: loggedAtValue,
          notes,
          thighCm: Number(quaternary) || undefined,
          waistCm: Number(primary) || undefined
        });
        break;
      case "sleep":
        await createSleepLog({
          durationMinutes: Math.round((Number(primary) || 0) * 60 + (Number(secondary) || 0)),
          bedtime: bedtime.trim() || undefined,
          loggedAt: loggedAtValue,
          notes,
          sleepQuality: quality,
          wakeTime: wakeTime.trim() || undefined
        });
        break;
      case "heart_rate":
        await createHeartRateLog(Number(primary), Number(secondary) || undefined, notes, loggedAtValue);
        break;
      case "blood_pressure":
        await createBloodPressureLog({
          diastolic: Number(secondary),
          loggedAt: loggedAtValue,
          notes,
          pulse: Number(tertiary) || undefined,
          systolic: Number(primary)
        });
        break;
      case "blood_glucose":
        await createBloodGlucoseLog({
          glucoseValue: Number(primary),
          loggedAt: loggedAtValue,
          notes,
          timing,
          unit
        });
        break;
      case "energy":
        await createEnergyLog(label, notes, loggedAtValue);
        break;
      case "mood":
        await createMoodLog(label, notes, loggedAtValue);
        break;
      case "digestion":
        await createDigestionLog(label, notes, loggedAtValue);
        break;
      case "symptom":
        await createSymptomLog(label, Math.min(10, Math.max(1, Number(primary) || 1)), notes, loggedAtValue);
        break;
      default:
        await createBiometricLog({ label, loggedAt: loggedAtValue, notes, type });
    }

    setNotes("");
    setPrimary("");
    setSecondary("");
    setTertiary("");
    setQuaternary("");
    setQuinary("");
    setSenary("");
    setBedtime("");
    setWakeTime("");
    onSaved();
  }

  return (
    <AppCard backgroundColor="#fffbeb">
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Add {BIOMETRIC_TYPE_LABELS[type]}
        </Text>

        {type === "energy" ? (
          <OptionSelector options={ENERGY_OPTIONS} selected={label} onSelect={setLabel} />
        ) : null}

        {type === "mood" ? (
          <OptionSelector options={MOOD_OPTIONS} selected={label} onSelect={setLabel} />
        ) : null}

        {type === "digestion" ? (
          <OptionSelector options={DIGESTION_OPTIONS} selected={label} onSelect={setLabel} />
        ) : null}

        {type === "symptom" ? (
          <>
            <Field label="Symptom name" onChangeText={setLabel} value={label} />
            <Field keyboardType="numeric" label="Severity 1 to 10" onChangeText={setPrimary} value={primary} />
          </>
        ) : null}

        {type === "weight" ? <Field keyboardType="numeric" label="Weight kg" onChangeText={setPrimary} value={primary} /> : null}

        {type === "body_measurement" ? (
          <>
            <Field keyboardType="numeric" label="Waist cm" onChangeText={setPrimary} value={primary} />
            <Field keyboardType="numeric" label="Chest cm" onChangeText={setSecondary} value={secondary} />
            <Field keyboardType="numeric" label="Arm cm" onChangeText={setTertiary} value={tertiary} />
            <Field keyboardType="numeric" label="Thigh cm" onChangeText={setQuaternary} value={quaternary} />
            <Field keyboardType="numeric" label="Hip cm optional" onChangeText={setSenary} value={senary} />
            <Field keyboardType="numeric" label="Body fat percentage optional" onChangeText={setQuinary} value={quinary} />
            <Text style={{ color: "#64748b", lineHeight: 20 }}>Progress photo placeholder is prepared for later.</Text>
          </>
        ) : null}

        {type === "sleep" ? (
          <>
            <Field keyboardType="numeric" label="Sleep hours" onChangeText={setPrimary} value={primary} />
            <Field keyboardType="numeric" label="Sleep minutes" onChangeText={setSecondary} value={secondary} />
            <OptionSelector options={SLEEP_QUALITY_OPTIONS} selected={quality} onSelect={(value) => setQuality(value as SleepQuality)} />
            <Field label="Bedtime optional" onChangeText={setBedtime} value={bedtime} />
            <Field label="Wake time optional" onChangeText={setWakeTime} value={wakeTime} />
          </>
        ) : null}

        {type === "heart_rate" ? (
          <>
            <Field keyboardType="numeric" label="Resting heart rate bpm" onChangeText={setPrimary} value={primary} />
            <Field keyboardType="numeric" label="Active heart rate optional" onChangeText={setSecondary} value={secondary} />
          </>
        ) : null}

        {type === "blood_pressure" ? (
          <>
            <Field keyboardType="numeric" label="Systolic" onChangeText={setPrimary} value={primary} />
            <Field keyboardType="numeric" label="Diastolic" onChangeText={setSecondary} value={secondary} />
            <Field keyboardType="numeric" label="Pulse optional" onChangeText={setTertiary} value={tertiary} />
          </>
        ) : null}

        {type === "blood_glucose" ? (
          <>
            <Field keyboardType="numeric" label="Glucose value" onChangeText={setPrimary} value={primary} />
            <OptionSelector options={["mmol/L", "mg/dL"]} selected={unit} onSelect={(value) => setUnit(value as "mmol/L" | "mg/dL")} />
            <OptionSelector options={GLUCOSE_TIMING_OPTIONS} selected={timing} onSelect={(value) => setTiming(value as BloodGlucoseTiming)} />
          </>
        ) : null}

        <Field label="Logged at" onChangeText={setLoggedAt} value={loggedAt} />
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Notes"
          placeholderTextColor="#94a3b8"
          style={{ ...INPUT_STYLE, minHeight: 88, paddingTop: 12 }}
          value={notes}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canSave}
          onPress={save}
          style={{
            alignItems: "center",
            backgroundColor: "#f59e0b",
            borderRadius: 18,
            justifyContent: "center",
            minHeight: 52,
            opacity: canSave ? 1 : 0.55
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save log</Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

function OptionSelector({
  onSelect,
  options,
  selected
}: {
  onSelect: (value: string) => void;
  options: string[];
  selected: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((option) => (
        <TouchableOpacity
          activeOpacity={0.85}
          key={option}
          onPress={() => onSelect(option)}
          style={{
            backgroundColor: selected === option ? "#f59e0b" : "#ffffff",
            borderColor: "#fde68a",
            borderRadius: 999,
            borderWidth: 1,
            paddingHorizontal: 12,
            paddingVertical: 9
          }}
        >
          <Text style={{ color: selected === option ? "#ffffff" : "#92400e", fontWeight: "900" }}>
            {formatOptionLabel(option)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function Field({
  keyboardType,
  label,
  onChangeText,
  value
}: {
  keyboardType?: "default" | "numeric";
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#94a3b8"
        style={INPUT_STYLE}
        value={value}
      />
    </View>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#fde68a",
        borderRadius: 16,
        borderWidth: 1,
        flexGrow: 1,
        minWidth: "45%",
        padding: 12
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 12, fontWeight: "900" }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function getDefaultLabel(type: BiometricType) {
  switch (type) {
    case "energy":
    case "mood":
      return "Okay";
    case "digestion":
      return "Normal";
    default:
      return "";
  }
}

function getTypeIcon(type: BiometricType): AppIconName {
  switch (type) {
    case "weight":
    case "body_measurement":
      return "weight";
    case "sleep":
      return "sleep";
    case "energy":
    case "heart_rate":
    case "blood_pressure":
    case "blood_glucose":
      return "vitals";
    case "mood":
      return "mood";
    default:
      return "health";
  }
}

function getTypeColor(type: BiometricType) {
  switch (type) {
    case "sleep":
      return "#7c3aed";
    case "energy":
      return "#f59e0b";
    case "mood":
      return "#ec4899";
    case "blood_pressure":
    case "heart_rate":
      return "#ef4444";
    case "blood_glucose":
      return "#14b8a6";
    default:
      return "#3b82f6";
  }
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) return "today";

  return date.toLocaleDateString();
}

function formatTrendAverage(value: number | undefined, unit: string | undefined, type: BiometricType) {
  if (value === undefined) return "No data";
  if (type === "sleep") return formatDuration(value);

  return `${Math.round(value * 10) / 10}${unit ? ` ${unit}` : ""}`;
}

function formatRange(trend: BiometricTrend | null) {
  if (!trend?.highestValue || !trend.lowestValue) return "No data";

  return `${trend.lowestValue} - ${trend.highestValue}${trend.unit ? ` ${trend.unit}` : ""}`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  return `${hours}h ${remainingMinutes}m`;
}

function formatOptionLabel(value: string) {
  return value
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
