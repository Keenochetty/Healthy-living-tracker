import { Href, router, useLocalSearchParams } from "expo-router";
import { ShieldCheck, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { PermissionEditor } from "@/components/circle/PermissionEditor";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { AppCard } from "@/components/ui/AppCard";
import { getCircleRoleDefinition } from "@/constants/circleRoles";
import {
  getMockCircle,
  removeCircleMember,
  updateMemberPermissions,
} from "@/lib/circleStorage";
import type { CircleMember, CirclePermissionKey } from "@/types/circle";

export default function CircleMemberDetailScreen() {
  const { memberId: memberIdParam } = useLocalSearchParams<{
    memberId?: string | string[];
  }>();
  const memberId = Array.isArray(memberIdParam)
    ? memberIdParam[0]
    : memberIdParam;
  const [member, setMember] = useState<CircleMember | null>(null);
  const [permissions, setPermissions] = useState<CirclePermissionKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const role = useMemo(
    () => (member ? getCircleRoleDefinition(member.role) : null),
    [member],
  );

  useEffect(() => {
    let isActive = true;

    getMockCircle()
      .then((circle) => {
        const nextMember =
          circle.members.find(
            (item) => item.id === memberId && item.status !== "removed",
          ) ?? null;

        if (isActive) {
          setMember(nextMember);
          setPermissions(nextMember?.permissions ?? []);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [memberId]);

  async function savePermissions() {
    if (!member) {
      return;
    }

    const circle = await updateMemberPermissions(member.id, permissions);
    const updatedMember =
      circle.members.find((item) => item.id === member.id) ?? member;

    setMember(updatedMember);
    setStatusMessage("Permissions saved.");
  }

  async function removeMember() {
    if (!member || member.isOwner) {
      return;
    }

    await removeCircleMember(member.id);
    router.replace("/circle" as Href);
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator color="#7c3aed" />
      </ScreenWrapper>
    );
  }

  if (!member || !role) {
    return (
      <ScreenWrapper>
        <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "900" }}>
          Member not found
        </Text>
        <AppCard>
          <Text style={{ color: "#64748b", lineHeight: 21 }}>
            This member may have been removed from your circle.
          </Text>
        </AppCard>
        <SecondaryButton
          label="Back to Circle"
          onPress={() => router.replace("/circle" as Href)}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#64748b", fontSize: 14 }}>Circle member</Text>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
          Manage access
        </Text>
      </View>

      <AppCard>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 14 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "#f5f3ff",
              borderRadius: 22,
              height: 62,
              justifyContent: "center",
              width: 62,
            }}
          >
            <Text style={{ color: "#7c3aed", fontSize: 18, fontWeight: "900" }}>
              {member.avatarInitials}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontSize: 22, fontWeight: "900" }}>
              {member.displayName}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {member.isOwner ? "Owner/admin" : role.label}
            </Text>
            <Text
              style={{
                color: "#94a3b8",
                marginTop: 3,
                textTransform: "capitalize",
              }}
            >
              {member.status}
            </Text>
          </View>
        </View>
      </AppCard>

      <AppCard backgroundColor="#f8fafc">
        <View
          style={{ alignItems: "flex-start", flexDirection: "row", gap: 10 }}
        >
          <ShieldCheck color="#7c3aed" size={20} />
          <Text style={{ color: "#475569", flex: 1, lineHeight: 21 }}>
            Changing permissions affects what this person can see in your
            circle.
          </Text>
        </View>
      </AppCard>

      {member.isOwner ? (
        <AppCard backgroundColor="#f5f3ff">
          <Text style={{ color: "#5b21b6", fontWeight: "800", lineHeight: 21 }}>
            This is the circle owner. Owner/admin access cannot be removed from
            this mock circle.
          </Text>
        </AppCard>
      ) : (
        <PermissionEditor onChange={setPermissions} permissions={permissions} />
      )}

      {statusMessage ? (
        <Text style={{ color: "#059669", fontWeight: "800" }}>
          {statusMessage}
        </Text>
      ) : null}

      {!member.isOwner ? (
        <>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={savePermissions}
            style={{
              alignItems: "center",
              backgroundColor: "#7c3aed",
              borderRadius: 18,
              justifyContent: "center",
              minHeight: 54,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
              Save permissions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={removeMember}
            style={{
              alignItems: "center",
              backgroundColor: "#fee2e2",
              borderRadius: 18,
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              minHeight: 50,
            }}
          >
            <Trash2 color="#dc2626" size={18} />
            <Text style={{ color: "#dc2626", fontWeight: "900" }}>
              Remove member
            </Text>
          </TouchableOpacity>
        </>
      ) : null}

      <SecondaryButton
        label="Back to Circle"
        onPress={() => router.replace("/circle" as Href)}
      />
    </ScreenWrapper>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      <Text style={{ color: "#7c3aed", fontWeight: "800" }}>{label}</Text>
    </TouchableOpacity>
  );
}
