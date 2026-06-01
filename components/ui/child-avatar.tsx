import { StyleSheet, Text, View } from "react-native";

import { spacing } from "@/constants/spacing";
import { colors } from "@/constants/theme";

type ChildAvatarProps = {
  name: string;
  size?: number;
  subtitle?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return initials || "?";
}

export function ChildAvatar({ name, size = 56, subtitle }: ChildAvatarProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { height: size, width: size }]}>
        <Text style={[styles.initials, { fontSize: Math.max(16, size * 0.34) }]}>{getInitials(name)}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{name}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.accent.mint,
    borderColor: colors.card.background,
    borderRadius: 999,
    borderWidth: 3,
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  initials: {
    color: colors.status.success,
    fontWeight: "800"
  },
  name: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  subtitle: {
    color: colors.text.muted,
    fontSize: 13
  }
});
