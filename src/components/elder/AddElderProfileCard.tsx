import { useState } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  ELDER_CONSENT_DISCLAIMER,
  ELDER_CONSENT_STATUS_OPTIONS
} from "@/constants/elderOptions";
import { createElderProfile } from "@/lib/elderStorage";
import type { ElderConsentStatus, ElderProfile } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";
import { ElderChip } from "./ElderChip";

type AddElderProfileCardProps = {
  onCreated?: (elder: ElderProfile) => void;
};

export function AddElderProfileCard({ onCreated }: AddElderProfileCardProps) {
  const [allergies, setAllergies] = useState("");
  const [consentStatus, setConsentStatus] =
    useState<ElderConsentStatus>("not_requested");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [livesAlone, setLivesAlone] = useState(false);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [primaryDoctor, setPrimaryDoctor] = useState("");
  const [relationship, setRelationship] = useState("");

  async function handleCreate() {
    const trimmedName = displayName.trim();

    if (!trimmedName) return;

    const elder = await createElderProfile({
      allergies: allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      consentStatus,
      dateOfBirth: dateOfBirth.trim() || undefined,
      displayName: trimmedName,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      livesAlone,
      medicalNotes,
      primaryDoctor: primaryDoctor.trim() || undefined,
      relationship: relationship.trim() || undefined
    });

    setDisplayName("");
    setRelationship("");
    setDateOfBirth("");
    setAllergies("");
    setMedicalNotes("");
    setEmergencyContactName("");
    setEmergencyContactPhone("");
    setPrimaryDoctor("");
    onCreated?.(elder);
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Add elder profile
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            {ELDER_CONSENT_DISCLAIMER}
          </Text>
        </View>

        <TextInput
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={displayName}
        />
        <TextInput
          onChangeText={setRelationship}
          placeholder="Relationship, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={relationship}
        />
        <TextInput
          onChangeText={setDateOfBirth}
          placeholder="Date of birth, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={dateOfBirth}
        />

        <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#0f172a", fontWeight: "800" }}>Lives alone</Text>
          <Switch onValueChange={setLivesAlone} value={livesAlone} />
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {ELDER_CONSENT_STATUS_OPTIONS.map((option) => (
            <ElderChip
              key={option.key}
              label={option.label}
              onPress={() => setConsentStatus(option.key)}
              selected={consentStatus === option.key}
            />
          ))}
        </View>

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
          placeholder="Medical notes, optional"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 76, textAlignVertical: "top" }]}
          value={medicalNotes}
        />
        <TextInput
          onChangeText={setPrimaryDoctor}
          placeholder="Primary doctor, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={primaryDoctor}
        />
        <TextInput
          onChangeText={setEmergencyContactName}
          placeholder="Emergency contact name"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={emergencyContactName}
        />
        <TextInput
          onChangeText={setEmergencyContactPhone}
          placeholder="Emergency contact phone"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={emergencyContactPhone}
        />

        <TouchableOpacity activeOpacity={0.85} onPress={handleCreate} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Add elder profile</Text>
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
  minHeight: 50,
  paddingHorizontal: 14
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#059669",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
