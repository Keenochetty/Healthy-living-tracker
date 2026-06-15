import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  HealthDonutChart,
  HealthMiniLineChart,
  HealthProgressRing,
} from "@/components/health/HealthHubCharts";
import { AppCard, AppChip, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import {
  healthRealmAccents,
  realmAccentWithOpacity,
} from "@/theme/healthTheme";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  HealthRecord,
  HealthRecordType,
  PrescriptionRecord,
  RecordsOverviewSummary,
} from "@/types/healthRecords";
import type { Medication, Supplement } from "@/types/medication";

const RECORDS = healthRealmAccents.records;
const RECORDS_SOFT = realmAccentWithOpacity("records", 0.14);

type RecordsCategory = {
  icon: AppIconName;
  label: string;
  types: HealthRecordType[];
};

const CATEGORIES: RecordsCategory[] = [
  { icon: "doctor", label: "Doctor notes", types: ["doctor_note"] },
  {
    icon: "medication",
    label: "Prescriptions",
    types: ["prescription", "medication_label"],
  },
  { icon: "biometrics", label: "Lab results", types: ["lab_result"] },
  { icon: "vaccines", label: "Vaccines", types: ["vaccine_record"] },
  { icon: "safety", label: "Medical aid / insurance", types: ["insurance"] },
  {
    icon: "child_baby",
    label: "School / child docs",
    types: ["birth_record", "child_clinic_card"],
  },
  { icon: "pregnancy", label: "Pregnancy docs", types: ["pregnancy_record"] },
  { icon: "fitness", label: "Fitness / body scans", types: ["imaging"] },
];

export function RecordsRealmOverview({
  onCategory,
  onFilter,
  onScan,
  onUpload,
  medications,
  prescriptions,
  query,
  records,
  summary,
  supplements,
  onQueryChange,
}: {
  medications: Medication[];
  onCategory: (types: HealthRecordType[]) => void;
  onFilter: (filter: "all" | "labs" | "prescriptions" | "vaccines") => void;
  onQueryChange: (value: string) => void;
  onScan: () => void;
  onUpload: () => void;
  prescriptions: PrescriptionRecord[];
  query: string;
  records: HealthRecord[];
  summary: RecordsOverviewSummary | null;
  supplements: Supplement[];
}) {
  const sharedCount = records.filter((record) => isSharedRecord(record)).length;
  const privateCount = records.length - sharedCount;
  const linkedRecords = records.filter(
    (record) => record.relatedMedicationId || record.relatedSupplementId,
  );

  return (
    <View style={styles.stack}>
      <RecordsHero
        privateCount={privateCount}
        records={records}
        sharedCount={sharedCount}
        summary={summary}
      />
      <RecordsActivityMetrics
        privateCount={privateCount}
        records={records}
        sharedCount={sharedCount}
        summary={summary}
      />
      <RecordsQuickActions
        onCategory={onCategory}
        onScan={onScan}
        onUpload={onUpload}
      />
      <SearchAndFilters
        onFilter={onFilter}
        onQueryChange={onQueryChange}
        query={query}
      />
      <CategoryGrid onCategory={onCategory} records={records} />
      <RecentDocuments
        onCategory={onCategory}
        records={summary?.recentRecords ?? records.slice(0, 5)}
      />
      <LinkedMedicationRecords
        linkedRecords={linkedRecords}
        medications={medications}
        onCategory={onCategory}
        prescriptions={prescriptions}
        supplements={supplements}
      />
      <SharingOverview privateCount={privateCount} sharedCount={sharedCount} />
    </View>
  );
}

function RecordsHero({
  privateCount,
  records,
  sharedCount,
  summary,
}: {
  privateCount: number;
  records: HealthRecord[];
  sharedCount: number;
  summary: RecordsOverviewSummary | null;
}) {
  const { theme } = useAppTheme();
  const attention = summary?.recordsNeedingAttention ?? 0;
  const activityScore = records.length
    ? Math.max(
        0,
        Math.round(((records.length - attention) / records.length) * 100),
      )
    : 100;

  return (
    <AppCard
      padding="md"
      style={[
        styles.hero,
        {
          backgroundColor: theme.surface,
          borderColor: realmAccentWithOpacity("records", 0.42),
        },
      ]}
    >
      <View style={styles.heroGlow} />
      <View style={styles.heroTop}>
        <View style={styles.copy}>
          <Text style={styles.heroKicker}>SECURE RECORDS</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            {attention
              ? `${attention} item${attention === 1 ? "" : "s"} need review`
              : "Records are organized"}
          </Text>
          <Text style={[styles.heroBody, { color: theme.mutedText }]}>
            Scans, notes, results, and linked care documents remain private by
            default.
          </Text>
        </View>
        <View style={styles.heroRing}>
          <HealthProgressRing
            color={RECORDS}
            progress={activityScore}
            size={78}
            trackColor={theme.border}
          />
          <Text style={[styles.heroRingValue, { color: theme.text }]}>
            {activityScore}%
          </Text>
        </View>
      </View>
      <View style={styles.heroStats}>
        <HeroStat label="Documents" value={`${records.length}`} />
        <HeroStat label="Private" value={`${privateCount}`} />
        <HeroStat
          label="Follow-ups"
          value={`${summary?.upcomingReminders.length ?? 0}`}
        />
      </View>
      <View style={styles.secureBadge}>
        <AppIcon color="#6d28d9" decorative name="privacy" size={14} />
        <Text style={styles.secureBadgeText}>
          {sharedCount
            ? `${sharedCount} shared with permission`
            : "Private by default"}
        </Text>
      </View>
    </AppCard>
  );
}

function RecordsActivityMetrics({
  privateCount,
  records,
  sharedCount,
  summary,
}: {
  privateCount: number;
  records: HealthRecord[];
  sharedCount: number;
  summary: RecordsOverviewSummary | null;
}) {
  const { theme } = useAppTheme();
  const recentActivity = records
    .slice(0, 7)
    .reverse()
    .map((record, index) => new Date(record.updatedAt).getTime() || index + 1);
  const activity =
    recentActivity.length > 1 ? recentActivity : [0, records.length || 1];

  return (
    <AppSection
      subtitle="Real record activity, privacy flags, and follow-up reminders."
      title="Records snapshot"
    >
      <View style={styles.metricGrid}>
        <AppCard padding="sm" style={styles.metricCard}>
          <View style={styles.metricTop}>
            <View>
              <Text style={[styles.metricLabel, { color: theme.mutedText }]}>
                Privacy distribution
              </Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {records.length}
              </Text>
            </View>
            <HealthDonutChart
              colors={[RECORDS, theme.success]}
              size={52}
              trackColor={theme.border}
              values={[privateCount, sharedCount]}
            />
          </View>
          <Text style={[styles.metricMeta, { color: theme.mutedText }]}>
            {privateCount} private | {sharedCount} shared with permission
          </Text>
        </AppCard>
        <AppCard padding="sm" style={styles.metricCard}>
          <View style={styles.metricTop}>
            <View>
              <Text style={[styles.metricLabel, { color: theme.mutedText }]}>
                Recent activity
              </Text>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {summary?.recentRecords.length ?? 0}
              </Text>
            </View>
            <HealthMiniLineChart
              color={RECORDS}
              data={activity}
              height={42}
              width={86}
            />
          </View>
          <Text style={[styles.metricMeta, { color: theme.mutedText }]}>
            {summary?.upcomingReminders.length ?? 0} upcoming follow-up
            {summary?.upcomingReminders.length === 1 ? "" : "s"}
          </Text>
        </AppCard>
      </View>
    </AppSection>
  );
}

function RecordsQuickActions({
  onCategory,
  onScan,
  onUpload,
}: {
  onCategory: (types: HealthRecordType[]) => void;
  onScan: () => void;
  onUpload: () => void;
}) {
  return (
    <AppSection
      subtitle="Open existing Records workflows without changing storage behavior."
      title="Quick actions"
    >
      <View style={styles.quickActions}>
        <AppChip label="Upload document" onPress={onUpload} selected />
        <AppChip label="Scan record" onPress={onScan} />
        <AppChip
          label="Add medical note"
          onPress={() => onCategory(["health_note"])}
        />
        <AppChip
          label="Add prescription"
          onPress={() => onCategory(["prescription"])}
        />
        <AppChip
          label="Add lab result"
          onPress={() => onCategory(["lab_result"])}
        />
      </View>
    </AppSection>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.heroStat, { backgroundColor: theme.background }]}>
      <Text style={[styles.heroStatValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.heroStatLabel, { color: theme.mutedText }]}>
        {label}
      </Text>
    </View>
  );
}

function SearchAndFilters({
  onFilter,
  onQueryChange,
  query,
}: {
  onFilter: (filter: "all" | "labs" | "prescriptions" | "vaccines") => void;
  onQueryChange: (value: string) => void;
  query: string;
}) {
  const { theme } = useAppTheme();

  return (
    <AppSection
      subtitle="Search titles, tags, clinics, dates, and notes."
      title="Find a record"
    >
      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <AppIcon color={theme.mutedText} decorative name="search" size={19} />
        <TextInput
          onChangeText={onQueryChange}
          placeholder="Search your records"
          placeholderTextColor={theme.mutedText}
          style={[styles.searchInput, { color: theme.text }]}
          value={query}
        />
      </View>
      <View style={styles.filterRow}>
        <FilterChip label="All" onPress={() => onFilter("all")} />
        <FilterChip label="Labs" onPress={() => onFilter("labs")} />
        <FilterChip
          label="Prescriptions"
          onPress={() => onFilter("prescriptions")}
        />
        <FilterChip label="Vaccines" onPress={() => onFilter("vaccines")} />
      </View>
    </AppSection>
  );
}

function FilterChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.filterChip}
    >
      <Text style={styles.filterChipText}>{label}</Text>
    </Pressable>
  );
}

function CategoryGrid({
  onCategory,
  records,
}: {
  onCategory: (types: HealthRecordType[]) => void;
  records: HealthRecord[];
}) {
  const { theme } = useAppTheme();

  return (
    <AppSection
      subtitle="Browse secure records by document type."
      title="Document categories"
    >
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((category) => {
          const count = records.filter((record) =>
            category.types.includes(record.type),
          ).length;

          return (
            <Pressable
              accessibilityRole="button"
              key={category.label}
              onPress={() => onCategory(category.types)}
              style={({ pressed }) => [
                styles.categoryCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.categoryIcon}>
                <AppIcon
                  color={RECORDS}
                  decorative
                  name={category.icon}
                  size={21}
                />
              </View>
              <Text style={[styles.categoryTitle, { color: theme.text }]}>
                {category.label}
              </Text>
              <Text style={[styles.categoryCount, { color: theme.mutedText }]}>
                {count ? `${count} saved` : "No documents"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </AppSection>
  );
}

function RecentDocuments({
  onCategory,
  records,
}: {
  onCategory: (types: HealthRecordType[]) => void;
  records: HealthRecord[];
}) {
  const { theme } = useAppTheme();

  return (
    <AppSection
      subtitle="Your latest uploaded and saved records."
      title="Recent documents"
    >
      {records.length ? (
        <View style={styles.documentList}>
          {records.slice(0, 4).map((record) => {
            const privateRecord = !isSharedRecord(record);
            const privacyLabel = getPrivacyLabel(record);

            return (
              <AppCard
                key={record.id}
                onPress={() => onCategory([record.type])}
                style={[styles.documentRow, { borderColor: theme.border }]}
              >
                <View style={styles.documentIcon}>
                  <AppIcon
                    color={RECORDS}
                    decorative
                    name="documents"
                    size={20}
                  />
                </View>
                <View style={styles.copy}>
                  <Text
                    numberOfLines={1}
                    style={[styles.documentTitle, { color: theme.text }]}
                  >
                    {record.title}
                  </Text>
                  <Text
                    style={[styles.documentMeta, { color: theme.mutedText }]}
                  >
                    {formatLabel(record.type)} |{" "}
                    {record.documentDate ?? formatShortDate(record.createdAt)} |{" "}
                    {record.fileType ? formatLabel(record.fileType) : "Manual"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.privacyPill,
                    privateRecord ? styles.privatePill : styles.sharedPill,
                  ]}
                >
                  <AppIcon
                    color={privateRecord ? "#6d28d9" : "#047857"}
                    decorative
                    name={privateRecord ? "privacy" : "shared"}
                    size={12}
                  />
                  <Text
                    style={[
                      styles.privacyText,
                      { color: privateRecord ? "#6d28d9" : "#047857" },
                    ]}
                  >
                    {privacyLabel}
                  </Text>
                </View>
              </AppCard>
            );
          })}
        </View>
      ) : (
        <AppCard style={[styles.emptyCard, { borderColor: theme.border }]}>
          <View style={styles.emptyIcon}>
            <AppIcon color={RECORDS} decorative name="records" size={23} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No documents yet
          </Text>
          <Text style={[styles.emptyBody, { color: theme.mutedText }]}>
            Upload your first record to build a secure, searchable history.
          </Text>
        </AppCard>
      )}
    </AppSection>
  );
}

function LinkedMedicationRecords({
  linkedRecords,
  medications,
  onCategory,
  prescriptions,
  supplements,
}: {
  linkedRecords: HealthRecord[];
  medications: Medication[];
  onCategory: (types: HealthRecordType[]) => void;
  prescriptions: PrescriptionRecord[];
  supplements: Supplement[];
}) {
  const { theme } = useAppTheme();
  const linkedPrescriptions = prescriptions.filter(
    (prescription) => prescription.relatedMedicationId,
  );
  const total = linkedRecords.length + linkedPrescriptions.length;

  return (
    <AppSection
      actionLabel="Prescriptions"
      onActionPress={() => onCategory(["prescription"])}
      subtitle="Neutral links to medication and supplement records already stored in Records."
      title="Linked medication records"
    >
      {total ? (
        <View style={styles.documentList}>
          {linkedRecords.slice(0, 3).map((record) => {
            const linkedName =
              medications.find((item) => item.id === record.relatedMedicationId)
                ?.name ??
              supplements.find((item) => item.id === record.relatedSupplementId)
                ?.name ??
              "Linked item";
            const privacyLabel = getPrivacyLabel(record);
            return (
              <AppCard
                key={record.id}
                onPress={() => onCategory([record.type])}
                padding="sm"
                style={styles.linkedCard}
              >
                <View style={styles.documentIcon}>
                  <AppIcon color={RECORDS} decorative name="medication" size={19} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.documentTitle, { color: theme.text }]}>
                    {record.title}
                  </Text>
                  <Text style={[styles.documentMeta, { color: theme.mutedText }]}>
                    Linked medication record | {linkedName}
                  </Text>
                </View>
                <AppChip
                  label={privacyLabel}
                  variant={isSharedRecord(record) ? "success" : "private"}
                />
              </AppCard>
            );
          })}
          {linkedPrescriptions.slice(0, Math.max(0, 3 - linkedRecords.length)).map(
            (prescription) => (
              <AppCard
                key={prescription.id}
                onPress={() => onCategory(["prescription"])}
                padding="sm"
                style={styles.linkedCard}
              >
                <View style={styles.documentIcon}>
                  <AppIcon color={RECORDS} decorative name="documents" size={19} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.documentTitle, { color: theme.text }]}>
                    {prescription.title}
                  </Text>
                  <Text style={[styles.documentMeta, { color: theme.mutedText }]}>
                    Prescription attached | Review with provider
                  </Text>
                </View>
              </AppCard>
            ),
          )}
        </View>
      ) : (
        <AppCard padding="sm" variant="soft">
          <Text style={[styles.emptyBody, { color: theme.mutedText }]}>
            No linked medication or supplement records yet.
          </Text>
        </AppCard>
      )}
    </AppSection>
  );
}

function SharingOverview({
  privateCount,
  sharedCount,
}: {
  privateCount: number;
  sharedCount: number;
}) {
  const { theme } = useAppTheme();

  return (
    <AppSection
      subtitle="Private family records are never shown without explicit access."
      title="Privacy and sharing"
    >
      <AppCard style={[styles.sharingCard, { borderColor: theme.border }]}>
        <View style={styles.sharingIcon}>
          <AppIcon color={RECORDS} decorative name="privacy" size={22} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.sharingTitle, { color: theme.text }]}>
            {privateCount} private record{privateCount === 1 ? "" : "s"}
          </Text>
          <Text style={[styles.sharingBody, { color: theme.mutedText }]}>
            {sharedCount
              ? `${sharedCount} record${sharedCount === 1 ? " is" : "s are"} shared with permission indicators.`
              : "Nothing is currently shared with family, partners, or caregivers."}
          </Text>
        </View>
      </AppCard>
    </AppSection>
  );
}

function isSharedRecord(record: HealthRecord) {
  return (
    record.sharedWithCaregiver ||
    record.sharedWithFamily ||
    record.sharedWithPartner ||
    Boolean(record.allowedViewerIds?.length)
  );
}

function getPrivacyLabel(record: HealthRecord) {
  if (record.lockedPrivate) return "Locked";
  return isSharedRecord(record) ? "Shared" : "Private";
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#ddd6fe",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 44,
  },
  actionButtonText: { color: RECORDS, fontSize: 12, fontWeight: "900" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 15, width: "100%" },
  categoryCard: {
    borderRadius: 22,
    borderWidth: 1,
    flexBasis: "46%",
    flexGrow: 1,
    minHeight: 116,
    padding: 14,
  },
  categoryCount: { fontSize: 10, marginTop: 5 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryIcon: {
    alignItems: "center",
    backgroundColor: RECORDS_SOFT,
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
    marginTop: 10,
  },
  copy: { flex: 1 },
  documentIcon: {
    alignItems: "center",
    backgroundColor: RECORDS_SOFT,
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  documentList: { gap: 10 },
  documentMeta: { fontSize: 10, marginTop: 4 },
  documentRow: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    padding: 14,
  },
  documentTitle: { fontSize: 14, fontWeight: "900" },
  emptyBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 20,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: RECORDS_SOFT,
    borderRadius: 18,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  emptyTitle: { fontSize: 16, fontWeight: "900", marginTop: 10 },
  filterChip: {
    backgroundColor: RECORDS_SOFT,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipText: { color: "#6d28d9", fontSize: 11, fontWeight: "900" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  hero: {
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    overflow: "hidden",
    padding: 20,
  },
  heroBody: { fontSize: 13, lineHeight: 20, marginTop: 7 },
  heroGlow: {
    backgroundColor: "rgba(124,58,237,0.11)",
    borderRadius: 999,
    height: 210,
    position: "absolute",
    right: -88,
    top: -115,
    width: 210,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: RECORDS_SOFT,
    borderRadius: 20,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  heroKicker: {
    color: RECORDS,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  heroRing: {
    alignItems: "center",
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  heroRingValue: {
    fontSize: 15,
    fontWeight: "900",
    position: "absolute",
  },
  heroStat: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    flex: 1,
    minHeight: 68,
    padding: 10,
  },
  heroStatLabel: {
    color: "#7e22ce",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  heroStats: { flexDirection: "row", gap: 8, marginTop: 17 },
  heroStatValue: { color: "#3b0764", fontSize: 18, fontWeight: "900" },
  heroTitle: { fontSize: 25, fontWeight: "900", lineHeight: 30, marginTop: 6 },
  heroTop: { alignItems: "center", flexDirection: "row", gap: 12 },
  linkedCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 150,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  metricMeta: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9,
  },
  metricTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  privacyPill: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  privacyText: { fontSize: 9, fontWeight: "900" },
  privatePill: { backgroundColor: RECORDS_SOFT },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  searchBox: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 14, minHeight: 50 },
  secureBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: RECORDS_SOFT,
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    marginTop: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  secureBadgeText: { color: "#6d28d9", fontSize: 10, fontWeight: "900" },
  sharedPill: { backgroundColor: "#d1fae5" },
  sharingBody: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  sharingCard: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    padding: 16,
  },
  sharingIcon: {
    alignItems: "center",
    backgroundColor: RECORDS_SOFT,
    borderRadius: 17,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  sharingTitle: { fontSize: 15, fontWeight: "900" },
  stack: { gap: 24 },
  uploadBody: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    textAlign: "center",
  },
  uploadCard: {
    alignItems: "center",
    borderRadius: 28,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 20,
  },
  uploadIcon: {
    alignItems: "center",
    backgroundColor: RECORDS_SOFT,
    borderRadius: 19,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  uploadTitle: { fontSize: 17, fontWeight: "900", marginTop: 11 },
});
