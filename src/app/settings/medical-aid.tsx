import {
  Building2,
  CheckCircle2,
  Database,
  Search,
  ShieldCheck,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { AppMainLayout } from "@/components/layout/AppMainLayout";
import { AppAlertCard, AppCard, AppChip, AppSection } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";

const FUTURE_PROFILE_FIELDS = [
  "Scheme name",
  "Plan or option",
  "Member number",
  "Main member or dependant status",
  "Dependants",
  "Coverage lookup consent",
  "Verification status",
];

const FUTURE_DIRECTORY_FILTERS = [
  "Medication name",
  "Active ingredient",
  "Pharmacy",
  "Plan option",
  "Chronic or acute category",
];

const RESULT_LANGUAGE = [
  "Likely covered",
  "Not covered",
  "Needs pre-authorisation",
  "May have co-payment",
  "Network pharmacy required",
  "Cannot verify",
  "Check with scheme or pharmacy",
];

const VERIFIED_SOURCES = [
  "Verified scheme data",
  "Pharmacy integration",
  "Formulary data",
  "Trusted partner API",
  "Manually verified database",
];

export default function MedicalAidFutureSettingsScreen() {
  const { theme } = useAppTheme();

  return (
    <AppMainLayout subtitle="Settings" title="Medical aid">
      <AppAlertCard
        message="Medical aid and coverage lookup are planned features. No scheme, plan, member-number, dependant, or consent data is collected on this screen."
        title="Planned feature"
        variant="warning"
      />

      <AppSection
        title="Reserved medical aid profile"
        subtitle="Information architecture only. These fields are not active inputs."
      >
        <AppCard style={styles.card}>
          <Heading
            icon={<ShieldCheck color={theme.primary} size={21} />}
            title="Future profile fields"
          />
          <ChipList items={FUTURE_PROFILE_FIELDS} />
          <Text style={[styles.body, { color: theme.mutedText }]}>
            Collection remains disabled until private storage, explicit consent,
            access controls, security review, export, and deletion handling are
            ready.
          </Text>
        </AppCard>
      </AppSection>

      <AppSection
        title="Reserved coverage directory"
        subtitle="Coverage lookup can later connect to Health or Scan after verification integrations exist."
      >
        <AppCard style={styles.card}>
          <Heading
            icon={<Search color={theme.primary} size={21} />}
            title="Future search filters"
          />
          <ChipList items={FUTURE_DIRECTORY_FILTERS} />
          <Text style={[styles.body, { color: theme.mutedText }]}>
            Search is intentionally unavailable. The app does not use generic
            internet search as proof of coverage.
          </Text>
        </AppCard>
      </AppSection>

      <AppSection title="Careful result language">
        <AppCard style={styles.card}>
          <Heading
            icon={<CheckCircle2 color={theme.primary} size={21} />}
            title="Possible future states"
          />
          <ChipList items={RESULT_LANGUAGE} />
          <Text style={[styles.body, { color: theme.mutedText }]}>
            Coverage results must never promise pharmacy payment. Users will
            still be directed to confirm with their scheme or pharmacy.
          </Text>
        </AppCard>
      </AppSection>

      <AppSection title="Verification requirements">
        <AppCard style={styles.card}>
          <Heading
            icon={<Database color={theme.primary} size={21} />}
            title="Allowed future sources"
          />
          {VERIFIED_SOURCES.map((source) => (
            <View key={source} style={styles.row}>
              <Building2 color={theme.primary} size={18} />
              <Text style={[styles.value, { color: theme.text }]}>
                {source}
              </Text>
            </View>
          ))}
          <AppChip
            label="No generic web-search coverage logic"
            variant="private"
          />
        </AppCard>
      </AppSection>
    </AppMainLayout>
  );
}

function Heading({ icon, title }: { icon: React.ReactNode; title: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={styles.heading}>
      {icon}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <View style={styles.chips}>
      {items.map((item) => (
        <AppChip key={item} label={item} variant="muted" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 13, lineHeight: 20 },
  card: { gap: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  heading: { alignItems: "center", flexDirection: "row", gap: 10 },
  row: { alignItems: "center", flexDirection: "row", gap: 10 },
  title: { fontSize: 17, fontWeight: "900" },
  value: { flex: 1, fontSize: 14, fontWeight: "800" },
});
