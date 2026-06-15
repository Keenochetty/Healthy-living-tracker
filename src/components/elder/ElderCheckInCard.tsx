import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  ELDER_CHECK_IN_STATUS_OPTIONS,
  ELDER_EMERGENCY_DISCLAIMER,
  ELDER_QUALITY_OPTIONS,
} from "@/constants/elderOptions";
import { addElderCheckIn } from "@/lib/elderStorage";
import type { ElderCareQuality, ElderCheckInStatus } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";
import { ElderChip } from "./ElderChip";

type ElderCheckInCardProps = {
  elderId: string;
  onChange?: () => void;
};

export function ElderCheckInCard({ elderId, onChange }: ElderCheckInCardProps) {
  const [appetite, setAppetite] = useState<ElderCareQuality | undefined>();
  const [hydration, setHydration] = useState<ElderCareQuality | undefined>();
  const [mobility, setMobility] = useState<ElderCareQuality | undefined>();
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ElderCheckInStatus>("okay");

  async function handleSave() {
    await addElderCheckIn({
      appetite,
      elderId,
      hydration,
      mobility,
      mood: mood.trim() || undefined,
      notes,
      status,
    });

    setMood("");
    setNotes("");
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Check-in
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Log the last check-in without making medical conclusions.
          </Text>
        </View>

        <ChipGroup
          label="Status"
          options={ELDER_CHECK_IN_STATUS_OPTIONS.map((option) => ({
            key: option.key,
            label: option.label,
          }))}
          selected={status}
          onSelect={(value) => setStatus(value as ElderCheckInStatus)}
        />
        <QualityGroup
          label="Appetite"
          selected={appetite}
          onSelect={setAppetite}
        />
        <QualityGroup
          label="Hydration"
          selected={hydration}
          onSelect={setHydration}
        />
        <QualityGroup
          label="Mobility"
          selected={mobility}
          onSelect={setMobility}
        />

        <TextInput
          onChangeText={setMood}
          placeholder="Mood, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={mood}
        />
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 76, textAlignVertical: "top" }]}
          value={notes}
        />

        {status === "urgent" ? (
          <Text style={{ color: "#9a3412", lineHeight: 21 }}>
            {ELDER_EMERGENCY_DISCLAIMER}
          </Text>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Save check-in
          </Text>
        </TouchableOpacity>
      </View>
    </AppCard>
  );
}

function QualityGroup({
  label,
  onSelect,
  selected,
}: {
  label: string;
  onSelect: (value: ElderCareQuality) => void;
  selected?: ElderCareQuality;
}) {
  return (
    <ChipGroup
      label={label}
      options={ELDER_QUALITY_OPTIONS}
      selected={selected}
      onSelect={(value) => onSelect(value as ElderCareQuality)}
    />
  );
}

function ChipGroup({
  label,
  onSelect,
  options,
  selected,
}: {
  label: string;
  onSelect: (value: string) => void;
  options: Array<{ key: string; label: string }>;
  selected?: string;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: "#64748b", fontWeight: "900" }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => (
          <ElderChip
            key={option.key}
            label={option.label}
            onPress={() => onSelect(option.key)}
            selected={selected === option.key}
          />
        ))}
      </View>
    </View>
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
  backgroundColor: "#059669",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
