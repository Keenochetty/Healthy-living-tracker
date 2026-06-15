import { Text, View } from "react-native";

import { getReminderTypeDefinition } from "@/constants/reminderTypes";
import type { ReminderType } from "@/types/reminders";

type ReminderTypeChipProps = {
  type: ReminderType;
};

export function ReminderTypeChip({ type }: ReminderTypeChipProps) {
  const definition = getReminderTypeDefinition(type);

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: `${definition.colour}18`,
        borderRadius: 999,
        flexDirection: "row",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{ color: definition.colour, fontSize: 11, fontWeight: "900" }}
      >
        {definition.emoji}
      </Text>
      <Text
        style={{ color: definition.colour, fontSize: 12, fontWeight: "800" }}
      >
        {definition.label}
      </Text>
    </View>
  );
}
