import { ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { getCircleRoleDefinition } from "@/constants/circleRoles";
import { CIRCLE_PERMISSION_LABELS } from "@/constants/permissionLabels";
import type { CircleMember } from "@/types/circle";

type MemberCardProps = {
  member: CircleMember;
  onPress: () => void;
};

export function MemberCard({ member, onPress }: MemberCardProps) {
  const role = getCircleRoleDefinition(member.role);
  const permissionSummary = member.isOwner
    ? "Circle owner and admin"
    : member.permissions.length
      ? member.permissions
          .slice(0, 2)
          .map((permission) => CIRCLE_PERMISSION_LABELS[permission])
          .join(", ")
      : "No shared permissions";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderColor: "#f1f5f9",
        borderRadius: 24,
        borderWidth: 1,
        flexDirection: "row",
        gap: 12,
        padding: 15,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#f5f3ff",
          borderRadius: 18,
          height: 48,
          justifyContent: "center",
          width: 48,
        }}
      >
        <Text style={{ color: "#7c3aed", fontSize: 15, fontWeight: "900" }}>
          {member.avatarInitials}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
          <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
            {member.displayName}
          </Text>
          <StatusChip label={member.isOwner ? "Admin" : member.status} />
        </View>
        <Text style={{ color: "#64748b", marginTop: 3 }}>
          {member.isOwner ? "Owner" : role.label}
        </Text>
        <Text style={{ color: "#94a3b8", marginTop: 4 }}>
          {permissionSummary}
          {!member.isOwner && member.permissions.length > 2
            ? ` +${member.permissions.length - 2} more`
            : ""}
        </Text>
      </View>

      <ChevronRight color="#94a3b8" size={20} />
    </TouchableOpacity>
  );
}

function StatusChip({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor:
          label === "active" || label === "Admin" ? "#dcfce7" : "#fef3c7",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      <Text
        style={{
          color:
            label === "active" || label === "Admin" ? "#166534" : "#92400e",
          fontSize: 11,
          fontWeight: "800",
          textTransform: "capitalize",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
