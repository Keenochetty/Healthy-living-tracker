import { Text, View } from "react-native";

import { formatDateLabel, formatReminderTime } from "@/lib/reminderStorage";
import type { AppReminder } from "@/types/reminders";
import { ReminderCard } from "./ReminderCard";

type DayTimelineProps = {
  date: Date;
  onComplete: (reminder: AppReminder) => void;
  onOpen: (reminder: AppReminder) => void;
  onSkip: (reminder: AppReminder) => void;
  reminders: AppReminder[];
};

export function DayTimeline({
  date,
  onComplete,
  onOpen,
  onSkip,
  reminders
}: DayTimelineProps) {
  const groupedReminders = reminders.reduce<Record<string, AppReminder[]>>(
    (groups, reminder) => {
      const time = formatReminderTime(reminder.dueAt);

      return {
        ...groups,
        [time]: [...(groups[time] ?? []), reminder]
      };
    },
    {}
  );
  const times = Object.keys(groupedReminders);

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>
          {formatDateLabel(date)}
        </Text>
        <Text style={{ color: "#64748b", marginTop: 3 }}>
          {reminders.length} reminder{reminders.length === 1 ? "" : "s"} planned
        </Text>
      </View>

      {times.length ? (
        times.map((time) => (
          <View key={time} style={{ gap: 8 }}>
            <Text style={{ color: "#64748b", fontSize: 13, fontWeight: "900" }}>
              {time}
            </Text>
            {groupedReminders[time].map((reminder) => (
              <ReminderCard
                key={reminder.id}
                onComplete={() => onComplete(reminder)}
                onOpen={() => onOpen(reminder)}
                onSkip={() => onSkip(reminder)}
                reminder={reminder}
              />
            ))}
          </View>
        ))
      ) : (
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: 18
          }}
        >
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            Nothing planned yet. Add a reminder to shape your day.
          </Text>
        </View>
      )}
    </View>
  );
}
