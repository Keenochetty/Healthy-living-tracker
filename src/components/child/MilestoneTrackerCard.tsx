import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  MILESTONE_CATEGORIES,
  MILESTONE_SUGGESTIONS,
} from "@/constants/childOptions";
import { addMilestone, getMilestones } from "@/lib/childStorage";
import type { ChildMilestone, MilestoneCategory } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type MilestoneTrackerCardProps = {
  childId: string;
  onChange?: () => void;
};

export function MilestoneTrackerCard({
  childId,
  onChange,
}: MilestoneTrackerCardProps) {
  const [category, setCategory] = useState<MilestoneCategory>("firsts");
  const [milestones, setMilestones] = useState<ChildMilestone[]>([]);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");

  async function loadMilestones() {
    setMilestones(await getMilestones(childId));
  }

  useEffect(() => {
    let isActive = true;

    getMilestones(childId).then((nextMilestones) => {
      if (isActive) {
        setMilestones(nextMilestones);
      }
    });

    return () => {
      isActive = false;
    };
  }, [childId]);

  async function handleSave() {
    if (!title.trim()) return;

    await addMilestone({
      achievedAt: new Date().toISOString(),
      category,
      childId,
      notes,
      title: title.trim(),
    });

    setTitle("");
    setNotes("");
    await loadMilestones();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Milestones
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Keep personal memories and developmental notes without turning them
            into pressure.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MILESTONE_SUGGESTIONS.slice(0, 5).map((suggestion) => (
            <Pill
              key={suggestion}
              label={suggestion}
              onPress={() => setTitle(suggestion)}
              selected={title === suggestion}
            />
          ))}
        </View>

        <TextInput
          onChangeText={setTitle}
          placeholder="Milestone title"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={title}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {MILESTONE_CATEGORIES.map((option) => (
            <Pill
              key={option}
              label={option}
              onPress={() => setCategory(option)}
              selected={category === option}
            />
          ))}
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
            Save milestone
          </Text>
        </TouchableOpacity>

        {milestones.slice(0, 4).map((milestone) => (
          <View
            key={milestone.id}
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>
              {milestone.title}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {milestone.category}
            </Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function Pill({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: selected ? "#fef3c7" : "#f8fafc",
        borderColor: selected ? "#facc15" : "#e2e8f0",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text
        style={{ color: selected ? "#92400e" : "#475569", fontWeight: "800" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
  backgroundColor: "#f59e0b",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 50,
};
