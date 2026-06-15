import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { DIAPER_OPTIONS } from "@/constants/childOptions";
import { addDiaperLog } from "@/lib/childStorage";
import type { DiaperLog, DiaperType } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type DiaperLogCardProps = {
  childId: string;
  latestDiaper?: DiaperLog;
  onChange?: () => void;
};

export function DiaperLogCard({
  childId,
  latestDiaper,
  onChange,
}: DiaperLogCardProps) {
  const [diaperType, setDiaperType] = useState<DiaperType>("wet");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    await addDiaperLog({ childId, diaperType, notes });
    setNotes("");
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Diaper log
          </Text>
          <Text style={{ color: "#64748b", marginTop: 4 }}>
            Latest:{" "}
            {latestDiaper ? latestDiaper.diaperType : "No diaper logs yet"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {DIAPER_OPTIONS.map((option) => {
            const selected = diaperType === option.key;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                key={option.key}
                onPress={() => setDiaperType(option.key)}
                style={{
                  backgroundColor: selected ? "#ecfdf5" : "#f8fafc",
                  borderColor: selected ? "#86efac" : "#e2e8f0",
                  borderRadius: 999,
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                }}
              >
                <Text
                  style={{
                    color: selected ? "#15803d" : "#475569",
                    fontWeight: "800",
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={notes}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Save diaper
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
  backgroundColor: "#10b981",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 50,
};
