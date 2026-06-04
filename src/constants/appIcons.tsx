import {
  Activity,
  Baby,
  Brain,
  CalendarDays,
  Camera,
  CircleUserRound,
  Droplets,
  Dumbbell,
  FileText,
  Flower2,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  Home,
  LockKeyhole,
  Moon,
  Pill,
  Salad,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  RefreshCw,
  Syringe,
  UserRoundCheck,
  UsersRound,
  Watch
} from "lucide-react-native";
import type { ComponentType } from "react";

export type AppIconName =
  | "today"
  | "calendar"
  | "health"
  | "circle"
  | "profile"
  | "personal_health"
  | "planning"
  | "child_baby"
  | "pregnancy_cycle"
  | "elder_care"
  | "caregiver"
  | "fitness"
  | "food"
  | "ai_assistant"
  | "medication"
  | "mood"
  | "sleep"
  | "water"
  | "vaccines"
  | "documents"
  | "privacy"
  | "safety"
  | "checkin"
  | "vitals"
  | "doctor"
  | "scan"
  | "wearable"
  | "sync"
  | "weight";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export const appIcons: Record<AppIconName, IconComponent> = {
  today: Home,
  calendar: CalendarDays,
  health: HeartPulse,
  circle: UsersRound,
  profile: CircleUserRound,
  personal_health: HeartPulse,
  planning: CalendarDays,
  child_baby: Baby,
  pregnancy_cycle: Flower2,
  elder_care: HandHeart,
  caregiver: HeartHandshake,
  fitness: Dumbbell,
  food: Salad,
  ai_assistant: Sparkles,
  medication: Pill,
  mood: Brain,
  sleep: Moon,
  water: Droplets,
  vaccines: Syringe,
  documents: FileText,
  privacy: LockKeyhole,
  safety: ShieldCheck,
  checkin: UserRoundCheck,
  vitals: Activity,
  doctor: Stethoscope,
  scan: Camera,
  wearable: Watch,
  sync: RefreshCw,
  weight: Scale
};
