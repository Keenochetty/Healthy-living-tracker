import { StyleSheet, Text, View } from "react-native";

import {
  getNotificationColorToken,
  type NotificationType
} from "@/constants/notification-colors";
import { componentRadius } from "@/constants/radius";
import { spacing } from "@/constants/spacing";

type NotificationBadgeProps = {
  count?: number;
  label?: string;
  type: NotificationType;
};

export function NotificationBadge({ count, label, type }: NotificationBadgeProps) {
  const token = getNotificationColorToken(type);
  const text = label ?? (typeof count === "number" ? String(count) : token.meaning);

  return (
    <View
      accessibilityLabel={token.meaning}
      style={[
        styles.badge,
        {
          backgroundColor: token.backgroundColor,
          borderColor: token.borderColor
        }
      ]}
    >
      <View style={[styles.dot, { backgroundColor: token.accentColor }]} />
      <Text style={[styles.text, { color: token.textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: componentRadius.chip,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8
  },
  text: {
    fontSize: 13,
    fontWeight: "700"
  }
});
