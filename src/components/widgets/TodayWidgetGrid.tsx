import { View } from "react-native";
import { WidgetCard } from "./WidgetCard";
import { AppModuleKey } from "@/types/app";
import type { FitnessSummary } from "@/types/fitness";
import type { DailyNutritionSummary } from "@/types/nutrition";
import type { ChildSummary } from "@/types/child";
import type { CyclePrediction } from "@/types/cycle";
import type { ElderSummary } from "@/types/elder";
import type { CaregiverSummary } from "@/types/caregiver";
import type { AiJob } from "@/types/ai";

type TodayWidgetGridProps = {
  enabledModules: AppModuleKey[];
  childSummary?: ChildSummary | null;
  caregiverSummary?: CaregiverSummary | null;
  cyclePrediction?: CyclePrediction | null;
  elderSummary?: ElderSummary | null;
  pendingAiJobs?: AiJob[];
  fitnessSummary?: FitnessSummary | null;
  nutritionSummary?: DailyNutritionSummary | null;
};

export function TodayWidgetGrid({
  childSummary,
  caregiverSummary,
  cyclePrediction,
  elderSummary,
  enabledModules,
  fitnessSummary,
  nutritionSummary,
  pendingAiJobs = [],
}: TodayWidgetGridProps) {
  const hasModule = (moduleKey: AppModuleKey) =>
    enabledModules.includes(moduleKey);

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "space-between",
      }}
    >
      {hasModule("personal_health") ? (
        <>
          <WidgetCard
            title="Mood"
            value="Good"
            helper="Feeling steady"
            variant="pink"
            iconName="mood"
          />

          <WidgetCard
            title="Water"
            value="4 / 8"
            helper="cups today"
            variant="blue"
            iconName="water"
          />

          <WidgetCard
            title="Sleep"
            value="7h 25m"
            helper="good recovery"
            variant="purple"
            iconName="sleep"
          />

          <WidgetCard
            title="Medication"
            value="18:00"
            helper="take with food"
            variant="orange"
            iconName="medication"
          />
        </>
      ) : null}

      {hasModule("planning") ? (
        <WidgetCard
          title="Next Event"
          value="Gym"
          helper="17:00 today"
          variant="blue"
          iconName="planning"
        />
      ) : null}

      {hasModule("fitness") ? (
        <WidgetCard
          title="Steps"
          value={`${fitnessSummary?.stepsToday ?? 0}`}
          helper={
            fitnessSummary?.latestWorkout
              ? `latest: ${fitnessSummary.latestWorkout.title}`
              : "short walk or stretch"
          }
          variant="green"
          iconName="fitness"
        />
      ) : null}

      {hasModule("food") ? (
        <WidgetCard
          title="Food"
          value={
            nutritionSummary?.foodLogCount
              ? `${Math.round(nutritionSummary.calories)} kcal`
              : "Start today"
          }
          helper={
            nutritionSummary?.foodLogCount
              ? `${nutritionSummary.foodLogCount} meals logged`
              : "Log your first meal"
          }
          variant="yellow"
          iconName="food"
        />
      ) : null}

      {hasModule("child_baby") ? (
        <WidgetCard
          title="Baby Feed"
          value={
            childSummary?.latestFeed
              ? `${childSummary.latestFeed.finishedAmountMl ?? childSummary.latestFeed.offeredAmountMl ?? 0} ml`
              : childSummary
                ? "Add feed"
                : "Set up care"
          }
          helper={
            childSummary
              ? `${childSummary.child.displayName} care log`
              : "add a child profile only if needed"
          }
          variant="purple"
          iconName="child_baby"
        />
      ) : null}

      {hasModule("pregnancy_cycle") ? (
        <WidgetCard
          title="Private cycle"
          value={cyclePrediction?.nextPeriodStart ? "Estimate" : "Private"}
          helper={
            cyclePrediction?.nextPeriodStart
              ? `next estimate ${cyclePrediction.nextPeriodStart}`
              : "open private tracker"
          }
          variant="pink"
          iconName="pregnancy_cycle"
        />
      ) : null}

      {hasModule("elder_care") ? (
        <WidgetCard
          title="Elder Check"
          value={
            elderSummary?.latestCheckIn
              ? elderSummary.latestCheckIn.status === "okay"
                ? "Checked in"
                : "Attention"
              : elderSummary
                ? "Check in"
                : "Support a loved one"
          }
          helper={
            elderSummary
              ? `${elderSummary.elder.displayName} - ${elderSummary.activeMedicationCount} active meds`
              : "add only if useful"
          }
          variant="green"
          iconName="checkin"
        />
      ) : null}

      {hasModule("caregiver") ? (
        <WidgetCard
          title="Caregiver"
          value={
            caregiverSummary?.latestCheckIn?.status ??
            (caregiverSummary ? "Check in" : "Set up care help")
          }
          helper={
            caregiverSummary
              ? `${caregiverSummary.caregiver.displayName} - ${caregiverSummary.latestBooking?.status ?? "no booking"}`
              : "add only if useful"
          }
          variant="orange"
          iconName="caregiver"
        />
      ) : null}

      {hasModule("ai_assistant") ? (
        <WidgetCard
          title="AI Helper"
          value={
            pendingAiJobs.length
              ? `${pendingAiJobs.length} drafts`
              : "No drafts"
          }
          helper="review drafts before saving"
          variant="purple"
          iconName="ai_assistant"
        />
      ) : null}

      {hasModule("personal_health") ? (
        <WidgetCard
          title="Mind"
          value="Calm"
          helper="mental check-in"
          variant="blue"
          iconName="mood"
        />
      ) : null}
    </View>
  );
}
