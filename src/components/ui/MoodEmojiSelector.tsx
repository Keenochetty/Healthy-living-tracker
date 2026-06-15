import { Pressable, Text, View } from "react-native";

import { radius, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

export type MoodKey = "great" | "good" | "okay" | "tired" | "low" | "stressed";

type MoodEmojiSelectorProps = {
  compact?: boolean;
  onSelect: (mood: MoodKey) => void;
  selectedMood: MoodKey;
};

const moods: Array<{ emoji: string; key: MoodKey; label: string }> = [
  { emoji: "😄", key: "great", label: "Great" },
  { emoji: "🙂", key: "good", label: "Good" },
  { emoji: "😐", key: "okay", label: "Okay" },
  { emoji: "😴", key: "tired", label: "Tired" },
  { emoji: "😔", key: "low", label: "Low" },
  { emoji: "😣", key: "stressed", label: "Stressed" },
];

export function MoodEmojiSelector({
  compact = false,
  onSelect,
  selectedMood,
}: MoodEmojiSelectorProps) {
  const { theme } = useAppTheme();

  return (
    <View style={{ flexDirection: "row", gap: spacing.sm }}>
      {moods.map((mood) => {
        const selected = selectedMood === mood.key;

        return (
          <Pressable
            key={mood.key}
            onPress={() => onSelect(mood.key)}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: selected
                ? theme.primary
                : (theme.surfaceSoft ?? theme.surface),
              borderColor: selected ? theme.primary : theme.border,
              borderRadius: radius.full,
              borderWidth: 1,
              elevation: selected ? 4 : 0,
              gap: 3,
              minWidth: compact ? 45 : 54,
              opacity: pressed ? 0.84 : 1,
              paddingHorizontal: compact ? spacing.sm : spacing.md,
              paddingVertical: spacing.sm,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: selected ? 0.16 : 0,
              shadowRadius: 12,
            })}
          >
            <Text style={{ fontSize: compact ? 20 : 24 }}>{mood.emoji}</Text>
            {!compact ? (
              <Text
                style={{
                  color: selected ? "#171b22" : theme.mutedText,
                  fontSize: 11,
                  fontWeight: "900",
                }}
              >
                {mood.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
