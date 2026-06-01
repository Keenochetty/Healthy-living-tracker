import {
  Baby,
  Bell,
  Bot,
  CalendarPlus,
  HandHeart,
  FileText,
  HeartPulse,
  Home,
  Settings,
  User,
  Users,
  Venus
} from "lucide-react";

export const navItems = [
  { href: "/tabs/home", label: "Home", icon: Home },
  { href: "/tabs/profiles", label: "Profiles", icon: Users },
  { href: "/health/records", label: "Health", icon: HeartPulse },
  { href: "/health/conditions", label: "Conditions", icon: Venus },
  { href: "/tabs/profiles?view=children", label: "Children", icon: Baby },
  { href: "/caregiver/work-mode", label: "Caregiver", icon: HandHeart },
  { href: "/tabs/care", label: "Care", icon: CalendarPlus },
  { href: "/tabs/calendar", label: "Calendar", icon: CalendarPlus },
  { href: "/health/documents", label: "Documents", icon: FileText },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/account", label: "Account", icon: User }
] as const;

export const mobileNavItems = navItems.slice(0, 5);
