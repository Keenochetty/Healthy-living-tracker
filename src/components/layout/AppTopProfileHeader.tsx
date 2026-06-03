import { Bell, CalendarDays } from "lucide-react-native";
import { ReactNode } from "react";
import { Text, View } from "react-native";

import { AppAvatar, AppIconButton } from "@/components/ui";
import { fontSizes, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppTopProfileHeaderProps = {
  avatarInitials: string;
  avatarUri?: string;
  greeting?: string;
  onNotificationPress?: () => void;
  onQuickActionPress?: () => void;
  rightActions?: ReactNode;
  showNotification?: boolean;
  showQuickAction?: boolean;
  userName: string;
};

export function AppTopProfileHeader({
  avatarInitials,
  avatarUri,
  greeting = "Welcome back,",
  onNotificationPress,
  onQuickActionPress,
  rightActions,
  showNotification = true,
  showQuickAction = true,
  userName
}: AppTopProfileHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.md,
        justifyContent: "space-between"
      }}
    >
      <View style={{ alignItems: "center", flex: 1, flexDirection: "row", gap: spacing.md }}>
        <AppAvatar imageUri={avatarUri} initials={avatarInitials} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.mutedText, fontSize: fontSizes.sm, fontWeight: "700" }}>
            {greeting}
          </Text>
          <Text style={{ color: theme.text, fontSize: fontSizes.lg, fontWeight: "900", marginTop: 2 }}>
            {userName}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}>
        {rightActions}
        {showNotification ? (
          <AppIconButton
            icon={<Bell size={19} />}
            onPress={onNotificationPress ?? (() => undefined)}
            variant="default"
          />
        ) : null}
        {showQuickAction ? (
          <AppIconButton
            icon={<CalendarDays size={19} />}
            onPress={onQuickActionPress ?? (() => undefined)}
            variant="default"
          />
        ) : null}
      </View>
    </View>
  );
}
