import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  FEEDING_DISCLAIMER,
  FEED_TYPE_OPTIONS,
  QUICK_FEED_AMOUNTS,
  getFeedTypeLabel
} from "@/constants/childOptions";
import { addFeedLog, getTodayFeedLogs } from "@/lib/childStorage";
import type { BabyFeedLog, FeedType } from "@/types/child";
import { AppCard } from "@/components/ui/AppCard";

type BabyFeedTrackerCardProps = {
  childId: string;
  onChange?: () => void;
};

export function BabyFeedTrackerCard({ childId, onChange }: BabyFeedTrackerCardProps) {
  const [feedType, setFeedType] = useState<FeedType>("formula");
  const [amount, setAmount] = useState("90");
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<BabyFeedLog[]>([]);

  async function loadLogs() {
    setLogs(await getTodayFeedLogs(childId));
  }

  useEffect(() => {
    let isActive = true;

    getTodayFeedLogs(childId).then((nextLogs) => {
      if (isActive) {
        setLogs(nextLogs);
      }
    });

    return () => {
      isActive = false;
    };
  }, [childId]);

  async function handleSave() {
    const parsedAmount = Number(amount);

    await addFeedLog({
      childId,
      feedType,
      finishedAmountMl: Number.isFinite(parsedAmount) ? parsedAmount : undefined,
      notes
    });

    setNotes("");
    await loadLogs();
    onChange?.();
  }

  return (
    <AppCard>
      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
            Baby feeding
          </Text>
          <Text style={{ color: "#64748b", lineHeight: 20, marginTop: 4 }}>
            Track what was offered and what baby finished.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {FEED_TYPE_OPTIONS.map((option) => (
            <Pill
              key={option.key}
              label={option.label}
              onPress={() => setFeedType(option.key)}
              selected={feedType === option.key}
            />
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {QUICK_FEED_AMOUNTS.map((quickAmount) => (
            <Pill
              key={quickAmount}
              label={`${quickAmount} ml`}
              onPress={() => setAmount(`${quickAmount}`)}
              selected={amount === `${quickAmount}`}
            />
          ))}
        </View>

        <TextInput
          keyboardType="numeric"
          onChangeText={setAmount}
          placeholder="Finished amount in ml"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={amount}
        />

        <TextInput
          onChangeText={setNotes}
          placeholder="Notes, optional"
          placeholderTextColor="#94a3b8"
          style={inputStyle}
          value={notes}
        />

        <TouchableOpacity activeOpacity={0.85} onPress={handleSave} style={buttonStyle}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>Save feed</Text>
        </TouchableOpacity>

        <Text style={{ color: "#9a3412", lineHeight: 20 }}>{FEEDING_DISCLAIMER}</Text>

        {logs.length ? (
          <View style={{ gap: 8 }}>
            {logs.slice(0, 3).map((log) => (
              <Text key={log.id} style={{ color: "#64748b" }}>
                {getFeedTypeLabel(log.feedType)} - {log.finishedAmountMl ?? log.offeredAmountMl ?? 0} ml
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}

function Pill({
  label,
  onPress,
  selected
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
        backgroundColor: selected ? "#ede9fe" : "#f8fafc",
        borderColor: selected ? "#c4b5fd" : "#e2e8f0",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9
      }}
    >
      <Text style={{ color: selected ? "#6d28d9" : "#475569", fontWeight: "800" }}>
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
  paddingHorizontal: 14
};

const buttonStyle = {
  alignItems: "center" as const,
  backgroundColor: "#a855f7",
  borderRadius: 18,
  justifyContent: "center" as const,
  minHeight: 50
};
