import { ShieldAlert } from "lucide-react-native";
import { Text, View } from "react-native";

import { CIRCLE_PERMISSION_DEFINITIONS } from "@/constants/permissionLabels";
import type { CirclePermissionKey } from "@/types/circle";
import { PermissionToggleRow } from "./PermissionToggleRow";

type PermissionEditorProps = {
  onChange: (permissions: CirclePermissionKey[]) => void;
  permissions: CirclePermissionKey[];
};

type PermissionGroup = {
  keys: CirclePermissionKey[];
  title: string;
};

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    keys: ["view_profile", "view_schedule", "add_schedule"],
    title: "Basic"
  },
  {
    keys: [
      "view_health_summary",
      "view_medications",
      "view_allergies",
      "view_emergency_contacts"
    ],
    title: "Health"
  },
  {
    keys: ["add_care_notes", "add_health_updates", "upload_documents"],
    title: "Care"
  },
  {
    keys: ["manage_child_profile", "manage_elder_profile", "emergency_access"],
    title: "Management"
  }
];

export function PermissionEditor({ onChange, permissions }: PermissionEditorProps) {
  function togglePermission(permission: CirclePermissionKey, enabled: boolean) {
    const nextPermissions = enabled
      ? Array.from(new Set([...permissions, permission]))
      : permissions.filter((item) => item !== permission);

    onChange(nextPermissions);
  }

  return (
    <View style={{ gap: 16 }}>
      <View
        style={{
          alignItems: "flex-start",
          backgroundColor: "#fff7ed",
          borderRadius: 18,
          flexDirection: "row",
          gap: 10,
          padding: 13
        }}
      >
        <ShieldAlert color="#ea580c" size={19} />
        <Text style={{ color: "#9a3412", flex: 1, lineHeight: 20 }}>
          Health details are private. Only enable these for people you trust.
        </Text>
      </View>

      {PERMISSION_GROUPS.map((group) => (
        <View
          key={group.title}
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#f1f5f9",
            borderRadius: 22,
            borderWidth: 1,
            overflow: "hidden",
            paddingHorizontal: 14,
            paddingTop: 14
          }}
        >
          <Text style={{ color: "#0f172a", fontSize: 17, fontWeight: "900" }}>
            {group.title}
          </Text>

          {group.keys.map((permission) => {
            const definition = CIRCLE_PERMISSION_DEFINITIONS[permission];

            return (
              <PermissionToggleRow
                key={permission}
                description={definition.description}
                label={definition.label}
                onValueChange={(value) => togglePermission(permission, value)}
                value={permissions.includes(permission)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
