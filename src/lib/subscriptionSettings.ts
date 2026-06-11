import { Linking, Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import type { SubscriptionEntitlement, SubscriptionPlatform } from "@/types/subscription";

type SubscriptionRow = {
  cancel_at_period_end: boolean | null;
  current_period_end: string | null;
  entitlement_tier: string | null;
  family_id: string;
  last_verified_at: string | null;
  plan: string | null;
  platform: string | null;
  product_id: string | null;
  status: string | null;
  trial_end: string | null;
  will_renew: boolean | null;
};

const MANAGE_URLS: Partial<Record<SubscriptionPlatform, string>> = {
  android: "https://play.google.com/store/account/subscriptions",
  ios: "https://apps.apple.com/account/subscriptions"
};

const SUPPORT_URLS: Partial<Record<SubscriptionPlatform, string>> = {
  android: "https://support.google.com/googleplay/topic/3365267",
  ios: "https://support.apple.com/billing"
};

export async function getSubscriptionEntitlement(userId: string): Promise<SubscriptionEntitlement | null> {
  const result = await supabase
    .from("subscriptions")
    .select("family_id,plan,status,current_period_end,platform,product_id,entitlement_tier,trial_end,will_renew,cancel_at_period_end,last_verified_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) throw new Error(result.error.message);
  if (!result.data) return null;

  const row = result.data as SubscriptionRow;
  return {
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
    currentPeriodEnd: row.current_period_end,
    entitlementTier: row.entitlement_tier ?? row.plan ?? "free",
    familyId: row.family_id,
    lastVerifiedAt: row.last_verified_at,
    plan: row.plan ?? "free",
    platform: normalizePlatform(row.platform),
    productId: row.product_id,
    status: row.status ?? "unknown",
    trialEnd: row.trial_end,
    willRenew: row.will_renew
  };
}

export function currentPlatform(): SubscriptionPlatform {
  return normalizePlatform(Platform.OS);
}

export function canManageSubscription(platform: SubscriptionPlatform) {
  return Boolean(MANAGE_URLS[platform]);
}

export async function openSubscriptionManagement(platform: SubscriptionPlatform) {
  const url = MANAGE_URLS[platform];
  if (!url) throw new Error("Subscription management is not configured for this platform.");
  await openExternalUrl(url);
}

export async function openBillingSupport(platform: SubscriptionPlatform) {
  const effectivePlatform = platform === "unknown" ? currentPlatform() : platform;
  const url = SUPPORT_URLS[effectivePlatform];
  if (!url) throw new Error("Billing support is not configured for this platform.");
  await openExternalUrl(url);
}

export function restorePurchasesAvailability() {
  return {
    available: false,
    message: "Restore purchases requires a native purchase SDK and server-side receipt verification. It is not configured yet."
  };
}

function normalizePlatform(value: string | null): SubscriptionPlatform {
  if (value === "ios" || value === "android" || value === "web") return value;
  return "unknown";
}

async function openExternalUrl(url: string) {
  const supported = await Linking.canOpenURL(url);
  if (!supported) throw new Error("This management link could not be opened on this device.");
  await Linking.openURL(url);
}
