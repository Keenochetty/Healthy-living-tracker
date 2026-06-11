export type MuscleKey =
  | "chest"
  | "upper_chest"
  | "front_shoulders"
  | "side_shoulders"
  | "rear_shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "upper_back"
  | "lats"
  | "traps"
  | "lower_back"
  | "abs"
  | "obliques"
  | "glutes"
  | "hip_flexors"
  | "quads"
  | "hamstrings"
  | "calves"
  | "adductors"
  | "abductors"
  | "neck";

export type MuscleTargetRole = "primary" | "secondary" | "stabilizer";

export type MuscleScoreMap = Partial<Record<MuscleKey, number>>;

export const MUSCLE_LABELS: Record<MuscleKey, string> = {
  chest: "Chest",
  upper_chest: "Upper chest",
  front_shoulders: "Front shoulders",
  side_shoulders: "Side shoulders",
  rear_shoulders: "Rear shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  upper_back: "Upper back",
  lats: "Lats",
  traps: "Traps",
  lower_back: "Lower back",
  abs: "Abs",
  obliques: "Obliques",
  glutes: "Glutes",
  hip_flexors: "Hip flexors",
  quads: "Quads",
  hamstrings: "Hamstrings",
  calves: "Calves",
  adductors: "Adductors",
  abductors: "Abductors",
  neck: "Neck",
};

export const MUSCLE_KEYS = Object.keys(MUSCLE_LABELS) as MuscleKey[];

const ALIASES: Record<string, MuscleKey[]> = {
  chest: ["chest"],
  pecs: ["chest"],
  upper_chest: ["upper_chest", "chest"],
  shoulders: ["front_shoulders", "side_shoulders"],
  shoulder: ["front_shoulders", "side_shoulders"],
  delts: ["front_shoulders", "side_shoulders"],
  arms: ["biceps", "triceps", "forearms"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  forearms: ["forearms"],
  back: ["upper_back", "lats"],
  upper_back: ["upper_back"],
  lats: ["lats"],
  traps: ["traps"],
  core: ["abs", "obliques"],
  abs: ["abs"],
  abdominal: ["abs"],
  obliques: ["obliques"],
  legs: ["quads", "hamstrings", "glutes", "calves"],
  quads: ["quads"],
  quadriceps: ["quads"],
  hamstrings: ["hamstrings"],
  glutes: ["glutes"],
  calves: ["calves"],
  hips: ["hip_flexors", "abductors", "adductors"],
  cardio: ["quads", "hamstrings", "calves"],
  mobility: ["hip_flexors", "lower_back", "abs"],
  full_body: ["chest", "upper_back", "abs", "quads", "glutes"],
};

export function muscleKeysFromText(
  value?: string | string[] | null,
): MuscleKey[] {
  if (!value) return [];

  const raw = Array.isArray(value) ? value.join(",") : value;

  const tokens = raw
    .toLowerCase()
    .replace(/[\[\]{}"]/g, "")
    .split(/[,\|;/]+/)
    .map((item) => item.trim().replace(/\s+/g, "_"))
    .filter(Boolean);

  const results = new Set<MuscleKey>();

  for (const token of tokens) {
    if ((MUSCLE_KEYS as string[]).includes(token)) {
      results.add(token as MuscleKey);
      continue;
    }

    const aliasMatches = ALIASES[token];
    if (aliasMatches) {
      aliasMatches.forEach((muscle) => results.add(muscle));
    }
  }

  return Array.from(results);
}

export function topMuscles(scores: MuscleScoreMap, count = 3) {
  return Object.entries(scores)
    .filter(
      (entry): entry is [MuscleKey, number] =>
        Number.isFinite(entry[1]) && Number(entry[1]) > 0,
    )
    .sort((left, right) => right[1] - left[1])
    .slice(0, Math.max(0, count))
    .map(([muscleKey, score]) => ({
      muscleKey,
      label: MUSCLE_LABELS[muscleKey],
      score,
    }));
}

export function normalizeScores(scores: MuscleScoreMap): MuscleScoreMap {
  const cleanScores = Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [
      key,
      Number.isFinite(value) ? Math.max(0, Number(value)) : 0,
    ]),
  ) as MuscleScoreMap;
  const max = Math.max(...Object.values(cleanScores), 0);

  return Object.fromEntries(
    Object.entries(cleanScores).map(([key, value]) => [
      key,
      max ? Math.min(1, Number(value ?? 0) / max) : 0,
    ]),
  ) as MuscleScoreMap;
}
