import { Bell } from "lucide-react-native";
import { ReactNode } from "react";
import { Text, View } from "react-native";

import { fontSizes, spacing } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";
import { AppAvatar } from "./AppAvatar";
import { AppIconButton } from "./AppIconButton";

type AppHeaderProps = {
  avatarInitials?: string;
  compact?: boolean;
  rightSlot?: ReactNode;
  showNotificationIcon?: boolean;
  subtitle?: string;
  title: string;
};

export function AppHeader({
  avatarInitials,
  compact = false,
  rightSlot,
  showNotificationIcon = false,
  subtitle,
  title
}: AppHeaderProps) {
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
      <View style={{ flex: 1 }}>
        {subtitle ? (
          <Text style={{ color: theme.mutedText, fontSize: fontSizes.sm, marginBottom: 3 }}>
            {subtitle}
          </Text>
        ) : null}
        <Text
          style={{
            color: theme.text,
            fontSize: compact ? fontSizes.xl : fontSizes["2xl"],
            fontWeight: "900"
          }}
        >
          {title}
        </Text>
      </View>

      {rightSlot}
      {showNotificationIcon ? (
        <AppIconButton icon={<Bell size={21} />} onPress={() => undefined} />
      ) : null}
      {avatarInitials ? <AppAvatar initials={avatarInitials} size={44} /> : null}
    </View>
  );
}
