import {
  Activity,
  Baby,
  Bell,
  Brain,
  CalendarDays,
  Camera,
  CircleUserRound,
  CircleCheck,
  Clock3,
  Droplets,
  Dumbbell,
  FileText,
  Flower2,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  Home,
  LockKeyhole,
  Mic,
  Moon,
  Pill,
  Pencil,
  Plus,
  Salad,
  Scale,
  ScanBarcode,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Save,
  RefreshCw,
  Share2,
  Syringe,
  Trash2,
  TriangleAlert,
  Upload,
  UserRoundCheck,
  UsersRound,
  Watch,
} from "lucide-react-native";
import type { ComponentType } from "react";

export type AppIconName =
  | "today"
  | "home"
  | "calendar"
  | "health"
  | "circle"
  | "profile"
  | "settings"
  | "personal_health"
  | "planning"
  | "child_baby"
  | "baby_child"
  | "pregnancy_cycle"
  | "contraception"
  | "pregnancy"
  | "elder_care"
  | "caregiver"
  | "fitness"
  | "food"
  | "nutrition"
  | "mens_health"
  | "ai"
  | "ai_assistant"
  | "medication"
  | "biometrics"
  | "mood"
  | "sleep"
  | "water"
  | "vaccines"
  | "documents"
  | "records"
  | "privacy"
  | "safety"
  | "checkin"
  | "vitals"
  | "doctor"
  | "scan"
  | "scan_barcode"
  | "wearable"
  | "sync"
  | "device_sync"
  | "calendar_timeline"
  | "weight"
  | "add"
  | "save"
  | "note"
  | "edit"
  | "delete"
  | "search"
  | "voice"
  | "upload"
  | "reminder"
  | "snooze"
  | "shared"
  | "source"
  | "ai_draft"
  | "warning"
  | "success";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export const appIcons: Record<AppIconName, IconComponent> = {
  today: Home,
  home: Home,
  calendar: CalendarDays,
  health: HeartPulse,
  circle: UsersRound,
  profile: CircleUserRound,
  settings: Settings,
  personal_health: HeartPulse,
  planning: CalendarDays,
  child_baby: Baby,
  baby_child: Baby,
  pregnancy_cycle: Flower2,
  contraception: ShieldCheck,
  pregnancy: Flower2,
  elder_care: HandHeart,
  caregiver: HeartHandshake,
  fitness: Dumbbell,
  food: Salad,
  nutrition: Salad,
  mens_health: ShieldCheck,
  ai: Sparkles,
  ai_assistant: Sparkles,
  medication: Pill,
  biometrics: Activity,
  mood: Brain,
  sleep: Moon,
  water: Droplets,
  vaccines: Syringe,
  documents: FileText,
  records: FileText,
  privacy: LockKeyhole,
  safety: ShieldCheck,
  checkin: UserRoundCheck,
  vitals: Activity,
  doctor: Stethoscope,
  scan: Camera,
  scan_barcode: ScanBarcode,
  wearable: Watch,
  sync: RefreshCw,
  device_sync: RefreshCw,
  calendar_timeline: CalendarDays,
  weight: Scale,
  add: Plus,
  save: Save,
  note: Pencil,
  edit: Pencil,
  delete: Trash2,
  search: Search,
  voice: Mic,
  upload: Upload,
  reminder: Bell,
  snooze: Clock3,
  shared: Share2,
  source: FileText,
  ai_draft: Sparkles,
  warning: TriangleAlert,
  success: CircleCheck,
};
