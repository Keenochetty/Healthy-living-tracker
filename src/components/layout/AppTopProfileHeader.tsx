import { Bell, CalendarDays } from "lucide-react-native";
import { ReactNode } from "react";
import { View } from "react-native";

import { HealthSyncIdentityControl } from "@/components/identity";
import { AppIconButton } from "@/components/ui";
import { spacing } from "@/theme/tokens";

type AppTopProfileHeaderProps = {
  avatarInitials: string;
  avatarUri?: string;
  greeting?: string;
  onNotificationPress?: () => void;
  onOpenPeopleAccount: () => void;
  onOpenProfile: () => void;
  onQuickActionPress?: () => void;
  rightActions?: ReactNode;
  showNotification?: boolean;
  showQuickAction?: boolean;
  relationship: string;
  userName: string;
};

export function AppTopProfileHeader({
  avatarInitials,
  avatarUri,
  greeting = "Welcome back,",
  onNotificationPress,
  onOpenPeopleAccount,
  onOpenProfile,
  onQuickActionPress,
  rightActions,
  showNotification = true,
  showQuickAction = true,
  relationship,
  userName,
}: AppTopProfileHeaderProps) {
  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.md,
        justifyContent: "space-between",
      }}
    >
      <HealthSyncIdentityControl
        avatarUri={avatarUri}
        initials={avatarInitials}
        name={userName}
        onOpenPeopleAccount={onOpenPeopleAccount}
        onOpenProfile={onOpenProfile}
        pageTitle={greeting}
        relationship={relationship}
      />

      <View
        style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}
      >
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
