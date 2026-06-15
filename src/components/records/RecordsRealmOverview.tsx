import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppCard, AppIcon, AppSection } from "@/components/ui";
import type { AppIconName } from "@/constants/appIcons";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  HealthRecord,
  HealthRecordType,
  RecordsOverviewSummary,
} from "@/types/healthRecords";

const RECORDS = "#7c3aed";
const RECORDS_SOFT = "#f3e8ff";

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
  query,
  records,
  summary,
  onQueryChange,
}: {
  onCategory: (types: HealthRecordType[]) => void;
  onFilter: (filter: "all" | "labs" | "prescriptions" | "vaccines") => void;
  onQueryChange: (value: string) => void;
  onScan: () => void;
  onUpload: () => void;
  query: string;
  records: HealthRecord[];
  summary: RecordsOverviewSummary | null;
}) {
  const sharedCount = records.filter((record) => isSharedRecord(record)).length;
  const privateCount = records.length - sharedCount;

  return (
    <View style={styles.stack}>
      <RecordsHero
        privateCount={privateCount}
        records={records}
        sharedCount={sharedCount}
        summary={summary}
      />
      <UploadActions onScan={onScan} onUpload={onUpload} />
      <SearchAndFilters
        onFilter={onFilter}
        onQueryChange={onQueryChange}
        query={query}
      />
      <CategoryGrid onCategory={onCategory} records={records} />
      <RecentDocuments
        records={summary?.recentRecords ?? records.slice(0, 5)}
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

  return (
    <AppCard style={[styles.hero, { borderColor: `${RECORDS}38` }]}>
      <View style={styles.heroGlow} />
      <View style={styles.heroTop}>
        <View style={styles.heroIcon}>
          <AppIcon color={RECORDS} decorative name="records" size={27} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.heroKicker}>SECURE RECORDS</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Your health documents, organized
          </Text>
          <Text style={[styles.heroBody, { color: theme.mutedText }]}>
            Keep scans, notes, results, and family health history private and
            easy to find.
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

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function UploadActions({
  onScan,
  onUpload,
}: {
  onScan: () => void;
  onUpload: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.uploadCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.uploadIcon}>
        <AppIcon color={RECORDS} decorative name="upload" size={24} />
      </View>
      <Text style={[styles.uploadTitle, { color: theme.text }]}>
        Upload a document
      </Text>
      <Text style={[styles.uploadBody, { color: theme.mutedText }]}>
        Add a file, photo, prescription, scan, or medical note.
      </Text>
      <View style={styles.actionRow}>
        <ActionButton icon="upload" label="Upload" onPress={onUpload} />
        <ActionButton icon="scan" label="Scan" onPress={onScan} />
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: "scan" | "upload";
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed ? styles.pressed : null,
      ]}
    >
      <AppIcon color={RECORDS} decorative name={icon} size={17} />
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
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

function RecentDocuments({ records }: { records: HealthRecord[] }) {
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

            return (
              <AppCard
                key={record.id}
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
                    {record.documentDate ?? "No date"}
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
                    {privateRecord ? "Private" : "Shared"}
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
