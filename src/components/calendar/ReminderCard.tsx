import { Check, ChevronRight, CircleSlash } from "lucide-react-native";
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
};

export function ReminderCard({
  onComplete,
  onOpen,
  onSkip,
  reminder
}: ReminderCardProps) {
  const type = getReminderTypeDefinition(reminder.type);
  const isPending = reminder.status === "pending";

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
          <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
            {reminder.title}
          </Text>
          {reminder.notes ? (
            <Text style={{ color: "#64748b", lineHeight: 19, marginTop: 3 }}>
              {reminder.notes}
            </Text>
          ) : null}
        </View>

        <ChevronRight color="#94a3b8" size={20} />
      </TouchableOpacity>

      <View style={{ alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <ReminderTypeChip type={reminder.type} />
        <StatusChip color={PRIORITY_COLORS[reminder.priority]} label={PRIORITY_LABELS[reminder.priority]} />
        <StatusChip color={reminder.status === "pending" ? "#7c3aed" : "#64748b"} label={reminder.status} />
      </View>

      {isPending ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton
            icon={<Check color="#ffffff" size={16} />}
            label="Complete"
            onPress={onComplete}
            primary
          />
          <ActionButton
            icon={<CircleSlash color="#7c3aed" size={16} />}
            label="Skip"
            onPress={onSkip}
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
