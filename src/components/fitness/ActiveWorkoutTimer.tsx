import * as KeepAwake from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import {
  INTENSITY_OPTIONS,
  WORKOUT_TYPE_OPTIONS,
} from "@/constants/fitnessOptions";
import {
  completeWorkoutSession,
  createWorkoutSession,
} from "@/lib/fitnessStorage";
import {
  lightFeedback,
  successFeedback,
  warningFeedback,
} from "@/lib/workoutFeedback";
import type {
  WorkoutIntensity,
  WorkoutSession,
  WorkoutType,
} from "@/types/fitness";

type ActiveWorkoutTimerProps = {
  onCompleted: (session: WorkoutSession) => void;
};

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function ActiveWorkoutTimer({ onCompleted }: ActiveWorkoutTimerProps) {
  const [title, setTitle] = useState("Open workout");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("walking");
  const [intensity, setIntensity] = useState<WorkoutIntensity>("easy");
  const [notes, setNotes] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      KeepAwake.activateKeepAwakeAsync("active-workout").catch(() => undefined);
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((current) => current + 1);
      }, 1000);
    } else {
      KeepAwake.deactivateKeepAwake("active-workout").catch(() => undefined);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      KeepAwake.deactivateKeepAwake("active-workout").catch(() => undefined);
    };
  }, [running]);

  async function startTimer() {
    await lightFeedback();
    setStartedAt(new Date().toISOString());
    setRunning(true);
  }

  async function pauseTimer() {
    await warningFeedback();
    setRunning(false);
  }

  async function stopTimer() {
    await warningFeedback();
    setRunning(false);
    setElapsedSeconds(0);
    setStartedAt(null);
  }

  async function completeTimer() {
    await successFeedback();
    setRunning(false);
    const session = await createWorkoutSession({
      durationSeconds: elapsedSeconds,
      intensity,
      notes,
      startedAt: startedAt ?? new Date().toISOString(),
      title,
      workoutType,
    });
    const completedSession = await completeWorkoutSession(session.id, {
      durationSeconds: elapsedSeconds,
      endedAt: new Date().toISOString(),
    });

    if (completedSession) {
      onCompleted(completedSession);
    }
    setElapsedSeconds(0);
    setStartedAt(null);
  }

  return (
    <View
      style={{
        backgroundColor: "#0f172a",
        borderRadius: 28,
        gap: 14,
        padding: 18,
      }}
    >
      <View>
        <Text style={{ color: "#cbd5e1", fontWeight: "800" }}>
          Active workout
        </Text>
        <Text
          style={{
            color: "#ffffff",
            fontSize: 52,
            fontWeight: "900",
            marginTop: 8,
          }}
        >
          {formatElapsed(elapsedSeconds)}
        </Text>
      </View>

      <TextInput
        onChangeText={setTitle}
        placeholder="Workout title"
        placeholderTextColor="#94a3b8"
        style={inputStyle}
        value={title}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {WORKOUT_TYPE_OPTIONS.slice(0, 6).map((option) => (
          <ChoicePill
            key={option.key}
            label={option.label}
            onPress={() => setWorkoutType(option.key)}
            selected={workoutType === option.key}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {INTENSITY_OPTIONS.map((option) => (
          <ChoicePill
            key={option.key}
            label={option.label}
            onPress={() => setIntensity(option.key)}
            selected={intensity === option.key}
          />
        ))}
      </View>

      <TextInput
        multiline
        onChangeText={setNotes}
        placeholder="Optional notes"
        placeholderTextColor="#94a3b8"
        style={{ ...inputStyle, minHeight: 74, paddingTop: 12 }}
        value={notes}
      />

      <Text style={{ color: "#cbd5e1", lineHeight: 20 }}>
        Heart rate connection comes later. You can add it manually if needed.
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {!running && !startedAt ? (
          <TimerButton label="Start" onPress={startTimer} primary />
        ) : null}
        {running ? <TimerButton label="Pause" onPress={pauseTimer} /> : null}
        {!running && startedAt ? (
          <TimerButton label="Resume" onPress={startTimer} primary />
        ) : null}
        <TimerButton label="Stop" onPress={stopTimer} danger />
        <TimerButton label="Complete" onPress={completeTimer} primary />
      </View>
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#1e293b",
  borderRadius: 16,
  color: "#ffffff",
  minHeight: 48,
  paddingHorizontal: 12,
};

function ChoicePill({
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
        backgroundColor: selected ? "#22c55e" : "#1e293b",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 9,
      }}
    >
      <Text
        style={{ color: selected ? "#ffffff" : "#cbd5e1", fontWeight: "900" }}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
        backgroundColor: primary ? "#22c55e" : danger ? "#dc2626" : "#334155",
        borderRadius: 16,
        flexGrow: 1,
        justifyContent: "center",
        minHeight: 48,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: "#ffffff", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}
