import {
  FITNESS_GOAL_PATHS,
  type FitnessGoalPath,
} from "@/constants/fitnessRealmConfig";

const DETAILS: Record<string, Partial<FitnessGoalPath>> = {
  "run-5k": {
    currentLevel: "Beginner walk/run",
    difficulty: "Beginner",
    goalType: "Running",
    nutritionSupport:
      "Hydration and carbohydrate support around longer sessions.",
    recoveryRequirement: "At least one lighter day between run sessions.",
    safetyLevel: "General guidance",
    targetLevel: "Comfortable 5km",
    timeline: "4-8 weeks",
    trainingDays: "3 days per week",
    whyItHelps: "Builds aerobic consistency with gradual run-walk progress.",
    progression: steps(
      "Walk/run intervals",
      "Longer running intervals",
      "Build comfortable distance",
      "Reduce walking while keeping an easy pace",
    ),
  },
  "bench-20-50": {
    currentLevel: "20kg with controlled form",
    difficulty: "Intermediate",
    goalType: "Strength",
    nutritionSupport:
      "Protein-focused recovery meals and enough overall energy.",
    recoveryRequirement:
      "Rest pressing muscles between hard sessions and use lighter weeks when needed.",
    safetyLevel: "Progressive loading",
    targetLevel: "50kg with controlled form",
    timeline: "12+ weeks",
    trainingDays: "2-3 strength days weekly",
    whyItHelps:
      "Builds pressing strength through controlled, repeatable training.",
    progression: steps(
      "Confirm starting weight and form",
      "Add small loads only when reps stay controlled",
      "Build consistent working sets",
      "Use rest or a lighter week before continuing",
    ),
  },
  "lose-weight": {
    currentLevel: "Current sustainable routine",
    difficulty: "Adaptable",
    goalType: "Weight loss",
    nutritionSupport:
      "Use calorie-aware food planning without extreme restriction.",
    recoveryRequirement: "Keep recovery days and avoid overtraining.",
    safetyLevel: "Safe pace",
    targetLevel: "Sustainable movement and food habits",
    timeline: "Ongoing",
    trainingDays: "3-5 mixed movement days",
    whyItHelps:
      "Combines strength, cardio and food planning support for sustainable habits.",
    progression: steps(
      "Build a repeatable walking and strength base",
      "Add manageable cardio",
      "Review food planning support",
      "Adjust gradually based on energy and recovery",
    ),
  },
  pregnancy: {
    currentLevel: "Current comfortable movement",
    difficulty: "Adaptable",
    goalType: "Pregnancy-safe movement",
    nutritionSupport:
      "Follow pregnancy nutrition guidance from a qualified professional.",
    recoveryRequirement: "Adjust to your body and rest when needed.",
    safetyLevel: "Professional advice recommended",
    targetLevel: "Comfortable, appropriate movement",
    timeline: "Trimester-aware",
    trainingDays: "Flexible",
    whyItHelps:
      "Supports gentle movement with clear limits and general guidance.",
    progression: steps(
      "Confirm appropriate movement with a professional",
      "Use gentle comfortable sessions",
      "Adjust as your body and trimester change",
      "Stop and seek advice for unsafe symptoms",
    ),
  },
  postpartum: {
    currentLevel: "Gentle return to movement",
    difficulty: "Beginner",
    goalType: "Postpartum recovery",
    nutritionSupport:
      "Prioritise balanced meals, hydration and professional advice when needed.",
    recoveryRequirement: "Progress gradually after professional clearance.",
    safetyLevel: "Professional input",
    targetLevel: "Comfortable core and full-body movement",
    timeline: "Individual",
    trainingDays: "2-3 gentle days",
    whyItHelps: "Creates a careful, low-pressure return to movement.",
    progression: steps(
      "Confirm readiness with a professional",
      "Begin with breathing and gentle movement",
      "Build controlled core work",
      "Progress only when movement feels comfortable",
    ),
  },
  "injury-conscious": {
    currentLevel: "Comfortable pain-free movement",
    difficulty: "Adaptable",
    goalType: "Return to movement",
    nutritionSupport:
      "Use balanced meals and hydration to support general recovery.",
    recoveryRequirement:
      "Stop if symptoms feel unsafe and seek professional advice.",
    safetyLevel: "General guidance only",
    targetLevel: "Consistent comfortable movement",
    timeline: "Individual",
    trainingDays: "Flexible",
    whyItHelps:
      "Provides general return-to-movement guidance without treating injury.",
    progression: steps(
      "Identify comfortable movement",
      "Repeat a low-pressure baseline",
      "Increase one variable gradually",
      "Review symptoms and seek advice when needed",
    ),
  },
};

export function getFitnessGoalDetail(goalId: string): FitnessGoalPath {
  const base =
    FITNESS_GOAL_PATHS.find((goal) => goal.id === goalId) ??
    FITNESS_GOAL_PATHS[0];
  const detail = DETAILS[goalId] ?? {
    currentLevel: "Your current routine",
    difficulty: "Adaptable",
    goalType: base.title,
    nutritionSupport: "Use balanced food planning and hydration support.",
    recoveryRequirement: "Include lighter days and adjust to your body.",
    safetyLevel: base.safetyBadge ?? "General guidance",
    targetLevel: base.subtitle,
    timeline: "4-8 weeks",
    trainingDays: "3 days per week",
    whyItHelps: base.subtitle,
    progression: steps(
      "Establish a comfortable baseline",
      "Build consistency",
      "Progress one variable gradually",
      "Review recovery and adjust",
    ),
  };
  return { ...base, ...detail };
}

function steps(...titles: string[]) {
  return titles.map((title, index) => ({
    description:
      index === titles.length - 1
        ? "Review progress, adjust to your body, and seek professional advice when needed."
        : "Keep the effort controlled and repeatable before progressing.",
    title: `Step ${index + 1}: ${title}`,
  }));
}
