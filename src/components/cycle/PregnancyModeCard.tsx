import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  PREGNANCY_DISCLAIMER,
  PREGNANCY_STATUS_OPTIONS,
} from "@/constants/cycleOptions";
import {
  clearPregnancyProfile,
  getPregnancyProfile,
  savePregnancyProfile,
} from "@/lib/cycleStorage";
import type { PregnancyProfile, PregnancyStatus } from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";
import { Chip } from "./CycleLogCard";

type PregnancyModeCardProps = {
  onChange?: (profile: PregnancyProfile | null) => void;
};

export function PregnancyModeCard({ onChange }: PregnancyModeCardProps) {
  const [allergies, setAllergies] = useState("");
  const [estimatedDueDate, setEstimatedDueDate] = useState("");
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [status, setStatus] = useState<PregnancyStatus>("not_tracking");

  useEffect(() => {
    let isActive = true;

    getPregnancyProfile().then((profile) => {
      if (!isActive || !profile) return;

      setAllergies(profile.allergies?.join(", ") ?? "");
      setEstimatedDueDate(profile.estimatedDueDate ?? "");
      setLastPeriodStartDate(profile.lastPeriodStartDate ?? "");
      setMedicalNotes(profile.medicalNotes ?? "");
      setStatus(profile.status);
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSave() {
    const profile = await savePregnancyProfile({
      allergies: allergies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      estimatedDueDate: estimatedDueDate.trim() || undefined,
      lastPeriodStartDate: lastPeriodStartDate.trim() || undefined,
      medicalNotes,
      status,
    });

    onChange?.(profile);
  }

  async function handleClear() {
    await clearPregnancyProfile();
    setStatus("not_tracking");
    setAllergies("");
    setEstimatedDueDate("");
    setLastPeriodStartDate("");
    setMedicalNotes("");
    onChange?.(null);
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Pregnancy mode
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            {PREGNANCY_DISCLAIMER}
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PREGNANCY_STATUS_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              onPress={() => setStatus(option.key)}
              selected={status === option.key}
            />
          ))}
        </View>

        <TextInput
          onChangeText={setLastPeriodStartDate}
          placeholder="Last period start date, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={lastPeriodStartDate}
        />
        <TextInput
          onChangeText={setEstimatedDueDate}
          placeholder="Estimated due date, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={estimatedDueDate}
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
          placeholder="Private medical notes, optional"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 82, textAlignVertical: "top" }]}
          value={medicalNotes}
        />

        {status === "possible" ? (
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>
            If pregnancy is possible, consider taking a pregnancy test or
            speaking to a healthcare professional.
          </Text>
        ) : null}

        {status === "pregnant" ? (
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>
            Use this space to organise appointments, symptoms and notes. Always
            follow guidance from your healthcare professional.
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Save pregnancy mode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleClear}
          style={secondaryButtonStyle}
        >
          <Text style={{ color: "#7c3aed", fontWeight: "900" }}>
            Clear pregnancy mode
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
  minHeight: 50,
  paddingHorizontal: 14,
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#7c3aed",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};

const secondaryButtonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#f5f3ff",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
