import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot =
  process.argv[2] ??
  "C:/Users/keeno/AppData/Local/Temp/MuscleMap-main-inspect/MuscleMap-main/Sources/MuscleMap/Data";
const output =
  process.argv[3] ?? "src/components/fitness/muscle-map/bodyPathData.ts";

const sources = {
  female: { back: "FemaleBackPaths.swift", front: "FemaleFrontPaths.swift" },
  male: { back: "MaleBackPaths.swift", front: "MaleFrontPaths.swift" }
};

const muscleKeyBySlug = {
  abs: "abs",
  adductors: "adductors",
  biceps: "biceps",
  calves: "calves",
  chest: "chest",
  deltoids: "side_shoulders",
  forearm: "forearms",
  frontDeltoid: "front_shoulders",
  gluteal: "glutes",
  hamstring: "hamstrings",
  hipFlexors: "hip_flexors",
  innerQuad: "quads",
  lowerChest: "chest",
  lowerAbs: "abs",
  lowerBack: "lower_back",
  lowerTrapezius: "traps",
  neck: "neck",
  obliques: "obliques",
  outerQuad: "quads",
  quadriceps: "quads",
  rearDeltoid: "rear_shoulders",
  rhomboids: "upper_back",
  rotatorCuff: "rear_shoulders",
  serratus: "obliques",
  trapezius: "traps",
  triceps: "triceps",
  upperAbs: "abs",
  upperBack: "upper_back",
  upperChest: "upper_chest",
  upperTrapezius: "traps"
};

function parseArray(block, key) {
  const match = block.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) return [];

  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);
}

function parseParts(source) {
  const parts = [];
  const pattern =
    /BodyPartPathData\(\s*slug:\s*\.(\w+),([\s\S]*?)\n\s*\)(?=\s*,|\s*\])/g;

  for (const match of source.matchAll(pattern)) {
    const slug = match[1];
    const block = match[2];
    const paths = [
      ...parseArray(block, "common"),
      ...parseArray(block, "left"),
      ...parseArray(block, "right")
    ];

    if (paths.length) {
      parts.push({ muscleKey: muscleKeyBySlug[slug], paths, slug });
    }
  }

  return parts;
}

const data = {};

for (const [gender, sides] of Object.entries(sources)) {
  data[gender] = {};
  for (const [side, filename] of Object.entries(sides)) {
    data[gender][side] = parseParts(await readFile(path.join(sourceRoot, filename), "utf8"));
  }
}

const file = `// Adapted from MuscleMap by Melih Colpan under the MIT License.
// Source: https://github.com/melihcolpan/MuscleMap

import type { MuscleKey } from "./muscleLayerMap";

export type BodyGender = "female" | "male";
export type BodyView = "back" | "front";

export type BodyPathPart = {
  muscleKey?: MuscleKey;
  paths: string[];
  slug: string;
};

export const BODY_VIEW_BOXES: Record<BodyGender, Record<BodyView, string>> = {
  female: {
    back: "823 0 650 1450",
    front: "0 0 650 1450"
  },
  male: {
    back: "718 95 727 1280",
    front: "0 95 727 1280"
  }
};

export const BODY_PATHS = ${JSON.stringify(data, null, 2)} as Record<
  BodyGender,
  Record<BodyView, BodyPathPart[]>
>;

export function bodyGenderFromProfile(gender?: string | null): BodyGender {
  const normalized = gender?.trim().toLowerCase();
  return normalized === "female" ||
    normalized === "woman" ||
    normalized === "girl" ||
    normalized === "lady"
    ? "female"
    : "male";
}
`;

await writeFile(output, file);

for (const [gender, sides] of Object.entries(data)) {
  for (const [side, parts] of Object.entries(sides)) {
    console.log(`${gender} ${side}: ${parts.length} body parts`);
  }
}
