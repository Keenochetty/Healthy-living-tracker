import { HealthOSPill } from "@/components/healthos/HealthOSPill";

import type { HealthOSAIConfidence } from "@/features/aiImport";

type Props = {
  confidence: HealthOSAIConfidence;
};

export function HealthOSAIConfidenceBadge({ confidence }: Props) {
  const variant = confidence.label === "low" || confidence.label === "unknown" ? "warning" : confidence.label === "high" ? "success" : "default";
  return <HealthOSPill label={`Confidence: ${confidence.label}`} size="sm" variant={variant} />;
}
