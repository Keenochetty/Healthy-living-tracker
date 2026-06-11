import type { AppModuleKey, WidgetKey } from "@/types/app";
import type { UserThemeKey } from "@/types/profile";

export type ProfileRow = {
  avatar_url: string | null;
  country: string | null;
  created_at: string | null;
  date_of_birth?: string | null;
  display_name?: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  language: string | null;
  phone?: string | null;
  preferred_contact_method?: "email" | "phone" | "none" | null;
  timezone: string | null;
  updated_at: string | null;
};

export type ProfileSettingsRow = {
  created_at: string | null;
  currency: string | null;
  date_format: string | null;
  distance_unit: string | null;
  height_unit: string | null;
  id: string;
  liquid_unit: string | null;
  onboarding_complete: boolean | null;
  profile_id: string;
  speed_unit: string | null;
  temperature_unit: string | null;
  theme_key: UserThemeKey | null;
  updated_at: string | null;
  weight_unit: string | null;
};

export type ProfileModuleRow = {
  created_at: string | null;
  enabled: boolean | null;
  id: string;
  module_key: AppModuleKey;
  profile_id: string;
  updated_at: string | null;
};

export type ProfileWidgetRow = {
  created_at: string | null;
  enabled: boolean | null;
  id: string;
  profile_id: string;
  size: "small" | "medium" | "large" | string | null;
  sort_order: number | null;
  updated_at: string | null;
  widget_key: WidgetKey;
};
