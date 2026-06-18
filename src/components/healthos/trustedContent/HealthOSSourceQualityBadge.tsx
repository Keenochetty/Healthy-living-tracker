import { HealthOSPill } from "@/components/healthos/HealthOSPill";
import {
  HEALTHOS_SOURCE_QUALITY_LABELS,
  sourceQualityTone,
  type HealthOSSourceQuality,
} from "@/features/trustedContent";

type Props = {
  quality: HealthOSSourceQuality;
};

export function HealthOSSourceQualityBadge({ quality }: Props) {
  return (
    <HealthOSPill
      label={HEALTHOS_SOURCE_QUALITY_LABELS[quality]}
      size="sm"
      variant={sourceQualityTone(quality)}
    />
  );
}
