import { Text } from "react-native";

import { radius, statusColours } from "@/theme/tokens";

type AppStatusPillProps = {
  label?: string;
  status: keyof typeof statusColours;
};

export function AppStatusPill({ label, status }: AppStatusPillProps) {
  const color = statusColours[status];

  return (
    <Text
      style={{
        backgroundColor: `${color}22`,
        borderRadius: radius.full,
        color,
        fontSize: 12,
        fontWeight: "900",
        overflow: "hidden",
        paddingHorizontal: 10,
        paddingVertical: 5,
        textTransform: "capitalize",
      }}
    >
      {label ?? status}
    </Text>
  );
}
