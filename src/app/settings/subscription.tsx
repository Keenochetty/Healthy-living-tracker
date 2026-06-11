import { CreditCard, ExternalLink, RefreshCw } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppAlertCard, AppButton, AppCard, AppChip, AppSection } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  canManageSubscription,
  currentPlatform,
  getSubscriptionEntitlement,
  openBillingSupport,
  openSubscriptionManagement,
  restorePurchasesAvailability
} from "@/lib/subscriptionSettings";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { SubscriptionEntitlement, SubscriptionScreenState } from "@/types/subscription";

const PLAN_BENEFITS = [
  "Core health tracking and settings",
  "Private profile and account controls",
  "Family and Circle coordination"
];

export default function SubscriptionSettingsScreen() {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const [state, setState] = useState<SubscriptionScreenState>({ kind: "loading" });
  const [actionError, setActionError] = useState("");
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setState({ kind: "signed_out" });
      return;
    }
    setState({ kind: "loading" });
    try {
      const entitlement = await getSubscriptionEntitlement(user.id);
      setState(entitlement ? { entitlement, kind: "loaded" } : { kind: "unknown", message: "No verified subscription record was found." });
    } catch (error) {
      setState({ kind: "unknown", message: error instanceof Error ? error.message : "Subscription status could not be loaded." });
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function run(action: () => Promise<void>) {
    setWorking(true);
    setActionError("");
    try {
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Billing action failed.");
    } finally {
      setWorking(false);
    }
  }

  const entitlement = state.kind === "loaded" ? state.entitlement : null;
  const platform = entitlement?.platform === "unknown" ? currentPlatform() : entitlement?.platform ?? currentPlatform();
  const restore = restorePurchasesAvailability();

  return (
    <AppMainLayout subtitle="Settings" title="Subscription and billing">
      {actionError ? <AppAlertCard message={actionError} title="Billing action failed" variant="danger" /> : null}
      <AppAlertCard
        message="Subscription status is read from the backend entitlement record. Store cancellation and billing changes are completed through Apple or Google."
        title="Store-managed billing"
      />

      <AppSection title="Current plan">
        {state.kind === "loading" ? (
          <AppCard style={styles.loading}><ActivityIndicator color={theme.primary} /><Text style={[styles.body, { color: theme.mutedText }]}>Loading verified subscription status...</Text></AppCard>
        ) : state.kind === "signed_out" ? (
          <AppAlertCard message="Sign in to view the verified subscription for your account." title="Subscription status unavailable" variant="warning" />
        ) : state.kind === "unknown" ? (
          <AppAlertCard message={state.message} title="Subscription status unknown" variant="warning" />
        ) : (
          <PlanCard entitlement={state.entitlement} />
        )}
      </AppSection>

      <AppSection title="Manage billing">
        <AppCard style={styles.actions}>
          <AppButton
            disabled={!canManageSubscription(platform)}
            iconRight={<ExternalLink color="#ffffff" size={18} />}
            loading={working}
            onPress={() => run(() => openSubscriptionManagement(platform))}
            title={platform === "ios" ? "Manage with Apple" : platform === "android" ? "Manage with Google Play" : "Manage subscription unavailable"}
          />
          <Text style={[styles.body, { color: theme.mutedText }]}>
            The app cannot directly cancel an App Store or Google Play subscription. Account deletion does not automatically cancel a store subscription.
          </Text>
          <AppButton disabled={!restore.available} iconLeft={<RefreshCw color={theme.primary} size={18} />} title="Restore purchases" variant="outline" />
          <Text style={[styles.body, { color: theme.mutedText }]}>{restore.message}</Text>
          <AppButton onPress={() => run(() => openBillingSupport(platform))} title="Billing support" variant="secondary" />
        </AppCard>
      </AppSection>

      <AppSection title="Plan benefits">
        <AppCard style={styles.actions}>
          {PLAN_BENEFITS.map((benefit) => <View key={benefit} style={styles.benefit}><CreditCard color={theme.primary} size={18} /><Text style={[styles.body, styles.flex, { color: theme.text }]}>{benefit}</Text></View>)}
          <Text style={[styles.body, { color: theme.mutedText }]}>Premium feature limits and family-plan benefits will appear here when products are configured.</Text>
        </AppCard>
      </AppSection>
    </AppMainLayout>
  );
}

function PlanCard({ entitlement }: { entitlement: SubscriptionEntitlement }) {
  const { theme } = useAppTheme();
  const free = entitlement.entitlementTier === "free" || entitlement.plan === "free";
  const verified = Boolean(entitlement.lastVerifiedAt);
  return (
    <AppCard style={styles.actions} variant={free ? "default" : "soft"}>
      <View style={styles.between}>
        <View style={styles.flex}><Text style={[styles.plan, { color: theme.text }]}>{format(entitlement.entitlementTier || entitlement.plan)}</Text><Text style={[styles.body, { color: theme.mutedText }]}>{format(entitlement.status)}</Text></View>
        <AppChip label={verified ? "Verified" : free ? "Free plan" : "Verification pending"} variant={verified ? "success" : free ? "muted" : "warning"} />
      </View>
      <StatusRow label="Billing platform" value={format(entitlement.platform)} />
      <StatusRow label="Product" value={entitlement.productId ?? "Not applicable"} />
      <StatusRow label="Trial ends" value={formatDate(entitlement.trialEnd)} />
      <StatusRow label="Current period ends" value={formatDate(entitlement.currentPeriodEnd)} />
      <StatusRow label="Will renew" value={entitlement.willRenew === null ? "Unknown" : entitlement.willRenew ? "Yes" : "No"} />
      <StatusRow label="Cancellation scheduled" value={entitlement.cancelAtPeriodEnd ? "Yes" : "No"} />
      <StatusRow label="Last verified" value={formatDate(entitlement.lastVerifiedAt)} />
    </AppCard>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return <View style={styles.between}><Text style={[styles.body, { color: theme.mutedText }]}>{label}</Text><Text style={[styles.value, { color: theme.text }]}>{value}</Text></View>;
}

function format(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string | null) { return value ? new Date(value).toLocaleString() : "Not available"; }

const styles = StyleSheet.create({
  actions: { gap: 14 },
  benefit: { alignItems: "center", flexDirection: "row", gap: 10 },
  between: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  body: { fontSize: 13, lineHeight: 20 },
  flex: { flex: 1 },
  loading: { alignItems: "center", flexDirection: "row", gap: 12 },
  plan: { fontSize: 24, fontWeight: "900" },
  value: { flexShrink: 1, fontSize: 13, fontWeight: "900", textAlign: "right" }
});
