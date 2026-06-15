import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { ELDER_CARE_NOTE_TYPE_OPTIONS } from "@/constants/elderOptions";
import { addElderCareNote, getElderCareNotes } from "@/lib/elderStorage";
import type { ElderCareNote, ElderCareNoteType } from "@/types/elder";
import { AppCard } from "@/components/ui/AppCard";
import { ElderChip } from "./ElderChip";

type ElderCareNotesCardProps = {
  elderId: string;
  onChange?: () => void;
};

export function ElderCareNotesCard({
  elderId,
  onChange,
}: ElderCareNotesCardProps) {
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState<ElderCareNoteType>("general");
  const [notes, setNotes] = useState<ElderCareNote[]>([]);
  const [title, setTitle] = useState("");

  async function loadNotes() {
    setNotes(await getElderCareNotes(elderId));
  }

  useEffect(() => {
    let isActive = true;

    getElderCareNotes(elderId).then((nextNotes) => {
      if (isActive) {
        setNotes(nextNotes);
      }
    });

    return () => {
      isActive = false;
    };
  }, [elderId]);

  async function handleSave() {
    if (!title.trim() || !note.trim()) return;

    await addElderCareNote({
      elderId,
      note,
      noteType,
      title,
    });

    setNote("");
    setTitle("");
    await loadNotes();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Care notes
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {ELDER_CARE_NOTE_TYPE_OPTIONS.map((option) => (
            <ElderChip
              key={option.key}
              label={option.label}
              onPress={() => setNoteType(option.key)}
              selected={noteType === option.key}
            />
          ))}
        </View>

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
          placeholder="Note"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 84, textAlignVertical: "top" }]}
          value={note}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSave}
          style={buttonStyle}
        >
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save note</Text>
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
  backgroundColor: "#0f766e",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52,
};
