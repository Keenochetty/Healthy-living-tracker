import { Avatar, type AvatarColor, type AvatarSize } from "heroui-native/avatar";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";

export type AppAvatarProps = {
  className?: string;
  imageUrl?: string;
  initials: string;
  size?: AvatarSize;
  status?: "online" | "away" | "busy";
};

const statusClasses = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-danger",
} as const;

const statusColorMap: Record<
  NonNullable<AppAvatarProps["status"]>,
  AvatarColor
> = {
  online: "success",
  away: "warning",
  busy: "danger",
};

export function AppAvatar({
  className,
  imageUrl,
  initials,
  size = "md",
  status,
}: AppAvatarProps) {
  return (
    <View className={twMerge("relative self-start", className)}>
      <Avatar color={status ? statusColorMap[status] : "accent"} size={size}>
        {imageUrl ? <Avatar.Image source={{ uri: imageUrl }} /> : null}
        <Avatar.Fallback>{initials}</Avatar.Fallback>
      </Avatar>
      {status ? (
        <View
          accessibilityLabel={`${status} status`}
          className={twMerge(
            "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background",
            statusClasses[status],
          )}
        />
      ) : null}
    </View>
  );
}
