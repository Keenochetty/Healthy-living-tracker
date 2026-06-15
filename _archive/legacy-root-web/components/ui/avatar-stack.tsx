import { Text, View } from "react-native";

import { typography, useHealthTheme } from "@/constants/theme";

export type AvatarStackItem = {
  color?: string;
  id: string;
  label: string;
};

type AvatarStackProps = {
  items: AvatarStackItem[];
  maxVisible?: number;
  size?: number;
};

export function AvatarStack({
  items,
  maxVisible = 4,
  size = 30,
}: AvatarStackProps) {
  const { colors } = useHealthTheme();
  const visible = items.slice(0, maxVisible);
  const remaining = Math.max(0, items.length - visible.length);

  return (
    <View style={{ flexDirection: "row", paddingLeft: visible.length ? 8 : 0 }}>
      {visible.map((item) => (
        <View
          key={item.id}
          style={{
            alignItems: "center",
            backgroundColor: item.color ?? colors.brand.primary,
            borderColor: colors.surface.primary,
            borderRadius: Math.min(12, size / 2),
            borderWidth: 2,
            height: size,
            justifyContent: "center",
            marginLeft: -8,
            width: size,
          }}
        >
          <Text style={{ color: colors.text.inverse, ...typography.caption }}>
            {item.label.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      ))}
      {remaining ? (
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.surface.secondary,
            borderColor: colors.surface.primary,
            borderRadius: Math.min(12, size / 2),
            borderWidth: 2,
            height: size,
            justifyContent: "center",
            marginLeft: -8,
            width: size,
          }}
        >
          <Text style={{ color: colors.text.secondary, ...typography.caption }}>
            +{remaining}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
