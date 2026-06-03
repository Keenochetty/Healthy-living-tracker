import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { CHILD_PROFILE_TYPE_OPTIONS } from "@/constants/childOptions";
import { createChildProfile } from "@/lib/childStorage";
import type { ChildProfile, ChildProfileType } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type AddChildProfileCardProps = {
  onCreated?: (child: ChildProfile) => void;
};

const AVATAR_OPTIONS = ["Baby", "Star", "Heart", "Smile"];

export function AddChildProfileCard({ onCreated }: AddChildProfileCardProps) {
  const [displayName, setDisplayName] = useState("");
  const [profileType, setProfileType] = useState<ChildProfileType>("baby");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("Baby");
  const [allergies, setAllergies] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    const trimmedName = displayName.trim();

    if (!trimmedName || saving) return;

    setSaving(true);

    const child = await createChildProfile({
      allergies: allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      avatarEmoji,
      dateOfBirth: dateOfBirth.trim() || undefined,
      displayName: trimmedName,
      medicalNotes,
      profileType
    });

    setDisplayName("");
    setDateOfBirth("");
    setAllergies("");
    setMedicalNotes("");
    setSaving(false);
    onCreated?.(child);
  }

  return (
    <AppCard>
      <View style={{ gap: 14 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Add a child profile
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Only add this if it is useful for your family. Child access stays parent-controlled.
          </Text>
        </View>

        <TextInput
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={displayName}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CHILD_PROFILE_TYPE_OPTIONS.map((option) => {
            const selected = profileType === option.key;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                key={option.key}
                onPress={() => setProfileType(option.key)}
                style={{
                  backgroundColor: selected ? "#ede9fe" : "#f8fafc",
                  borderColor: selected ? "#c4b5fd" : "#e2e8f0",
                  borderRadius: 999,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 9
                }}
              >
                <Text style={{ color: selected ? "#6d28d9" : "#475569", fontWeight: "800" }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {AVATAR_OPTIONS.map((option) => {
            const selected = avatarEmoji === option;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                key={option}
                onPress={() => setAvatarEmoji(option)}
                style={{
                  backgroundColor: selected ? "#f5f3ff" : "#f8fafc",
                  borderColor: selected ? "#8b5cf6" : "#e2e8f0",
                  borderRadius: 16,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 10
                }}
              >
                <Text style={{ color: "#0f172a", fontWeight: "800" }}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          onChangeText={setDateOfBirth}
          placeholder="Date of birth, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={dateOfBirth}
        />

        <TextInput
          onChangeText={setAllergies}
          placeholder="Allergies, comma separated"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={allergies}
        />

        <TextInput
          multiline
          onChangeText={setMedicalNotes}
          placeholder="Care notes, optional"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 82, textAlignVertical: "top" }]}
          value={medicalNotes}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCreate}
          style={{
            alignItems: "center",
            backgroundColor: displayName.trim() ? "#7c3aed" : "#cbd5e1",
            borderRadius: 18,
            minHeight: 52,
            justifyContent: "center"
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
            {saving ? "Saving..." : "Create child profile"}
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

const inputStyle = {
  backgroundColor: "#f8fafc",
  borderColor: "#e2e8f0",
  borderRadius: 18,
  borderWidth: 1,
  color: "#0f172a",
  fontSize: 15,
  minHeight: 50,
  paddingHorizontal: 14,
  paddingVertical: 12
};
