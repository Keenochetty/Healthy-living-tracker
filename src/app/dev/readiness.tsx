import { View } from "react-native";
import type { ReactNode } from "react";

import { AppBadge, AppCard, AppScreen, AppText } from "@/components/ui-native";
import type { AppBadgeProps } from "@/components/ui-native";
import {
  healthOSDeviceQAMatrix,
  healthOSPerformanceChecklist,
  healthOSPermissionsChecklist,
  healthOSReleaseRiskRegister,
  healthOSStoreReadinessChecklist,
} from "@/features/healthosReadiness";
import type { HealthOSReadinessStatus } from "@/features/healthosReadiness";

export default function HealthOSReadinessScreen() {
  const blockers = healthOSReleaseRiskRegister.filter((risk) => risk.releaseBlocker);
  const performanceNeedsReview = healthOSPerformanceChecklist.filter(
    (item) => item.status === "needsReview" || item.status === "blocker",
  );

  return (
    <AppScreen>
      <View className="gap-2">
        <AppText variant="display">Readiness</AppText>
        <AppText variant="bodyMuted">
          Dev-only performance, device QA, permissions, store readiness, and release risk register.
        </AppText>
      </View>

      <AppCard className="gap-2" variant="compact">
        <View className="flex-row flex-wrap gap-2">
          <AppBadge variant={blockers.length ? "danger" : "success"}>
            {blockers.length} release blockers
          </AppBadge>
          <AppBadge variant="warning">
            {performanceNeedsReview.length} performance checks need review
          </AppBadge>
        </View>
        <AppText variant="caption">
          Static metadata only. This route does not read private user data.
        </AppText>
      </AppCard>

      <Section title="Performance">
        {healthOSPerformanceChecklist.map((item) => (
          <ReadinessCard
            key={item.id}
            meta={item.area}
            status={item.status}
            title={item.check}
            body={item.recommendedAction}
          />
        ))}
      </Section>

      <Section title="Device QA">
        {healthOSDeviceQAMatrix.map((item) => (
          <ReadinessCard
            key={`${item.platform}-${item.deviceClass}-${item.mode}`}
            meta={`${item.platform} / ${item.mode}`}
            status={item.requiredBeforeRelease ? "needsReview" : "deferred"}
            title={item.deviceClass}
            body={item.notes}
          />
        ))}
      </Section>

      <Section title="Permissions">
        {healthOSPermissionsChecklist.map((item) => (
          <ReadinessCard
            key={item.permission}
            meta={item.requestTiming}
            status={item.currentImplementationStatus}
            title={item.permission}
            body={item.risk}
          />
        ))}
      </Section>

      <Section title="Store Readiness">
        {healthOSStoreReadinessChecklist.map((item) => (
          <AppCard className="gap-1" key={item.id} variant="compact">
            <View className="flex-row flex-wrap items-center gap-2">
              <AppText className="flex-1" variant="label">
                {item.requirement}
              </AppText>
              <AppBadge variant={item.releaseBlocker ? "danger" : "neutral"}>
                {item.status}
              </AppBadge>
            </View>
            <AppText variant="caption">{item.platform}</AppText>
          </AppCard>
        ))}
      </Section>

      <Section title="Release Risks">
        {healthOSReleaseRiskRegister.map((risk) => (
          <AppCard className="gap-1" key={risk.id} variant="compact">
            <View className="flex-row flex-wrap items-center gap-2">
              <AppText className="flex-1" variant="label">
                {risk.id}: {risk.area}
              </AppText>
              <AppBadge variant={risk.releaseBlocker ? "danger" : "warning"}>
                {risk.severity}
              </AppBadge>
            </View>
            <AppText variant="caption">{risk.risk}</AppText>
            <AppText variant="caption">{risk.recommendedFix}</AppText>
          </AppCard>
        ))}
      </Section>
    </AppScreen>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View className="gap-3">
      <AppText variant="subtitle">{title}</AppText>
      {children}
    </View>
  );
}

function ReadinessCard({
  body,
  meta,
  status,
  title,
}: {
  body: string;
  meta: string;
  status: HealthOSReadinessStatus;
  title: string;
}) {
  return (
    <AppCard className="gap-1" variant="compact">
      <View className="flex-row flex-wrap items-center gap-2">
        <AppText className="flex-1" variant="label">
          {title}
        </AppText>
        <AppBadge variant={variantForStatus(status)}>{status}</AppBadge>
      </View>
      <AppText variant="caption">{meta}</AppText>
      <AppText variant="caption">{body}</AppText>
    </AppCard>
  );
}

function variantForStatus(status: HealthOSReadinessStatus): AppBadgeProps["variant"] {
  if (status === "pass") return "success";
  if (status === "blocker") return "danger";
  if (status === "needsReview") return "warning";
  return "neutral";
}
