import { Check, X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { getCircleRoleDefinition } from "@/constants/circleRoles";
import type { CircleJoinRequest } from "@/types/circle";
import { PermissionChip } from "./PermissionChip";

type PendingRequestCardProps = {
  onApprove: () => void;
  onDecline: () => void;
  request: CircleJoinRequest;
};

export function PendingRequestCard({
  onApprove,
  onDecline,
  request
}: PendingRequestCardProps) {
  const role = getCircleRoleDefinition(request.role);

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#f1f5f9",
        borderRadius: 24,
        borderWidth: 1,
        gap: 12,
        padding: 15
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#f5f3ff",
            borderRadius: 18,
            height: 48,
            justifyContent: "center",
            width: 48
          }}
        >
          <Text style={{ color: "#7c3aed", fontSize: 15, fontWeight: "900" }}>
            {request.avatarInitials}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#0f172a", fontSize: 16, fontWeight: "900" }}>
            {request.displayName}
          </Text>
          <Text style={{ color: "#64748b", marginTop: 3 }}>Requested as {role.label}</Text>
        </View>
      </View>

      {request.message ? (
        <Text style={{ color: "#64748b", lineHeight: 20 }}>{request.message}</Text>
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {request.permissions.map((permission) => (
          <PermissionChip key={permission} permission={permission} />
        ))}
      </View>

      <Text style={{ color: "#92400e", fontSize: 12, lineHeight: 18 }}>
        Approving this person only grants the selected permissions.
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <RequestButton
          icon={<Check color="#ffffff" size={16} />}
          label="Approve"
          onPress={onApprove}
          primary
        />
        <RequestButton
          icon={<X color="#7c3aed" size={16} />}
          label="Decline"
          onPress={onDecline}
        />
      </View>
    </View>
  );
}

function RequestButton({
  icon,
  label,
  onPress,
  primary = false
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: primary ? "#7c3aed" : "#ede9fe",
        borderRadius: 14,
        flex: 1,
        flexDirection: "row",
        gap: 7,
        justifyContent: "center",
        minHeight: 44
      }}
    >
      {icon}
      <Text style={{ color: primary ? "#ffffff" : "#6d28d9", fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
