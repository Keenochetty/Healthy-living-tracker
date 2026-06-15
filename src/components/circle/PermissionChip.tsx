import { Text, View } from "react-native";

import { CIRCLE_PERMISSION_LABELS } from "@/constants/permissionLabels";
import type { CirclePermissionKey } from "@/types/circle";

type PermissionChipProps = {
  permission: CirclePermissionKey;
};

export function PermissionChip({ permission }: PermissionChipProps) {
  return (
    <View
      style={{
        backgroundColor: "#f5f3ff",
        borderColor: "#ddd6fe",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: "#6d28d9", fontSize: 12, fontWeight: "700" }}>
        {CIRCLE_PERMISSION_LABELS[permission]}
      </Text>
    </View>
  );
}
