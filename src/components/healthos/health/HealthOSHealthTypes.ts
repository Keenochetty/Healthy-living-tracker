import type { Href } from "expo-router";

import type { HealthOSCardVariant } from "@/components/healthos/HealthOSCard";

export type HealthOSHealthSectionKey =
  | "vitals"
  | "medicationSupplements"
  | "fitnessNutrition"
  | "womenHealth"
  | "pregnancy"
  | "babyChild"
  | "records"
  | "trustedContent"
  | "deviceSync";

export type HealthOSHealthRealm =
  | "general"
  | "medication"
  | "fitness"
  | "nutrition"
  | "women"
  | "pregnancy"
  | "babyChild"
  | "records"
  | "content"
  | "devices";

export type HealthOSHealthSectionMeta = {
  accent?: string;
  defaultVisible: boolean;
  description: string;
  key: HealthOSHealthSectionKey;
  privacyLevel?: "standard" | "sensitive" | "private";
  realm: HealthOSHealthRealm;
  removable: boolean;
  routeTarget?: Href;
  subtitle: string;
  tips: string[];
  title: string;
};

export type HealthOSMetric = {
  label: string;
  status?: "default" | "good" | "warning";
  value: string;
};

export type HealthOSHealthAction = {
  label: string;
  route: Href;
};

export type HealthOSHealthSectionCardVariant = HealthOSCardVariant;

