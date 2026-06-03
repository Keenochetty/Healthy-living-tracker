import { Href, router, useFocusEffect } from "expo-router";
import { QrCode, ScanLine, Send, TreePine } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { InvitePreviewCard } from "@/components/circle/InvitePreviewCard";
import { InviteQRCodeCard } from "@/components/circle/InviteQRCodeCard";
import { MemberCard } from "@/components/circle/MemberCard";
import { PendingRequestCard } from "@/components/circle/PendingRequestCard";
import { RoleCard } from "@/components/circle/RoleCard";
import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppCard } from "@/components/ui/AppCard";
import { CIRCLE_ROLES, getCircleRoleDefinition } from "@/constants/circleRoles";
import { createMockCircleInvite } from "@/lib/circleInvites";
import {
  approveJoinRequest,
  declineJoinRequest,
  getMockCircle
} from "@/lib/circleStorage";
import type { CircleInvite, CircleRole, FamilyCircle } from "@/types/circle";

export default function CircleScreen() {
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [selectedRole, setSelectedRole] = useState<CircleRole>("partner");
  const [invite, setInvite] = useState<CircleInvite | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const roleDefinition = useMemo(() => getCircleRoleDefinition(selectedRole), [selectedRole]);
  const pendingRequests = circle?.pendingRequests.filter((request) => request.status === "pending") ?? [];
  const activeMembers = circle?.members.filter((member) => member.status === "active") ?? [];
  const previewInvite = {
    circleName: circle?.name ?? "My Care Circle",
    permissions: roleDefinition.defaultPermissions,
    role: selectedRole
  };

  const loadCircle = useCallback(async () => {
    setCircle(await getMockCircle());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCircle();
    }, [loadCircle])
  );

  async function handleApprove(requestId: string) {
    setCircle(await approveJoinRequest(requestId));
  }

  async function handleDecline(requestId: string) {
    setCircle(await declineJoinRequest(requestId));
  }

  async function generateInvite() {
    setIsCreating(true);
    setErrorMessage(null);

    try {
      setInvite(
        await createMockCircleInvite({
          circleName: circle?.name ?? "My Care Circle",
          role: selectedRole
        })
      );
    } catch {
      setErrorMessage("The invite could not be generated. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <AppMainLayout subtitle="Private sharing" title="Circle">
      <AppCard backgroundColor="#8b5cf6">
        <View style={{ alignItems: "center", flexDirection: "row", gap: 14 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: 18,
              height: 54,
              justifyContent: "center",
              width: 54
            }}
          >
            <TreePine color="#ffffff" size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#ede9fe", fontSize: 13, fontWeight: "700" }}>
              Current circle
            </Text>
            <Text style={{ color: "#ffffff", fontSize: 23, fontWeight: "900", marginTop: 3 }}>
              {circle?.name ?? "My Care Circle"}
            </Text>
            <Text style={{ color: "#ede9fe", marginTop: 4, lineHeight: 20 }}>
              Your circle can include a partner, close friend, family member, elder, child,
              or caregiver.
            </Text>
          </View>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <ActionButton
          icon={<Send color="#ffffff" size={18} />}
          label="Invite member"
          onPress={() => setInvite(null)}
          primary
        />
        <ActionButton
          icon={<ScanLine color="#7c3aed" size={18} />}
          label="Scan QR"
          onPress={() => router.push("/scan-invite" as Href)}
        />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>
          Pending requests
        </Text>
        {pendingRequests.length ? (
          pendingRequests.map((request) => (
            <PendingRequestCard
              key={request.id}
              onApprove={() => handleApprove(request.id)}
              onDecline={() => handleDecline(request.id)}
              request={request}
            />
          ))
        ) : (
          <EmptyCard text="No pending requests right now." />
        )}
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>
          Active members
        </Text>
        {activeMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onPress={() => router.push(`/circle/member/${member.id}` as Href)}
          />
        ))}
      </View>

      <View style={{ gap: 10 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 21, fontWeight: "900" }}>
            Invite tools
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 3 }}>
            Pick a role, preview permissions, then create a trusted invite link.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10, paddingRight: 20 }}>
            {CIRCLE_ROLES.map((role) => (
              <View key={role.key} style={{ width: 270 }}>
                <RoleCard
                  onSelect={() => {
                    setSelectedRole(role.key);
                    setInvite(null);
                  }}
                  role={role}
                  selected={selectedRole === role.key}
                />
              </View>
            ))}
          </View>
        </ScrollView>

        <InvitePreviewCard invite={previewInvite} />

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isCreating}
          onPress={generateInvite}
          style={{
            alignItems: "center",
            backgroundColor: "#7c3aed",
            borderRadius: 18,
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            minHeight: 54,
            opacity: isCreating ? 0.65 : 1
          }}
        >
          <QrCode color="#ffffff" size={19} />
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
            {isCreating ? "Generating invite..." : "Generate invite"}
          </Text>
        </TouchableOpacity>

        {errorMessage ? <Text style={{ color: "#b91c1c" }}>{errorMessage}</Text> : null}

        {invite ? (
          <View style={{ gap: 10 }}>
            <InviteQRCodeCard invite={invite} />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/join/${invite.token}` as Href)}
              style={{
                alignItems: "center",
                backgroundColor: "#ede9fe",
                borderRadius: 16,
                justifyContent: "center",
                minHeight: 48
              }}
            >
              <Text style={{ color: "#6d28d9", fontWeight: "800" }}>
                Preview join screen
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </AppMainLayout>
  );
}

function ActionButton({
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
        backgroundColor: primary ? "#7c3aed" : "#ffffff",
        borderRadius: 16,
        flex: 1,
        flexDirection: "row",
        gap: 8,
        justifyContent: "center",
        minHeight: 50
      }}
    >
      {icon}
      <Text style={{ color: primary ? "#ffffff" : "#7c3aed", fontWeight: "800" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <AppCard>
      <Text style={{ color: "#64748b", lineHeight: 20 }}>{text}</Text>
    </AppCard>
  );
}
