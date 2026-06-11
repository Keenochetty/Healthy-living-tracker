import { Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppButton, AppCard, AppChip, AppFormInput, AppIcon, AppSection } from "@/components/ui";
import { PrivacyBadge } from "@/components/privacy";
import { useAuth } from "@/context/AuthContext";
import { ACCOUNT_DELETION_CONFIRMATION, clearLocalUserState, deleteAuthenticatedAccount, requestServerDataExport } from "@/lib/accountData";
import {
  CONSENT_CATEGORIES,
  completeDataExportRequest,
  createDataDeletionRequest,
  createDataExportRequest,
  denyConsent,
  getConsentRecords,
  getDataDeletionRequests,
  getDataExportRequests,
  getMedicalDisclaimer,
  getPrivacyAuditLogs,
  getPrivacyPolicy,
  getTermsOfUse,
  grantConsent,
  revokeConsent
} from "@/lib/privacyComplianceStorage";
import { appColors, appSpacing, typography } from "@/theme/designSystem";
import { reauthenticate } from "@/lib/securitySettings";
import type {
  ConsentRecord,
  ConsentType,
  DataDeletionRequest,
  DataExportRequest,
  PrivacyAuditLog,
  PrivacyPolicyVersion
} from "@/types/privacyCompliance";

type PrivacyTab =
  | "summary"
  | "policy"
  | "terms"
  | "medical"
  | "consents"
  | "data"
  | "audit"
  | "checklists";

const TABS: Array<{ key: PrivacyTab; label: string }> = [
  { key: "summary", label: "Summary" },
  { key: "policy", label: "Privacy Policy" },
  { key: "terms", label: "Terms" },
  { key: "medical", label: "Medical" },
  { key: "consents", label: "Consents" },
  { key: "data", label: "Export/Delete" },
  { key: "audit", label: "Audit" },
  { key: "checklists", label: "Checklists" }
];

const EXPORT_CATEGORIES = [
  "Full account export",
  "Current profile only",
  "Nutrition",
  "Workout",
  "Biometrics",
  "Medication",
  "Supplements",
  "Records metadata",
  "Calendar/reminders",
  "Women’s Health",
  "Pregnancy",
  "Baby/Child",
  "Men’s Health",
  "Family permissions",
  "AI audit logs"
];

export default function PrivacyCenterScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PrivacyTab>("summary");
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [exports, setExports] = useState<DataExportRequest[]>([]);
  const [deletions, setDeletions] = useState<DataDeletionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<PrivacyAuditLog[]>([]);
  const [policy, setPolicy] = useState<PrivacyPolicyVersion | null>(null);
  const [terms, setTerms] = useState<PrivacyPolicyVersion | null>(null);
  const [medical, setMedical] = useState<PrivacyPolicyVersion | null>(null);
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const [sensitiveActionPassword, setSensitiveActionPassword] = useState("");
  const [sensitiveActionError, setSensitiveActionError] = useState("");
  const [deletionConfirmation, setDeletionConfirmation] = useState("");
  const [deletionCompleted, setDeletionCompleted] = useState(false);
  const [sensitiveActionWorking, setSensitiveActionWorking] = useState(false);

  const loadPrivacyState = useCallback(async () => {
    const [
      nextConsents,
      nextExports,
      nextDeletions,
      nextAuditLogs,
      nextPolicy,
      nextTerms,
      nextMedical
    ] = await Promise.all([
      getConsentRecords(),
      getDataExportRequests(),
      getDataDeletionRequests(),
      getPrivacyAuditLogs(),
      getPrivacyPolicy(),
      getTermsOfUse(),
      getMedicalDisclaimer()
    ]);
    setConsents(nextConsents);
    setExports(nextExports);
    setDeletions(nextDeletions);
    setAuditLogs(nextAuditLogs);
    setPolicy(nextPolicy);
    setTerms(nextTerms);
    setMedical(nextMedical);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPrivacyState();
    }, [loadPrivacyState])
  );

  async function updateConsent(consentType: ConsentType, action: "grant" | "deny" | "revoke") {
    if (action === "grant") await grantConsent(consentType, "privacy_center");
    if (action === "deny") await denyConsent(consentType, "privacy_center");
    if (action === "revoke") await revokeConsent(consentType, "privacy_center");
    await loadPrivacyState();
  }

  async function requestExport() {
    if (!user) {
      setSensitiveActionError("Sign in to request a server-generated export.");
      return;
    }
    setSensitiveActionWorking(true);
    try {
      await reauthenticate(sensitiveActionPassword);
      const request = await createDataExportRequest(EXPORT_CATEGORIES);
      const exportData = await requestServerDataExport(EXPORT_CATEGORIES);
      await completeDataExportRequest(request.id);
      setExportPreview(JSON.stringify(exportData, null, 2));
      setSensitiveActionPassword("");
      setSensitiveActionError("");
      await loadPrivacyState();
    } catch (error) {
      setSensitiveActionError(error instanceof Error ? error.message : "Re-authentication failed.");
    } finally {
      setSensitiveActionWorking(false);
    }
  }

  async function requestDeletion(deletionType: DataDeletionRequest["deletionType"]) {
    if (deletionType !== "full_account") {
      await createDataDeletionRequest({ categories: [deletionType], deletionType });
      await loadPrivacyState();
      return;
    }
    if (!user) {
      setSensitiveActionError("Sign in to delete an account.");
      return;
    }
    if (deletionConfirmation !== ACCOUNT_DELETION_CONFIRMATION) {
      setSensitiveActionError(`Type ${ACCOUNT_DELETION_CONFIRMATION} exactly to continue.`);
      return;
    }
    setSensitiveActionWorking(true);
    try {
      await reauthenticate(sensitiveActionPassword);
      await createDataDeletionRequest({ categories: ["full_account"], deletionType: "full_account" });
      await deleteAuthenticatedAccount(deletionConfirmation);
      setDeletionCompleted(true);
      setSensitiveActionError("");
      await clearLocalUserState();
      setTimeout(() => router.replace("/auth" as Href), 900);
    } catch (error) {
      setSensitiveActionError(error instanceof Error ? error.message : "Re-authentication failed.");
    } finally {
      setSensitiveActionWorking(false);
    }
  }

  return (
    <AppMainLayout subtitle="Settings" title="Privacy Center">
      <AppCard variant="warning">
        <Text style={[typography.cardTitle, { color: appColors.text }]}>Prepared for legal review</Text>
        <Text style={[typography.body, { color: appColors.textSecondary, marginTop: 6 }]}>
          This phase creates compliance preparation, not final legal approval. Final Privacy Policy, Terms, and compliance wording must be reviewed by a qualified legal professional before public release.
        </Text>
      </AppCard>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {TABS.map((tab) => (
          <AppChip
            key={tab.key}
            label={tab.label}
            onPress={() => setActiveTab(tab.key)}
            selected={activeTab === tab.key}
            variant="primary"
          />
        ))}
      </ScrollView>

      {activeTab === "summary" ? <SummaryTab /> : null}
      {activeTab === "policy" && policy ? <DocumentTab document={policy} sections={PRIVACY_POLICY_SECTIONS} /> : null}
      {activeTab === "terms" && terms ? <DocumentTab document={terms} sections={TERMS_SECTIONS} /> : null}
      {activeTab === "medical" && medical ? <MedicalTab document={medical} /> : null}
      {activeTab === "consents" ? (
        <ConsentTab consents={consents} onUpdate={updateConsent} />
      ) : null}
      {activeTab === "data" ? (
        <DataTab
          deletions={deletions}
          exportPreview={exportPreview}
          exports={exports}
          password={sensitiveActionPassword}
          error={sensitiveActionError}
          confirmation={deletionConfirmation}
          deletionCompleted={deletionCompleted}
          working={sensitiveActionWorking}
          signedIn={Boolean(user)}
          onDeletion={requestDeletion}
          onExport={requestExport}
          onConfirmationChange={setDeletionConfirmation}
          onPasswordChange={setSensitiveActionPassword}
        />
      ) : null}
      {activeTab === "audit" ? <AuditTab logs={auditLogs} /> : null}
      {activeTab === "checklists" ? <ChecklistTab /> : null}

      <Text style={[typography.disclaimer, { color: appColors.textSecondary }]}>
        Privacy and consent controls help you manage your data. This does not replace legal advice for the app owner.
      </Text>
    </AppMainLayout>
  );
}

function SummaryTab() {
  const cards = [
    ["Private by default", "Your health information is private by default. You choose which modules to use, what to share, and who can access it."],
    ["You choose what to share", "Family and caregiver access is optional and can be revoked."],
    ["Sensitive health data is protected", "Women’s Health, Pregnancy, Baby / Child, Men’s Health, medication, biometrics, and records are private by default."],
    ["AI is draft-first", "AI suggestions are drafts until you confirm. Sensitive categories default off."],
    ["Device sync is optional", "You choose which data types to import, and synced data is never shared automatically."],
    ["Export or delete", "You can generate an authenticated export or permanently delete your account in-app."]
  ];

  return (
    <>
      <AppSection title="Privacy Summary">
        {cards.map(([title, body]) => (
          <AppCard key={title}>
            <View style={{ alignItems: "center", flexDirection: "row", gap: appSpacing.md }}>
              <AppIcon container name="privacy" size={18} variant="private" />
              <View style={{ flex: 1 }}>
                <Text style={[typography.cardTitle, { color: appColors.text }]}>{title}</Text>
                <Text style={[typography.body, { color: appColors.textSecondary, marginTop: 4 }]}>{body}</Text>
              </View>
            </View>
          </AppCard>
        ))}
      </AppSection>
      <AppSection title="Manage privacy and data">
        <PrivacyLink description="Manage family sharing, Circle permissions, caregiver access, and sharing audit history." route="/(tabs)/circle" title="Sharing and caregiver permissions" />
        <PrivacyLink description="Control sensitive lock-screen details and notification preferences." route="/settings/notifications" title="Notification privacy" />
        <PrivacyLink description="Review, download where supported, manage, or delete uploaded records." route="/records" title="Records and uploaded documents" />
      </AppSection>
    </>
  );
}

function PrivacyLink({ description, route, title }: { description: string; route: string; title: string }) {
  return (
    <AppCard onPress={() => router.push(route as Href)}>
      <Text style={[typography.cardTitle, { color: appColors.text }]}>{title}</Text>
      <Text style={[typography.body, { color: appColors.textSecondary, marginTop: 4 }]}>{description}</Text>
    </AppCard>
  );
}

function DocumentTab({ document, sections }: { document: PrivacyPolicyVersion; sections: string[] }) {
  return (
    <AppSection title={document.title} subtitle="Draft placeholder for legal review. Final version must be reviewed before public release.">
      <PrivacyBadge label={document.status.replace(/_/g, " ")} type="locked" />
      {sections.map((section) => (
        <AppCard key={section}>
          <Text style={[typography.cardTitle, { color: appColors.text }]}>{section}</Text>
          <Text style={[typography.body, { color: appColors.textSecondary, marginTop: 6 }]}>
            Placeholder wording for legal review. This app does not sell user health data, does not use health data for ads, and does not share data without explicit permission.
          </Text>
        </AppCard>
      ))}
      <Text style={[typography.caption, { color: appColors.textMuted }]}>Version {document.version}</Text>
    </AppSection>
  );
}

function MedicalTab({ document }: { document: PrivacyPolicyVersion }) {
  const disclaimers = [
    "Medication/supplements: track reminders and notes only; follow healthcare professional guidance.",
    "Pregnancy: organize appointments, symptoms, questions, and education only.",
    "Baby/child: organize care logs and records only; it does not replace pediatric care.",
    "Women’s Health and contraception: estimates and reminders are for tracking only.",
    "Men’s Health: check-ins and notes do not diagnose or recommend treatment.",
    "Nutrition and workout: wellness tracking only, not clinical advice.",
    "Biometrics and lab results: logs and records should be reviewed with a healthcare professional.",
    "AI assistant: draft-first organization and education only."
  ];

  return (
    <AppSection title={document.title}>
      <AppCard variant="warning">
        <Text style={[typography.body, { color: appColors.text }]}>
          This app is for tracking, organization, reminders, and general education only. It is not medical advice and does not replace a doctor, nurse, clinic, pharmacist, pediatrician, midwife, therapist, fertility specialist, emergency service, or healthcare professional.
        </Text>
      </AppCard>
      {disclaimers.map((text) => (
        <AppCard key={text}>
          <Text style={[typography.body, { color: appColors.textSecondary }]}>{text}</Text>
        </AppCard>
      ))}
      <AppCard variant="danger">
        <Text style={[typography.body, { color: appColors.text }]}>
          If you think something is urgent or severe, contact local emergency services or a healthcare professional immediately.
        </Text>
      </AppCard>
      <Text style={[typography.disclaimer, { color: appColors.textSecondary }]}>
        This app is for tracking, organization, reminders, and education only. It is not medical advice.
      </Text>
    </AppSection>
  );
}

function ConsentTab({ consents, onUpdate }: { consents: ConsentRecord[]; onUpdate: (type: ConsentType, action: "grant" | "deny" | "revoke") => void }) {
  const byType = new Map(consents.map((record) => [record.consentType, record]));
  return (
    <AppSection title="Consent Management" subtitle={consents.length ? "Manage consent by category." : "No consent choices recorded yet."}>
      {CONSENT_CATEGORIES.map((category) => {
        const record = byType.get(category.consentType);
        const status = record?.status ?? "not_requested";
        return (
          <AppCard key={category.consentType} style={{ gap: appSpacing.md }}>
            <View style={{ flexDirection: "row", gap: appSpacing.md, justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.cardTitle, { color: appColors.text }]}>{category.title}</Text>
                <Text style={[typography.body, { color: appColors.textSecondary, marginTop: 4 }]}>{category.description}</Text>
              </View>
              <PrivacyBadge label={status.replace(/_/g, " ")} type={status === "granted" ? "shared_family" : "private"} />
            </View>
            <Text style={[typography.caption, { color: appColors.textMuted }]}>
              Version {record?.consentVersion ?? category.version}
              {record?.grantedAt ? ` · granted ${new Date(record.grantedAt).toLocaleDateString()}` : ""}
              {record?.revokedAt ? ` · revoked ${new Date(record.revokedAt).toLocaleDateString()}` : ""}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: appSpacing.sm }}>
              <AppButton onPress={() => onUpdate(category.consentType, "grant")} size="sm" title="I agree" />
              <AppButton onPress={() => onUpdate(category.consentType, "deny")} size="sm" title="Not now" variant="secondary" />
              <AppButton onPress={() => onUpdate(category.consentType, "revoke")} size="sm" title="Revoke" variant="outline" />
            </View>
          </AppCard>
        );
      })}
    </AppSection>
  );
}

function DataTab({
  deletions,
  exportPreview,
  exports,
  password,
  error,
  confirmation,
  deletionCompleted,
  working,
  signedIn,
  onConfirmationChange,
  onPasswordChange,
  onDeletion,
  onExport
}: {
  deletions: DataDeletionRequest[];
  exportPreview: string | null;
  exports: DataExportRequest[];
  password: string;
  error: string;
  confirmation: string;
  deletionCompleted: boolean;
  working: boolean;
  signedIn: boolean;
  onConfirmationChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onDeletion: (type: DataDeletionRequest["deletionType"]) => void;
  onExport: () => void;
}) {
  return (
    <>
      <AppCard variant="warning" style={{ gap: appSpacing.md }}>
        <Text style={[typography.body, { color: appColors.text }]}>Sensitive exports and full account deletion require your current password.</Text>
        <AppFormInput label="Current password" onChangeText={onPasswordChange} placeholder="Current password" secureTextEntry value={password} />
        {error ? <Text style={{ color: appColors.error }}>{error}</Text> : null}
      </AppCard>
      <AppSection title="Export My Data" subtitle={exports.length ? "Export requests are listed below." : "No data exports requested."}>
        <AppCard style={{ gap: appSpacing.md }}>
          <Text style={[typography.body, { color: appColors.textSecondary }]}>The secure server export contains records owned by your authenticated account. Exports may contain sensitive health information; store them safely.</Text>
          <AppButton disabled={!signedIn} loading={working} onPress={onExport} title="Generate my data export" />
          <AppButton onPress={() => router.push("/records" as Href)} title="Manage uploaded records" variant="secondary" />
        </AppCard>
        {exports.map((request) => (
          <AppCard key={request.id}>
            <Text style={[typography.cardTitle, { color: appColors.text }]}>{request.status}</Text>
            <Text style={[typography.caption, { color: appColors.textSecondary }]}>
              {request.categories.length} categories · {new Date(request.requestedAt).toLocaleString()}
            </Text>
          </AppCard>
        ))}
        {exportPreview ? (
          <AppCard>
            <Text style={[typography.caption, { color: appColors.textSecondary }]}>{exportPreview.slice(0, 500)}</Text>
          </AppCard>
        ) : null}
      </AppSection>

      <AppSection title="Delete My Data / Delete Account" subtitle={deletions.length ? "Deletion requests are listed below." : "No deletion requests."}>
        <AppCard variant="danger" style={{ gap: appSpacing.md }}>
          <Text style={[typography.cardTitle, { color: appColors.text }]}>Permanently delete account</Text>
          <Text style={[typography.body, { color: appColors.text }]}>This deletes your authenticated account and account-owned data. Shared family information owned by other people is not yours to delete.</Text>
          <Text style={[typography.body, { color: appColors.text }]}>Security, fraud-prevention, transaction, and legal records may be retained where required by law or legitimate compliance obligations.</Text>
          <Text style={[typography.body, { color: appColors.text }]}>Account deletion is not blocked by a subscription. Apple or Google Play subscriptions must be cancelled separately through the store.</Text>
          <AppFormInput autoCapitalize="characters" helperText={`Type ${ACCOUNT_DELETION_CONFIRMATION} exactly.`} label="Deletion confirmation" onChangeText={onConfirmationChange} placeholder={ACCOUNT_DELETION_CONFIRMATION} value={confirmation} />
          <AppButton disabled={!signedIn || confirmation !== ACCOUNT_DELETION_CONFIRMATION} loading={working} onPress={() => onDeletion("full_account")} title="Permanently delete my account" variant="danger" />
          {deletionCompleted ? <Text style={[typography.body, { color: appColors.success }]}>Account deletion completed. Clearing local data and returning to sign in.</Text> : null}
        </AppCard>
        {deletions.map((request) => (
          <AppCard key={request.id}>
            <Text style={[typography.cardTitle, { color: appColors.text }]}>{request.deletionType.replace(/_/g, " ")}</Text>
            <Text style={[typography.caption, { color: appColors.textSecondary }]}>
              {request.status} · {new Date(request.requestedAt).toLocaleString()}
            </Text>
          </AppCard>
        ))}
      </AppSection>
    </>
  );
}

function AuditTab({ logs }: { logs: PrivacyAuditLog[] }) {
  return (
    <AppSection title="Privacy Audit Log" subtitle={logs.length ? "Recent privacy-related actions." : "No privacy audit logs yet."}>
      {logs.map((log) => (
        <AppCard key={log.id}>
          <Text style={[typography.cardTitle, { color: appColors.text }]}>{log.action.replace(/_/g, " ")}</Text>
          <Text style={[typography.caption, { color: appColors.textSecondary }]}>
            {log.category ? `${log.category.replace(/_/g, " ")} · ` : ""}
            {new Date(log.createdAt).toLocaleString()}
          </Text>
        </AppCard>
      ))}
    </AppSection>
  );
}

function ChecklistTab() {
  return (
    <AppSection title="Developer Checklists" subtitle="Prepared for legal and app-store review.">
      {[
        ["App Store Privacy Checklist", "APP_STORE_PRIVACY_CHECKLIST.md"],
        ["Google Play Data Safety Checklist", "GOOGLE_PLAY_DATA_SAFETY_CHECKLIST.md"],
        ["POPIA Preparation Checklist", "POPIA_PREPARATION_CHECKLIST.md"],
        ["Data Inventory", "DATA_INVENTORY.md"]
      ].map(([title, file]) => (
        <AppCard key={file} onPress={() => router.push("/settings/privacy-center" as Href)}>
          <Text style={[typography.cardTitle, { color: appColors.text }]}>{title}</Text>
          <Text style={[typography.body, { color: appColors.textSecondary, marginTop: 4 }]}>{file}</Text>
        </AppCard>
      ))}
    </AppSection>
  );
}

const PRIVACY_POLICY_SECTIONS = [
  "What data we collect",
  "Why we collect it",
  "Health data and sensitive data",
  "Family and caregiver sharing",
  "AI assistant data use",
  "Device sync data",
  "Notifications",
  "Documents and uploads",
  "Trusted health content",
  "Data storage and security",
  "Data sharing",
  "Data retention",
  "Export and deletion",
  "Children and family profiles",
  "Regional privacy rights",
  "Contact information",
  "Last updated date"
];

const TERMS_SECTIONS = [
  "Use of the app",
  "Account responsibility",
  "Health tracking only",
  "Not medical advice",
  "No emergency service",
  "User-entered information",
  "Family sharing responsibilities",
  "Caregiver limitations",
  "AI limitations",
  "Trusted content limitations",
  "Subscription/payment placeholder",
  "Account suspension/deletion",
  "Limitation of liability placeholder",
  "Contact",
  "Last updated date"
];
