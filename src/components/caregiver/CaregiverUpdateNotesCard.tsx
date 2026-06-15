import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { CAREGIVER_UPDATE_NOTE_TYPES } from "@/constants/caregiverOptions";
import {
  addCaregiverUpdateNote,
  getCaregiverUpdateNotes,
} from "@/lib/caregiverStorage";
import type { CaregiverUpdateNote } from "@/types/caregiver";
import { AppCard } from "@/components/ui/AppCard";
import { CaregiverChip } from "./CaregiverChip";

type CaregiverUpdateNotesCardProps = {
  caregiverId: string;
  onChange?: () => void;
};

export function CaregiverUpdateNotesCard({
  caregiverId,
  onChange,
}: CaregiverUpdateNotesCardProps) {
  const [note, setNote] = useState("");
  const [noteType, setNoteType] =
    useState<CaregiverUpdateNote["noteType"]>("activity");
  const [notes, setNotes] = useState<CaregiverUpdateNote[]>([]);
  const [targetName, setTargetName] = useState("");
  const [title, setTitle] = useState("");

  async function loadNotes() {
    setNotes(await getCaregiverUpdateNotes(caregiverId));
  }

  useEffect(() => {
    let isActive = true;
    getCaregiverUpdateNotes(caregiverId).then((nextNotes) => {
      if (isActive) setNotes(nextNotes);
    });
    return () => {
      isActive = false;
    };
  }, [caregiverId]);

  async function handleSave() {
    if (!title.trim() || !note.trim()) return;
    await addCaregiverUpdateNote({
      caregiverId,
      note,
      noteType,
      photoUri: "placeholder-update-photo",
      targetName: targetName.trim() || undefined,
      title,
    });
    setNote("");
    setTargetName("");
    setTitle("");
    await loadNotes();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Family updates
        </Text>
        <Text style={{ color: "#64748b", lineHeight: 20 }}>
          Use updates for care communication. Medical data is not shared by
          default.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CAREGIVER_UPDATE_NOTE_TYPES.map((type) => (
            <CaregiverChip
              key={type.key}
              label={type.label}
              onPress={() => setNoteType(type.key)}
              selected={noteType === type.key}
            />
          ))}
        </View>
        <TextInput
          onChangeText={setTargetName}
          placeholder="Target name, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={targetName}
        />
        <TextInput
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={title}
        />
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="Update note, e.g. Tommy made a new friend today."
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 86, textAlignVertical: "top" }]}
          value={note}
        />
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#eef2ff",
            borderRadius: 18,
            minHeight: 52,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#4f46e5", fontWeight: "900" }}>
            Photo placeholder
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>
            Save update
          </Text>
        </TouchableOpacity>
        {notes.slice(0, 4).map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <Text style={{ color: "#0f172a", fontWeight: "900" }}>
              {item.title}
            </Text>
            <Text style={{ color: "#64748b", marginTop: 3 }}>
              {item.noteType}
            </Text>
          </View>
        ))}
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
  backgroundColor: "#4f46e5",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
