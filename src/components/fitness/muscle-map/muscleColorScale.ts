export function getMuscleFill(score = 0) {
  if (score >= 0.85) return "#7f1d1d";
  if (score >= 0.65) return "#dc2626";
  if (score >= 0.4) return "#f97316";
  if (score >= 0.2) return "#fed7aa";
  return "#e5e7eb";
}

export function getMuscleStroke(score = 0, isSuggested = false, isCaution = false) {
  if (isCaution) return "#7c3aed";
  if (isSuggested) return "#2563eb";
  if (score >= 0.65) return "#991b1b";
  if (score >= 0.2) return "#ea580c";
  return "#cbd5e1";
}

export function getMuscleOpacity(score = 0) {
  if (score >= 0.65) return 1;
  if (score >= 0.2) return 0.9;
  return 0.65;
}
