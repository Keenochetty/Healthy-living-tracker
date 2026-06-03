import { CalendarClock, Check, ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { formatReminderTime } from "@/lib/reminderStorage";
import type { MedicationItem, MedicationSchedule } from "@/types/medication";

type MedicationCardProps = {
  medication: MedicationItem;
  onMarkTaken: () => void;
  onOpen: () => void;
  onSchedule: () => void;
  schedule?: MedicationSchedule | null;
};

export function MedicationCard({
  medication,
  onMarkTaken,
  onOpen,
  onSchedule,
  schedule
}: MedicationCardProps) {
  const nextReminder = schedule?.reminderTimes.find((time) => time.enabled);
  const nextReminderDate = nextReminder
    ? new Date(`2026-01-01T${nextReminder.time}:00`)
    : null;

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#f1f5f9",
        borderRadius: 24,
        borderWidth: 1,
        gap: 12,
        padding: 15
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpen}
        style={{ alignItems: "center", flexDirection: "row", gap: 12 }}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#fff7ed",
            borderRadius: 18,
            height: 48,
            justifyContent: "center",
            width: 48
          }}
        >
          <Text style={{ color: "#f97316", fontWeight: "900" }}>Med</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
            {medication.name}
          </Text>
          {medication.dosage ? (
            <Text style={{ color: "#64748b", marginTop: 3 }}>{medication.dosage}</Text>
          ) : null}
          <Text style={{ color: medication.active ? "#059669" : "#64748b", marginTop: 3 }}>
            {medication.active ? "Active" : "Inactive"}
            {nextReminderDate ? ` - next ${formatReminderTime(nextReminderDate.toISOString())}` : ""}
          </Text>
        </View>

        <ChevronRight color="#94a3b8" size={20} />
      </TouchableOpacity>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <ActionButton
          icon={<Check color="#ffffff" size={16} />}
          label="Mark taken"
          onPress={onMarkTaken}
          primary
        />
        <ActionButton
          icon={<CalendarClock color="#7c3aed" size={16} />}
          label="Schedule"
          onPress={onSchedule}
        />
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  primary = false
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: primary ? "#7c3aed" : "#ede9fe",
        borderRadius: 14,
        flex: 1,
        flexDirection: "row",
        gap: 7,
        justifyContent: "center",
        minHeight: 42
      }}
    >
      {icon}
      <Text style={{ color: primary ? "#ffffff" : "#6d28d9", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
