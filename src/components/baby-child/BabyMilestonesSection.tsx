import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppCard, AppIcon } from "@/components/ui";
import { useAppTheme } from "@/theme/ThemeProvider";
import type {
  BabyMilestone,
  ChildMilestone,
  MilestoneCategory,
  MilestoneStatus,
} from "@/types/child";

const CHECKPOINTS = [2, 4, 6, 9, 12, 18, 24, 36, 48, 60];
const CATEGORIES: Array<{ key: MilestoneCategory; label: string }> = [
  { key: "social_emotional", label: "Social / Emotional" },
  { key: "language_communication", label: "Language / Communication" },
  { key: "cognitive", label: "Cognitive" },
  { key: "movement_physical", label: "Movement / Physical" },
];
const STATUSES: MilestoneStatus[] = [
  "observed",
  "not_yet",
  "unsure",
  "ask_doctor",
];

export type MilestoneDraft = {
  ageCheckpointMonths: number;
  category: MilestoneCategory;
  notes: string;
  status: MilestoneStatus;
  title: string;
};

export function BabyMilestonesSection({
  ageCheckpointMonths,
  category,
  checklist,
  logs,
  notes,
  onAgeChange,
  onCategoryChange,
  onNotesChange,
  onSave,
  onStatusChange,
  onTitleChange,
  status,
  title,
}: {
  ageCheckpointMonths: number;
  category: MilestoneCategory;
  checklist: BabyMilestone[];
  logs: ChildMilestone[];
  notes: string;
  onAgeChange: (age: number) => void;
  onCategoryChange: (category: MilestoneCategory) => void;
  onNotesChange: (notes: string) => void;
  onSave: () => void;
  onStatusChange: (status: MilestoneStatus) => void;
  onTitleChange: (title: string) => void;
  status: MilestoneStatus;
  title: string;
}) {
  const { theme } = useAppTheme();
  const filteredChecklist = checklist
    .filter((item) => item.category === category)
    .slice(0, 6);

  return (
    <View style={styles.stack}>
      <AppCard
        style={[
          styles.hero,
          {
            backgroundColor: warmSurface(theme.background, theme.surface),
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: theme.surface }]}>
            <AppIcon
              color={theme.primary}
              decorative
              name="checkin"
              size={24}
            />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: theme.text }]}>
              Milestone Guide
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedText }]}>
              Track what you notice as your child grows.
            </Text>
          </View>
        </View>
      </AppCard>

      <SectionTitle title="Age checkpoint" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {CHECKPOINTS.map((age) => (
          <ChoiceChip
            key={age}
            label={formatAge(age)}
            onPress={() => onAgeChange(age)}
            selected={ageCheckpointMonths === age}
          />
        ))}
      </ScrollView>

      <SectionTitle
        subtitle="Choose a category to view and record observations."
        title="Categories"
      />
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: category === item.key }}
            key={item.key}
            onPress={() => onCategoryChange(item.key)}
            style={({ pressed }) => [
              styles.category,
              {
                backgroundColor:
                  category === item.key ? theme.primarySoft : theme.surface,
                borderColor:
                  category === item.key ? theme.primary : theme.border,
              },
              pressed ? styles.pressed : null,
            ]}
          >
            <AppIcon
              color={theme.primary}
              decorative
              name={iconFor(item.key)}
              size={20}
            />
            <Text style={[styles.categoryText, { color: theme.text }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Milestone checklist" />
      {filteredChecklist.length ? (
        <AppCard
          padding="sm"
          style={[
            styles.list,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {filteredChecklist.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.checkRow,
                index < filteredChecklist.length - 1
                  ? { borderBottomColor: theme.border, borderBottomWidth: 1 }
                  : null,
              ]}
            >
              <View
                style={[
                  styles.checkDot,
                  { backgroundColor: theme.primarySoft },
                ]}
              />
              <View style={styles.copy}>
                <Text style={[styles.checkTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.checkMeta, { color: theme.mutedText }]}>
                  {categoryLabel(item.category)} ·{" "}
                  {formatAge(item.ageCheckpointMonths)}
                </Text>
              </View>
            </View>
          ))}
        </AppCard>
      ) : (
        <AppCard
          style={[
            styles.empty,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            Start milestone tracking
          </Text>
          <Text style={[styles.subtitle, { color: theme.mutedText }]}>
            Mark what you notice. Every child develops differently.
          </Text>
        </AppCard>
      )}

      <SectionTitle
        subtitle="Add a note or question using calm, descriptive wording."
        title="Notes or questions"
      />
      <AppCard
        style={[
          styles.form,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <TextInput
          onChangeText={onTitleChange}
          placeholder="What did you notice?"
          placeholderTextColor={theme.mutedText}
          style={[
            styles.input,
            { borderColor: theme.border, color: theme.text },
          ]}
          value={title}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {STATUSES.map((item) => (
            <ChoiceChip
              key={item}
              label={statusLabel(item)}
              onPress={() => onStatusChange(item)}
              selected={status === item}
            />
          ))}
        </ScrollView>
        <TextInput
          multiline
          onChangeText={onNotesChange}
          placeholder="Optional note or question"
          placeholderTextColor={theme.mutedText}
          style={[
            styles.input,
            styles.notes,
            { borderColor: theme.border, color: theme.text },
          ]}
          value={notes}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onSave}
          style={({ pressed }) => [
            styles.save,
            { backgroundColor: theme.primary },
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.saveText}>Save milestone note</Text>
        </Pressable>
      </AppCard>

      {logs.length ? (
        <>
          <SectionTitle title="Recent milestone notes" />
          <AppCard
            padding="sm"
            style={[
              styles.list,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {logs.slice(0, 6).map((log, index) => (
              <View
                key={log.id}
                style={[
                  styles.checkRow,
                  index < Math.min(logs.length, 6) - 1
                    ? { borderBottomColor: theme.border, borderBottomWidth: 1 }
                    : null,
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: theme.primary }]}
                />
                <View style={styles.copy}>
                  <Text style={[styles.checkTitle, { color: theme.text }]}>
                    {log.title}
                  </Text>
                  <Text style={[styles.checkMeta, { color: theme.mutedText }]}>
                    {statusLabel(log.status ?? "observed")} ·{" "}
                    {categoryLabel(log.category)}
                  </Text>
                </View>
              </View>
            ))}
          </AppCard>
        </>
      ) : null}

      <AppCard
        padding="md"
        style={[
          styles.note,
          { backgroundColor: theme.primarySoft, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.noteText, { color: theme.mutedText }]}>
          Every child develops differently. If you are concerned about
          development, speak to a pediatrician or healthcare professional.
        </Text>
      </AppCard>
    </View>
  );
}

function SectionTitle({
  subtitle,
  title,
}: {
  subtitle?: string;
  title: string;
}) {
  const { theme } = useAppTheme();
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function ChoiceChip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[styles.chipText, { color: selected ? "#ffffff" : theme.text }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function formatAge(age: number) {
  if (age === 24) return "2y";
  if (age === 36) return "3y";
  if (age === 48) return "4y";
  if (age === 60) return "5y";
  return `${age}m`;
}

function categoryLabel(category: MilestoneCategory) {
  return CATEGORIES.find((item) => item.key === category)?.label ?? "Milestone";
}

function statusLabel(status: MilestoneStatus) {
  if (status === "not_yet") return "Not yet";
  if (status === "ask_doctor") return "Ask doctor";
  return status.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function iconFor(category: MilestoneCategory) {
  if (category === "language_communication") return "voice";
  if (category === "cognitive") return "mood";
  if (category === "movement_physical") return "fitness";
  return "checkin";
}

function warmSurface(background: string, surface: string) {
  return background === "#0f172a" ? surface : "#f4f0ff";
}

const styles = StyleSheet.create({
  category: {
    borderRadius: 20,
    borderWidth: 1,
    flexBasis: "46%",
    flexGrow: 1,
    gap: 9,
    minHeight: 94,
    padding: 14,
  },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryText: { fontWeight: "900", lineHeight: 18 },
  checkDot: { borderRadius: 999, height: 14, width: 14 },
  checkMeta: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 68,
    padding: 10,
  },
  checkTitle: { fontWeight: "900" },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: { fontWeight: "900" },
  chips: { flexDirection: "row", gap: 8, paddingRight: 12 },
  copy: { flex: 1 },
  empty: { borderWidth: 1 },
  emptyTitle: { fontSize: 17, fontWeight: "900" },
  form: { borderWidth: 1, gap: 14 },
  heading: { alignItems: "center", flexDirection: "row", gap: 12 },
  hero: { borderWidth: 1 },
  icon: {
    alignItems: "center",
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  list: { borderWidth: 1 },
  note: { borderWidth: 1 },
  notes: { minHeight: 88, textAlignVertical: "top" },
  noteText: { fontSize: 12, lineHeight: 19 },
  pressed: { opacity: 0.76 },
  save: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  saveText: { color: "#ffffff", fontWeight: "900" },
  sectionTitle: { fontSize: 21, fontWeight: "900" },
  stack: { gap: 16 },
  statusDot: { borderRadius: 999, height: 10, width: 10 },
  subtitle: { lineHeight: 20, marginTop: 4 },
  title: { fontSize: 22, fontWeight: "900" },
});
