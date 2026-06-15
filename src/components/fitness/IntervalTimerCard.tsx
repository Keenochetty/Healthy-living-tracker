import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { DEFAULT_TIMER_PRESETS } from "@/constants/fitnessOptions";
import {
  completeWorkoutSession,
  createWorkoutSession,
} from "@/lib/fitnessStorage";
import {
  lightFeedback,
  playTimerBeep,
  successFeedback,
  warningFeedback,
} from "@/lib/workoutFeedback";
import type { IntervalTimerPreset, WorkoutSession } from "@/types/fitness";

type IntervalTimerCardProps = {
  onCompleted: (session: WorkoutSession) => void;
  presets?: IntervalTimerPreset[];
};

function formatCountdown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function IntervalTimerCard({
  onCompleted,
  presets = DEFAULT_TIMER_PRESETS,
}: IntervalTimerCardProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(
    presets[0]?.id ?? "preset-30-30",
  );
  const selectedPreset =
    presets.find((preset) => preset.id === selectedPresetId) ?? presets[0];
  const flatSegments = useMemo(
    () =>
      Array.from({ length: selectedPreset?.rounds ?? 1 }).flatMap(
        () => selectedPreset?.segments ?? [],
      ),
    [selectedPreset],
  );
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    flatSegments[0]?.durationSeconds ?? 30,
  );
  const [running, setRunning] = useState(false);

  const completeInterval = useCallback(async () => {
    await successFeedback();
    const totalDuration = flatSegments.reduce(
      (total, segment) => total + segment.durationSeconds,
      0,
    );
    const session = await createWorkoutSession({
      durationSeconds: totalDuration,
      intensity: "moderate",
      notes: "Completed interval timer session.",
      title: selectedPreset?.title ?? "Interval session",
      workoutType: "hiit",
    });
    const completedSession = await completeWorkoutSession(session.id, {
      durationSeconds: totalDuration,
      endedAt: new Date().toISOString(),
    });

    if (completedSession) {
      onCompleted(completedSession);
    }
  }, [flatSegments, onCompleted, selectedPreset?.title]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(async () => {
      setRemainingSeconds((current) => {
        if (current > 1) {
          return current - 1;
        }

        const nextIndex = segmentIndex + 1;

        if (nextIndex >= flatSegments.length) {
          setRunning(false);
          completeInterval();
          return 0;
        }

        const nextSegment = flatSegments[nextIndex];

        if (nextSegment.vibrationEnabled) {
          lightFeedback();
        }
        if (nextSegment.beepEnabled) {
          playTimerBeep();
        }
        setSegmentIndex(nextIndex);
        return nextSegment.durationSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [completeInterval, flatSegments, running, segmentIndex]);

  function selectPreset(preset: IntervalTimerPreset) {
    setSelectedPresetId(preset.id);
    setSegmentIndex(0);
    setRemainingSeconds(preset.segments[0]?.durationSeconds ?? 30);
    setRunning(false);
  }

  const currentSegment = flatSegments[segmentIndex] ?? flatSegments[0];
  const round = selectedPreset?.segments.length
    ? Math.floor(segmentIndex / selectedPreset.segments.length) + 1
    : 1;

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 28,
        gap: 14,
        padding: 18,
      }}
    >
      <View>
        <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
          Interval timer
        </Text>
        <Text style={{ color: "#64748b", marginTop: 4 }}>
          Default: 30 sec work / 30 sec rest x 4 rounds
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {presets.map((preset) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={preset.id}
            onPress={() => selectPreset(preset)}
            style={{
              backgroundColor:
                selectedPresetId === preset.id ? "#7c3aed" : "#f8fafc",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 9,
            }}
          >
            <Text
              style={{
                color: selectedPresetId === preset.id ? "#ffffff" : "#475569",
                fontWeight: "900",
              }}
            >
              {preset.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={{
          alignItems: "center",
          backgroundColor: "#f8fafc",
          borderRadius: 24,
          padding: 18,
        }}
      >
        <Text style={{ color: "#64748b", fontWeight: "900" }}>
          Round {round} of {selectedPreset?.rounds ?? 1}
        </Text>
        <Text
          style={{
            color: "#0f172a",
            fontSize: 48,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          {formatCountdown(remainingSeconds)}
        </Text>
        <Text
          style={{
            color: "#7c3aed",
            fontSize: 18,
            fontWeight: "900",
            marginTop: 4,
          }}
        >
          {currentSegment?.label ?? "Work"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TimerButton
          label={running ? "Pause" : "Start"}
          onPress={async () => {
            await (running ? warningFeedback() : lightFeedback());
            setRunning((current) => !current);
          }}
          primary={!running}
        />
        <TimerButton
          danger
          label="Stop"
          onPress={async () => {
            await warningFeedback();
            setRunning(false);
            setSegmentIndex(0);
            setRemainingSeconds(flatSegments[0]?.durationSeconds ?? 30);
          }}
        />
      </View>
    </View>
  );
}

function TimerButton({
  danger = false,
  label,
  onPress,
  primary = false,
}: {
  danger?: boolean;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: primary ? "#7c3aed" : danger ? "#fee2e2" : "#ede9fe",
        borderRadius: 16,
        flex: 1,
        justifyContent: "center",
        minHeight: 48,
      }}
    >
      <Text
        style={{
          color: primary ? "#ffffff" : danger ? "#dc2626" : "#6d28d9",
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
