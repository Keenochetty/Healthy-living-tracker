import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { addPregnancyNote, getPregnancyNotes } from "@/lib/cycleStorage";
import type { PregnancyNote } from "@/types/cycle";
import { AppCard } from "@/components/ui/AppCard";

type PregnancyNotesCardProps = {
  onChange?: () => void;
  pregnancyProfileId: string;
};

export function PregnancyNotesCard({ onChange, pregnancyProfileId }: PregnancyNotesCardProps) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<PregnancyNote[]>([]);
  const [title, setTitle] = useState("");

  async function loadNotes() {
    setNotes(await getPregnancyNotes());
  }

  useEffect(() => {
    let isActive = true;

    getPregnancyNotes().then((nextNotes) => {
      if (isActive) {
        setNotes(nextNotes);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSave() {
    if (!title.trim() || !note.trim()) return;

    await addPregnancyNote({
      note,
      pregnancyProfileId,
      title
    });

    setNote("");
    setTitle("");
    await loadNotes();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Private notes
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Notes stay local and private in this testing build.
          </Text>
        </View>

        <TextInput
          onChangeText={setTitle}
          placeholder="Note title"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={title}
        />
        <TextInput
          multiline
          onChangeText={setNote}
          placeholder="Note"
          placeholderTextColor="#94a3b8"
          style={[inputStyle, { minHeight: 90, textAlignVertical: "top" }]}
          value={note}
        />

        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save note</Text>
        </TouchableOpacity>

        {notes
          .filter((item) => item.pregnancyProfileId === pregnancyProfileId)
          .slice(0, 4)
          .map((item) => (
            <View key={item.id} style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 12 }}>
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>{item.title}</Text>
              <Text style={{ color: "#64748b", marginTop: 3 }} numberOfLines={2}>
                {item.note}
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
  paddingHorizontal: 14
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#db2777",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 52
};
