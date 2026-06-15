import DateTimePicker from "@react-native-community/datetimepicker";
import { Plus, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  createDefaultScheduleForMedication,
  saveMedicationSchedule,
} from "@/lib/medicationStorage";
import type {
  MedicationFrequency,
  MedicationItem,
  MedicationReminderTime,
  MedicationSchedule,
} from "@/types/medication";

type MedicationScheduleCardProps = {
  medication: MedicationItem;
  onSaved: (schedule: MedicationSchedule) => void;
  schedule?: MedicationSchedule;
};

const FREQUENCY_OPTIONS: Array<{ key: MedicationFrequency; label: string }> = [
  { key: "once", label: "Once" },
  { key: "daily", label: "Daily" },
  { key: "twice_daily", label: "Twice daily" },
  { key: "three_times_daily", label: "Three times daily" },
  { key: "custom", label: "Custom" },
];

function defaultTimes(frequency: MedicationFrequency) {
  if (frequency === "twice_daily") return ["08:00", "20:00"];
  if (frequency === "three_times_daily") return ["08:00", "14:00", "20:00"];
  return ["08:00"];
}

function timeToDate(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hour || 0, minute || 0, 0, 0);

  return date;
}

function dateToTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function buildTimes(
  frequency: MedicationFrequency,
  currentTimes: MedicationReminderTime[],
) {
  if (frequency === "custom") {
    return currentTimes.length ? currentTimes : createTimes(["08:00"]);
  }

  return createTimes(defaultTimes(frequency));
}

function createTimes(times: string[]): MedicationReminderTime[] {
  return times.map((time, index) => ({
    enabled: true,
    id: `time-${index}-${time}`,
    time,
  }));
}

export function MedicationScheduleCard({
  medication,
  onSaved,
  schedule,
}: MedicationScheduleCardProps) {
  const [localSchedule, setLocalSchedule] = useState<MedicationSchedule | null>(
    schedule ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const currentSchedule = useMemo(
    () => localSchedule ?? schedule,
    [localSchedule, schedule],
  );

  async function ensureSchedule() {
    if (currentSchedule) {
      return currentSchedule;
    }

    const defaultSchedule = await createDefaultScheduleForMedication(
      medication.id,
    );

    setLocalSchedule(defaultSchedule);

    return defaultSchedule;
  }

  async function updateFrequency(frequency: MedicationFrequency) {
    const nextSchedule = await ensureSchedule();

    setLocalSchedule({
      ...nextSchedule,
      frequency,
      reminderTimes: buildTimes(frequency, nextSchedule.reminderTimes),
    });
  }

  async function updateSchedule(partial: Partial<MedicationSchedule>) {
    const nextSchedule = await ensureSchedule();

    setLocalSchedule({
      ...nextSchedule,
      ...partial,
    });
  }

  async function saveSchedule() {
    const nextSchedule = await ensureSchedule();

    setIsSaving(true);

    try {
      const savedSchedule = await saveMedicationSchedule(nextSchedule);

      setLocalSchedule(savedSchedule);
      onSaved(savedSchedule);
    } finally {
      setIsSaving(false);
    }
  }

  const visibleSchedule = currentSchedule;

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 24,
        gap: 14,
        padding: 16,
      }}
    >
      <View>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Medication schedule
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
          Set reminders from what you entered. This app does not suggest dosage.
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FREQUENCY_OPTIONS.map((option) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={option.key}
            onPress={() => updateFrequency(option.key)}
            style={{
              backgroundColor:
                visibleSchedule?.frequency === option.key
                  ? "#7c3aed"
                  : "#f8fafc",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 9,
            }}
          >
            <Text
              style={{
                color:
                  visibleSchedule?.frequency === option.key
                    ? "#ffffff"
                    : "#475569",
                fontWeight: "900",
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(visibleSchedule?.reminderTimes ?? []).map((reminderTime, index) => (
        <View
          key={reminderTime.id}
          style={{
            alignItems: "center",
            backgroundColor: "#f8fafc",
            borderRadius: 18,
            flexDirection: "row",
            gap: 10,
            padding: 12,
          }}
        >
          <Switch
            onValueChange={(enabled) => {
              const reminderTimes = [...(visibleSchedule?.reminderTimes ?? [])];

              reminderTimes[index] = { ...reminderTime, enabled };
              updateSchedule({ reminderTimes });
            }}
            value={reminderTime.enabled}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#64748b", fontWeight: "800" }}>
              Reminder time
            </Text>
            <DateTimePicker
              is24Hour
              mode="time"
              onChange={(_, selectedDate) => {
                if (!selectedDate || !visibleSchedule) return;

                const reminderTimes = [...visibleSchedule.reminderTimes];

                reminderTimes[index] = {
                  ...reminderTime,
                  time: dateToTime(selectedDate),
                };
                updateSchedule({ reminderTimes });
              }}
              value={timeToDate(reminderTime.time)}
            />
          </View>
          {visibleSchedule?.frequency === "custom" ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                const reminderTimes = (
                  visibleSchedule?.reminderTimes ?? []
                ).filter((time) => time.id !== reminderTime.id);

                updateSchedule({ reminderTimes });
              }}
            >
              <Trash2 color="#dc2626" size={18} />
            </TouchableOpacity>
          ) : null}
        </View>
      ))}

      {visibleSchedule?.frequency === "custom" ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            updateSchedule({
              reminderTimes: [
                ...(visibleSchedule.reminderTimes ?? []),
                {
                  enabled: true,
                  id: `custom-${Date.now()}`,
                  time: "08:00",
                },
              ],
            })
          }
          style={{
            alignItems: "center",
            backgroundColor: "#ede9fe",
            borderRadius: 16,
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            minHeight: 44,
          }}
        >
          <Plus color="#7c3aed" size={17} />
          <Text style={{ color: "#6d28d9", fontWeight: "900" }}>Add time</Text>
        </TouchableOpacity>
      ) : null}

      <ToggleRow
        label="Take with food"
        onValueChange={(takeWithFood) => updateSchedule({ takeWithFood })}
        value={Boolean(visibleSchedule?.takeWithFood)}
      />
      <ToggleRow
        label="Schedule active"
        onValueChange={(active) => updateSchedule({ active })}
        value={visibleSchedule?.active ?? true}
      />

      <TextInput
        multiline
        onChangeText={(instructions) => updateSchedule({ instructions })}
        placeholder="Instructions you entered, optional"
        placeholderTextColor="#94a3b8"
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: 18,
          color: "#0f172a",
          minHeight: 80,
          padding: 14,
        }}
        value={visibleSchedule?.instructions ?? ""}
      />

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isSaving}
        onPress={saveSchedule}
        style={{
          alignItems: "center",
          backgroundColor: "#7c3aed",
          borderRadius: 18,
          justifyContent: "center",
          minHeight: 52,
          opacity: isSaving ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
          {isSaving ? "Saving schedule..." : "Save schedule"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ToggleRow({
  label,
  onValueChange,
  value,
}: {
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderRadius: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 14,
      }}
    >
      <Text style={{ color: "#0f172a", fontWeight: "900" }}>{label}</Text>
      <Switch onValueChange={onValueChange} value={value} />
    </View>
  );
}
