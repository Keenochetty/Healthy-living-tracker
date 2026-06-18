import * as ImagePicker from "expo-image-picker";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { SmartLogReviewScreen } from "@/components/nutrition/SmartLogReviewScreen";
import { AppCard } from "@/components/ui/AppCard";
import { NUTRITION_MEAL_GROUP_OPTIONS } from "@/constants/nutritionOptions";
import { ensureImagePickerPermission } from "@/lib/devicePermissions";
import {
  cancelSmartLogSession,
  confirmSmartLogSession,
  addSmartLogSuggestedEntry,
  createMealPhotoDraft,
  createNutritionLabelDraft,
  createQuickMealBuilderDraft,
  createRecipeUrlDraft,
  createRepeatMealDraft,
  createVoiceLogDraft,
  getQuickMealBuilderFoods,
  getSmartLogSuggestedEntries,
} from "@/services/nutrition/smartLoggingService";
import type { NutritionMealGroup } from "@/types/nutrition";
import type {
  SmartLogMethod,
  SmartLogSession,
  SmartLogSuggestedEntry,
} from "@/types/smartLogging";

const INPUT_STYLE = {
  backgroundColor: "#ffffff",
  borderColor: "#fde68a",
  borderRadius: 16,
  borderWidth: 1,
  color: "#0f172a",
  minHeight: 50,
  paddingHorizontal: 14,
};

const METHODS: Array<{
  description: string;
  key: SmartLogMethod;
  label: string;
}> = [
  {
    description: "Create an editable draft from a meal photo placeholder.",
    key: "meal_photo",
    label: "Take Meal Photo",
  },
  {
    description: "Create an editable custom food draft from label values.",
    key: "nutrition_label",
    label: "Scan Nutrition Label",
  },
  {
    description: "Type what you ate and review parsed draft items.",
    key: "voice_log",
    label: "Voice Log Meal",
  },
  {
    description: "Prepare recipe link import for a later backend.",
    key: "recipe_url",
    label: "Import Recipe from Link",
  },
  {
    description: "Repeat a recent meal and adjust it before saving.",
    key: "repeat_meal",
    label: "Repeat Previous Meal",
  },
  {
    description: "Combine recent, favourite, custom foods, meals, and recipes.",
    key: "quick_meal_builder",
    label: "Quick Meal Builder",
  },
];

type BuilderFood = Awaited<ReturnType<typeof getQuickMealBuilderFoods>>[number];

export default function SmartLogScreen() {
  const params = useLocalSearchParams<{
    method?: SmartLogMethod;
    mealGroup?: NutritionMealGroup;
  }>();
  const [method, setMethod] = useState<SmartLogMethod | null>(
    params.method ?? null,
  );
  const [mealGroup, setMealGroup] = useState<NutritionMealGroup>(
    params.mealGroup ?? "breakfast",
  );
  const [session, setSession] = useState<SmartLogSession | null>(null);
  const [entries, setEntries] = useState<SmartLogSuggestedEntry[]>([]);
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [voiceText, setVoiceText] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [builderFoods, setBuilderFoods] = useState<BuilderFood[]>([]);
  const [selectedBuilderFoods, setSelectedBuilderFoods] = useState<
    BuilderFood[]
  >([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (method === "quick_meal_builder") {
      Promise.resolve()
        .then(getQuickMealBuilderFoods)
        .then(setBuilderFoods)
        .catch(() => setBuilderFoods([]));
    }
  }, [method]);

  async function pickImage() {
    if (!(await ensureImagePickerPermission("photos"))) {
      setStatusMessage(
        "Photo-library access was denied. You can enable it in system settings or continue without a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri);
    }
  }

  async function createDraft() {
    if (!method) {
      return;
    }

    setStatusMessage(null);
    const input = { imageUri, mealGroup };
    const draft =
      method === "meal_photo"
        ? await createMealPhotoDraft(input)
        : method === "nutrition_label"
          ? await createNutritionLabelDraft(input)
          : method === "voice_log"
            ? await createVoiceLogDraft({ inputText: voiceText, mealGroup })
            : method === "recipe_url"
              ? await createRecipeUrlDraft({ mealGroup, recipeUrl })
              : method === "repeat_meal"
                ? await createRepeatMealDraft({ mealGroup })
                : await createQuickMealBuilderDraft({
                    items: selectedBuilderFoods,
                    mealGroup,
                  });

    setSession(draft.session);
    setEntries(draft.suggestedEntries);
    setStatusMessage(draft.session.message ?? null);
  }

  async function addDraftEntry() {
    if (!session) {
      return;
    }

    await addSmartLogSuggestedEntry(session.id, {
      calories: 0,
      carbsG: 0,
      confidence: 0.1,
      fatG: 0,
      foodName: "New draft food",
      mealGroup,
      notes: "Added manually during Smart Log review.",
      proteinG: 0,
      quantity: 1,
      source: "custom",
      sourceFoodId: `smart-manual-${Date.now()}`,
      unit: "serving",
    });
    setEntries(await getSmartLogSuggestedEntries(session.id));
  }

  async function confirmSession() {
    if (!session) {
      return;
    }

    setSaving(true);
    await confirmSmartLogSession(session.id);
    setSaving(false);
    router.replace({ pathname: "/(tabs)/food", params: { tab: "diary" } } as Href);
  }

  async function cancelSession() {
    if (session) {
      await cancelSmartLogSession(session.id);
    }

    router.replace({ pathname: "/(tabs)/food", params: { tab: "add" } } as Href);
  }

  if (session) {
    return (
      <ScreenWrapper backgroundColor="#fffaf0">
        <Header
          subtitle={getMethodLabel(session.method)}
          title="Smart Log Review"
        />
        <SmartLogReviewScreen
          entries={entries}
          onAddEntry={addDraftEntry}
          onCancel={cancelSession}
          onConfirm={confirmSession}
          onEntriesChanged={setEntries}
          saving={saving}
          session={session}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundColor="#fffaf0">
      <Header subtitle="Food / Nutrition" title="Smart Log" />

      <AppCard backgroundColor="#fffbeb">
        <Text style={{ color: "#92400e", lineHeight: 21 }}>
          Smart logging may use photos, voice, or text you provide to create
          draft food entries. Review all suggestions before saving.
        </Text>
      </AppCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {METHODS.map((item) => (
          <TouchableOpacity
            activeOpacity={0.85}
            key={item.key}
            onPress={() => setMethod(item.key)}
            style={{
              backgroundColor: method === item.key ? "#f59e0b" : "#ffffff",
              borderColor: "#fde68a",
              borderRadius: 20,
              borderWidth: 1,
              flexGrow: 1,
              minHeight: 112,
              minWidth: "45%",
              padding: 14,
            }}
          >
            <Text
              style={{
                color: method === item.key ? "#ffffff" : "#0f172a",
                fontSize: 17,
                fontWeight: "900",
              }}
            >
              {item.label}
            </Text>
            <Text
              style={{
                color: method === item.key ? "#fffbeb" : "#64748b",
                lineHeight: 19,
                marginTop: 6,
              }}
            >
              {item.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {method ? (
        <AppCard>
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#0f172a", fontSize: 20, fontWeight: "900" }}>
              {getMethodLabel(method)}
            </Text>
            <MealGroupPicker mealGroup={mealGroup} onChange={setMealGroup} />
            {method === "meal_photo" || method === "nutrition_label" ? (
              <View style={{ gap: 10 }}>
                {imageUri ? (
                  <Image
                    alt="Selected food image"
                    source={{ uri: imageUri }}
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: 18,
                      height: 180,
                      width: "100%",
                    }}
                  />
                ) : null}
                <SecondaryButton
                  label={imageUri ? "Choose another image" : "Choose photo"}
                  onPress={pickImage}
                />
                <Text style={{ color: "#64748b", lineHeight: 21 }}>
                  {method === "meal_photo"
                    ? "Photo analysis is prepared but not connected yet. You can still add food manually from this photo."
                    : "Label scanning is prepared but not connected yet. Enter the label values manually."}
                </Text>
              </View>
            ) : null}
            {method === "voice_log" ? (
              <TextInput
                multiline
                onChangeText={setVoiceText}
                placeholder="Type what you ate"
                placeholderTextColor="#94a3b8"
                style={{ ...INPUT_STYLE, minHeight: 110, paddingTop: 13 }}
                value={voiceText}
              />
            ) : null}
            {method === "recipe_url" ? (
              <View style={{ gap: 10 }}>
                <TextInput
                  onChangeText={setRecipeUrl}
                  placeholder="Recipe link"
                  placeholderTextColor="#94a3b8"
                  style={INPUT_STYLE}
                  value={recipeUrl}
                />
                <Text style={{ color: "#64748b", lineHeight: 21 }}>
                  Recipe link import is prepared for a backend connection later.
                  No recipe page is scraped in this phase.
                </Text>
                <SecondaryButton
                  label="Create recipe manually"
                  onPress={() => router.push("/food/recipe" as Href)}
                />
              </View>
            ) : null}
            {method === "quick_meal_builder" ? (
              <QuickMealBuilder
                foods={builderFoods}
                selectedFoods={selectedBuilderFoods}
                onChange={setSelectedBuilderFoods}
              />
            ) : null}
            {method === "repeat_meal" ? (
              <Text style={{ color: "#64748b", lineHeight: 21 }}>
                Smart Log will use your most recent logged meal as a draft. You
                can remove or edit every item before saving.
              </Text>
            ) : null}
            {statusMessage ? (
              <Text style={{ color: "#92400e", lineHeight: 21 }}>
                {statusMessage}
              </Text>
            ) : null}
            <PrimaryButton label="Create Draft" onPress={createDraft} />
          </View>
        </AppCard>
      ) : null}
    </ScreenWrapper>
  );
}

function Header({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: "#b45309", fontSize: 14, fontWeight: "800" }}>
        {subtitle}
      </Text>
      <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900" }}>
        {title}
      </Text>
    </View>
  );
}

function MealGroupPicker({
  mealGroup,
  onChange,
}: {
  mealGroup: NutritionMealGroup;
  onChange: (mealGroup: NutritionMealGroup) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {NUTRITION_MEAL_GROUP_OPTIONS.filter(
        (option) => option.key !== "notes",
      ).map((option) => (
        <TouchableOpacity
          activeOpacity={0.85}
          key={option.key}
          onPress={() => onChange(option.key)}
          style={{
            backgroundColor: mealGroup === option.key ? "#f59e0b" : "#fffbeb",
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 9,
          }}
        >
          <Text
            style={{
              color: mealGroup === option.key ? "#ffffff" : "#92400e",
              fontWeight: "900",
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function QuickMealBuilder({
  foods,
  onChange,
  selectedFoods,
}: {
  foods: BuilderFood[];
  onChange: (foods: BuilderFood[]) => void;
  selectedFoods: BuilderFood[];
}) {
  function toggleFood(food: BuilderFood) {
    const exists = selectedFoods.some((item) => item.id === food.id);

    onChange(
      exists
        ? selectedFoods.filter((item) => item.id !== food.id)
        : [...selectedFoods, food],
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {foods.length ? (
        foods.map((food) => {
          const selected = selectedFoods.some((item) => item.id === food.id);

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              key={food.id}
              onPress={() => toggleFood(food)}
              style={{
                backgroundColor: selected ? "#fffbeb" : "#ffffff",
                borderColor: selected ? "#f59e0b" : "#fde68a",
                borderRadius: 16,
                borderWidth: 1,
                padding: 12,
              }}
            >
              <Text style={{ color: "#0f172a", fontWeight: "900" }}>
                {food.foodName}
              </Text>
              <Text style={{ color: "#64748b", marginTop: 3 }}>
                {food.quantity} {food.unit} - {Math.round(food.calories)} kcal
              </Text>
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={{ color: "#64748b", lineHeight: 21 }}>
          Recent foods, favourites, custom foods, saved meals, and recipes will
          appear here.
        </Text>
      )}
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#f59e0b",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 52,
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        alignItems: "center",
        backgroundColor: "#fffbeb",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 52,
      }}
    >
      <Text style={{ color: "#92400e", fontSize: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function getMethodLabel(method: SmartLogMethod) {
  return METHODS.find((item) => item.key === method)?.label ?? "Smart Log";
}
