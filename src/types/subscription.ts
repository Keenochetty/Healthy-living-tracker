export type SubscriptionPlatform = "android" | "ios" | "web" | "unknown";

export type SubscriptionEntitlement = {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  entitlementTier: string;
  familyId: string;
  lastVerifiedAt: string | null;
  plan: string;
  platform: SubscriptionPlatform;
  productId: string | null;
  status: string;
  trialEnd: string | null;
  willRenew: boolean | null;
};

export type SubscriptionScreenState =
  | { kind: "loading" }
  | { kind: "signed_out" }
  | { kind: "unknown"; message: string }
  | { entitlement: SubscriptionEntitlement; kind: "loaded" };
