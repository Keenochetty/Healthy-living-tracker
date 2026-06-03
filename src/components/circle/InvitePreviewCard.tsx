import { ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { getCircleRoleDefinition } from "@/constants/circleRoles";
import type { CircleInvite } from "@/types/circle";
import { PermissionChip } from "./PermissionChip";

type InvitePreviewCardProps = {
  invite: Pick<CircleInvite, "circleName" | "permissions" | "role">;
};

export function InvitePreviewCard({ invite }: InvitePreviewCardProps) {
  const role = getCircleRoleDefinition(invite.role);

  return (
    <AppCard>
      <View style={{ gap: 14 }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#f5f3ff",
              borderRadius: 15,
              height: 42,
              justifyContent: "center",
              width: 42
            }}
          >
            <Text style={{ fontSize: 22 }}>{role.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "900" }}>
              {invite.circleName}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 2 }}>Invited as {role.label}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {invite.permissions.map((permission) => (
            <PermissionChip key={permission} permission={permission} />
          ))}
        </View>

        <View
          style={{
            alignItems: "flex-start",
            backgroundColor: "#f8fafc",
            borderRadius: 16,
            flexDirection: "row",
            gap: 10,
            padding: 12
          }}
        >
          <ShieldCheck color="#7c3aed" size={18} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#475569", fontSize: 12, lineHeight: 18 }}>
              {role.privacyNote}
            </Text>
            <Text style={{ color: "#475569", fontSize: 12, lineHeight: 18, marginTop: 4 }}>
              Permissions can be changed later. Private health data is never shared automatically.
            </Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
