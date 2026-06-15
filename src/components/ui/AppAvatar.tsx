import { Image, Text, View } from "react-native";

import { radius, statusColours } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

type AppAvatarProps = {
  emoji?: string;
  imageUri?: string;
  initials: string;
  size?: number;
  status?: keyof typeof statusColours;
};

export function AppAvatar({
  emoji,
  imageUri,
  initials,
  size = 44,
  status,
}: AppAvatarProps) {
  const { theme } = useAppTheme();

  return (
    <View style={{ height: size, width: size }}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: theme.primarySoft,
          borderColor: theme.border,
          borderRadius: radius.full,
          borderWidth: 1,
          height: size,
          justifyContent: "center",
          overflow: "hidden",
          width: size,
        }}
      >
        {imageUri ? (
          <Image
            alt={`${initials} avatar`}
            source={{ uri: imageUri }}
            style={{ height: size, width: size }}
          />
        ) : (
          <Text
            style={{
              color: theme.primary,
              fontSize: size * 0.38,
              fontWeight: "900",
            }}
          >
            {emoji ?? initials.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </View>
      {status ? (
        <View
          style={{
            backgroundColor: statusColours[status],
            borderColor: theme.surface,
            borderRadius: radius.full,
            borderWidth: 2,
            bottom: 0,
            height: 12,
            position: "absolute",
            right: 0,
            width: 12,
          }}
        />
      ) : null}
    </View>
  );
}
