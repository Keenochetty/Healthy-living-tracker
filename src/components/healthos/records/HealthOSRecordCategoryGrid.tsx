import { View } from "react-native";

import { HealthOSCard } from "@/components/healthos/HealthOSCard";

import type { HealthOSRecordCategory, HealthOSRecordCategorySummary } from "./HealthOSRecordsTypes";
import { HealthOSRecordCategoryCard } from "./HealthOSRecordCategoryCard";
import { recordsSharedStyles } from "./HealthOSRecordsShared";

type Props = {
  activeFilters: HealthOSRecordCategory[];
  categories: HealthOSRecordCategorySummary[];
  onToggleFilter: (category: HealthOSRecordCategory) => void;
};

export function HealthOSRecordCategoryGrid({ activeFilters, categories, onToggleFilter }: Props) {
  return (
    <HealthOSCard title="Categories" subtitle="Counts come from saved records only.">
      <View style={recordsSharedStyles.grid}>
        {categories.map((category) => (
          <HealthOSRecordCategoryCard
            category={category}
            key={category.category}
            onPress={() => onToggleFilter(category.category)}
            selected={activeFilters.includes(category.category)}
          />
        ))}
      </View>
    </HealthOSCard>
  );
}
