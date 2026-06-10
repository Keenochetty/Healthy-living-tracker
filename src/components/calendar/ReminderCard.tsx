import { Check, ChevronRight, CircleSlash } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  getReminderTypeDefinition
} from "@/constants/reminderTypes";
import { formatReminderTime } from "@/lib/reminderStorage";
import type { AppReminder } from "@/types/reminders";
import { ReminderTypeChip } from "./ReminderTypeChip";

type ReminderCardProps = {
  onComplete: () => void;
  onOpen: () => void;
  onSkip: () => void;
  reminder: AppReminder;
  variant?: "dark" | "light";
};

export function ReminderCard({
  onComplete,
  onOpen,
  onSkip,
  reminder,
  variant = "dark"
}: ReminderCardProps) {
  const type = getReminderTypeDefinition(reminder.type);
  const isPending = reminder.status === "pending";
  const light = variant === "light";

  return (
    <View
      style={{
        backgroundColor: light ? "#ffffff" : "rgba(255,255,255,0.08)",
        borderColor: light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.12)",
        borderRadius: 14,
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
            backgroundColor: `${type.colour}18`,
            borderRadius: 18,
            height: 50,
            justifyContent: "center",
            width: 56
          }}
        >
          <Text style={{ color: type.colour, fontSize: 13, fontWeight: "900" }}>
            {formatReminderTime(reminder.dueAt)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: light ? "#0f172a" : "#f8fafc", fontSize: 16, fontWeight: "900" }}>
            {reminder.title}
          </Text>
          {reminder.notes ? (
            <Text style={{ color: light ? "#64748b" : "#cbd5e1", lineHeight: 19, marginTop: 3 }}>
              {reminder.notes}
            </Text>
          ) : null}
        </View>

        <ChevronRight color="#94a3b8" size={20} />
      </TouchableOpacity>

      <View style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <ReminderTypeChip type={reminder.type} />
        <StatusChip color={PRIORITY_COLORS[reminder.priority]} label={PRIORITY_LABELS[reminder.priority]} />
        <StatusChip color={reminder.status === "pending" ? "#6ee7c8" : "#94a3b8"} label={getStatusLabel(reminder.status)} />
      </View>

      {isPending ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton
            icon={<Check color="#10201d" size={16} />}
            label="Complete"
            onPress={onComplete}
            primary
          />
          <ActionButton
            icon={<CircleSlash color="#e2e8f0" size={16} />}
            label="Skip"
            onPress={onSkip}
            light={light}
          />
        </View>
      ) : null}
    </View>
  );
}

function StatusChip({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={{
        backgroundColor: `${color}18`,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: "800", textTransform: "capitalize" }}>
        {label}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  light = false,
  label,
  onPress,
  primary = false
}: {
  icon: ReactNode;
  light?: boolean;
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
        backgroundColor: primary ? "#6ee7c8" : light ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.10)",
        borderColor: primary ? "#6ee7c8" : light ? "rgba(15,23,42,0.10)" : "rgba(255,255,255,0.14)",
        borderWidth: 1,
        borderRadius: 14,
        flex: 1,
        flexDirection: "row",
        gap: 7,
        justifyContent: "center",
        minHeight: 42
      }}
    >
      {icon}
      <Text style={{ color: primary ? "#10201d" : light ? "#334155" : "#e2e8f0", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function getStatusLabel(status: AppReminder["status"]) {
  if (status === "completed") return "Completed";
  if (status === "skipped") return "Later";
  if (status === "cancelled") return "Cancelled";
  return "Planned";
}
