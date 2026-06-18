import { corsHeaders } from "../_shared/cors.ts";
import { requireAuthenticatedUser } from "../_shared/security.ts";

type AiChatRequest = {
  context?: {
    messages?: Array<{ role: "assistant" | "user"; text: string }>;
  };
  inputType?: "barcode" | "document" | "manual" | "photo" | "text" | "voice";
  message?: string;
  requestedTarget?: AiImportTarget;
  user_confirmed_context?: boolean;
};

type AiImportTarget =
  | "baby_child"
  | "calendar"
  | "cycle"
  | "family"
  | "fitness"
  | "medication"
  | "nutrition"
  | "pregnancy"
  | "records"
  | "shopping_list"
  | "supplements";

type AiChatStructuredOutput = {
  importPayload: unknown | null;
  reply: string;
  sources: Array<{ title: string; url: string }>;
};

const VALID_INPUT_TYPES = new Set([
  "barcode",
  "document",
  "manual",
  "photo",
  "text",
  "voice",
]);

const VALID_IMPORT_TARGETS = new Set<AiImportTarget>([
  "baby_child",
  "calendar",
  "cycle",
  "family",
  "fitness",
  "medication",
  "nutrition",
  "pregnancy",
  "records",
  "shopping_list",
  "supplements",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function emptyPayload(
  message: string,
  inputType: NonNullable<AiChatRequest["inputType"]>,
) {
  return {
    actions: {
      can_import: false,
      requires_user_confirmation: true,
      suggested_buttons: [],
    },
    baby_child: {
      child_age: null,
      feeding: null,
      growth_note: null,
      milestone: null,
      safety_notes: [],
      sleep: null,
      vaccine: null,
    },
    calendar: {
      end_time: null,
      reminder_minutes_before: null,
      repeat_rule: null,
      start_date: null,
      start_time: null,
      title: null,
    },
    family: {
      caregiver_visible: false,
      privacy_level: "private",
      share_with: [],
    },
    fitness: {
      difficulty: null,
      duration_minutes: null,
      equipment: [],
      exercises: [],
      goal: null,
      muscle_groups: [],
      progression_plan: [],
      safety_notes: [],
      sets_reps: [],
      workout_name: null,
    },
    health_flags: {
      allergy_flags: [],
      child_safety_warning: false,
      contraceptive_interaction_warning: false,
      diabetic_warning: false,
      high_risk_warning: false,
      medication_interaction_warning: false,
      pregnancy_warning: false,
      warnings: [],
    },
    import_targets: [] as AiImportTarget[],
    intent: {
      primary: "unknown",
      secondary: [],
      user_goal: message,
    },
    medication: {
      dosage: null,
      frequency: null,
      instructions: [],
      interaction_notes: [],
      name: null,
      reminder_needed: false,
      side_effects: [],
      time_of_day: [],
    },
    nutrition: {
      allergens: [],
      diet_tags: [],
      ingredients: [],
      meal_type: null,
      nutrients: {
        calories: null,
        carbs_g: null,
        fat_g: null,
        fiber_g: null,
        protein_g: null,
        sodium_mg: null,
        sugar_g: null,
      },
      recipe_steps: [],
      servings: null,
      shopping_items: [],
    },
    records: {
      attachments: [],
      document_title: null,
      extracted_fields: {},
      record_type: null,
    },
    source: {
      barcode: null,
      confidence: 0.35,
      image_url: null,
      input_type: inputType,
      query: message,
      requires_review: true,
    },
    summary: {
      important_notes: [],
      medical_disclaimer_required: true,
      short_description: "",
      title: "No importable draft detected",
    },
    supplement: {
      dosage: null,
      interaction_notes: [],
      name: null,
      purpose: null,
      timing: null,
    },
    women_health: {
      contraceptive: null,
      cycle_day: null,
      mood: null,
      notes: [],
      pregnancy_related: false,
      symptoms: [],
    },
  };
}

function mockResponse(
  message: string,
  inputType: NonNullable<AiChatRequest["inputType"]>,
) {
  return {
    importPayload: null,
    mode: "mock",
    reply:
      "OpenAI is not configured on this backend yet. I can still route app actions locally, but search and smart health-plan extraction need the Supabase OPENAI_API_KEY secret.",
    sources: [],
    structured: emptyPayload(message, inputType),
  };
}

const importPayloadSchema = {
  additionalProperties: false,
  properties: {
    actions: {
      additionalProperties: false,
      properties: {
        can_import: { type: "boolean" },
        requires_user_confirmation: { const: true },
        suggested_buttons: { items: { type: "string" }, type: "array" },
      },
      required: [
        "can_import",
        "suggested_buttons",
        "requires_user_confirmation",
      ],
      type: "object",
    },
    baby_child: {
      additionalProperties: false,
      properties: {
        child_age: { type: ["string", "null"] },
        feeding: { type: ["string", "null"] },
        growth_note: { type: ["string", "null"] },
        milestone: { type: ["string", "null"] },
        safety_notes: { items: { type: "string" }, type: "array" },
        sleep: { type: ["string", "null"] },
        vaccine: { type: ["string", "null"] },
      },
      required: [
        "child_age",
        "milestone",
        "feeding",
        "sleep",
        "vaccine",
        "growth_note",
        "safety_notes",
      ],
      type: "object",
    },
    calendar: {
      additionalProperties: false,
      properties: {
        end_time: { type: ["string", "null"] },
        reminder_minutes_before: { type: ["number", "null"] },
        repeat_rule: { type: ["string", "null"] },
        start_date: { type: ["string", "null"] },
        start_time: { type: ["string", "null"] },
        title: { type: ["string", "null"] },
      },
      required: [
        "title",
        "start_date",
        "start_time",
        "end_time",
        "repeat_rule",
        "reminder_minutes_before",
      ],
      type: "object",
    },
    family: {
      additionalProperties: false,
      properties: {
        caregiver_visible: { type: "boolean" },
        privacy_level: {
          enum: ["private", "shared", "family_admin_only"],
          type: "string",
        },
        share_with: { items: { type: "string" }, type: "array" },
      },
      required: ["share_with", "privacy_level", "caregiver_visible"],
      type: "object",
    },
    fitness: {
      additionalProperties: false,
      properties: {
        difficulty: { type: ["string", "null"] },
        duration_minutes: { type: ["number", "null"] },
        equipment: { items: { type: "string" }, type: "array" },
        exercises: { items: { type: "string" }, type: "array" },
        goal: { type: ["string", "null"] },
        muscle_groups: { items: { type: "string" }, type: "array" },
        progression_plan: { items: { type: "string" }, type: "array" },
        safety_notes: { items: { type: "string" }, type: "array" },
        sets_reps: { items: { type: "string" }, type: "array" },
        workout_name: { type: ["string", "null"] },
      },
      required: [
        "workout_name",
        "goal",
        "exercises",
        "muscle_groups",
        "duration_minutes",
        "difficulty",
        "equipment",
        "sets_reps",
        "safety_notes",
        "progression_plan",
      ],
      type: "object",
    },
    health_flags: {
      additionalProperties: false,
      properties: {
        allergy_flags: { items: { type: "string" }, type: "array" },
        child_safety_warning: { type: "boolean" },
        contraceptive_interaction_warning: { type: "boolean" },
        diabetic_warning: { type: "boolean" },
        high_risk_warning: { type: "boolean" },
        medication_interaction_warning: { type: "boolean" },
        pregnancy_warning: { type: "boolean" },
        warnings: { items: { type: "string" }, type: "array" },
      },
      required: [
        "allergy_flags",
        "diabetic_warning",
        "pregnancy_warning",
        "medication_interaction_warning",
        "contraceptive_interaction_warning",
        "child_safety_warning",
        "high_risk_warning",
        "warnings",
      ],
      type: "object",
    },
    import_targets: {
      items: {
        enum: [
          "nutrition",
          "fitness",
          "medication",
          "supplements",
          "calendar",
          "shopping_list",
          "baby_child",
          "cycle",
          "pregnancy",
          "records",
          "family",
        ],
        type: "string",
      },
      type: "array",
    },
    intent: {
      additionalProperties: false,
      properties: {
        primary: {
          enum: [
            "nutrition",
            "fitness",
            "medication",
            "supplement",
            "calendar",
            "baby_child",
            "pregnancy",
            "cycle",
            "general_health",
            "family",
            "shopping",
            "reminder",
            "record",
            "unknown",
          ],
          type: "string",
        },
        secondary: { items: { type: "string" }, type: "array" },
        user_goal: { type: "string" },
      },
      required: ["primary", "secondary", "user_goal"],
      type: "object",
    },
    medication: {
      additionalProperties: false,
      properties: {
        dosage: { type: ["string", "null"] },
        frequency: { type: ["string", "null"] },
        instructions: { items: { type: "string" }, type: "array" },
        interaction_notes: { items: { type: "string" }, type: "array" },
        name: { type: ["string", "null"] },
        reminder_needed: { type: "boolean" },
        side_effects: { items: { type: "string" }, type: "array" },
        time_of_day: { items: { type: "string" }, type: "array" },
      },
      required: [
        "name",
        "dosage",
        "frequency",
        "time_of_day",
        "instructions",
        "side_effects",
        "interaction_notes",
        "reminder_needed",
      ],
      type: "object",
    },
    nutrition: {
      additionalProperties: false,
      properties: {
        allergens: { items: { type: "string" }, type: "array" },
        diet_tags: { items: { type: "string" }, type: "array" },
        ingredients: { items: { type: "string" }, type: "array" },
        meal_type: { type: ["string", "null"] },
        nutrients: {
          additionalProperties: false,
          properties: {
            calories: { type: ["number", "null"] },
            carbs_g: { type: ["number", "null"] },
            fat_g: { type: ["number", "null"] },
            fiber_g: { type: ["number", "null"] },
            protein_g: { type: ["number", "null"] },
            sodium_mg: { type: ["number", "null"] },
            sugar_g: { type: ["number", "null"] },
          },
          required: [
            "calories",
            "protein_g",
            "carbs_g",
            "fat_g",
            "sugar_g",
            "fiber_g",
            "sodium_mg",
          ],
          type: "object",
        },
        recipe_steps: { items: { type: "string" }, type: "array" },
        servings: { type: ["number", "null"] },
        shopping_items: { items: { type: "string" }, type: "array" },
      },
      required: [
        "meal_type",
        "ingredients",
        "nutrients",
        "diet_tags",
        "allergens",
        "shopping_items",
        "recipe_steps",
        "servings",
      ],
      type: "object",
    },
    records: {
      additionalProperties: false,
      properties: {
        attachments: { items: { type: "string" }, type: "array" },
        document_title: { type: ["string", "null"] },
        extracted_fields: {
          additionalProperties: false,
          properties: {
            date: { type: ["string", "null"] },
            notes: { items: { type: "string" }, type: "array" },
            provider: { type: ["string", "null"] },
            result_summary: { type: ["string", "null"] },
            values: { items: { type: "string" }, type: "array" },
          },
          required: ["date", "provider", "result_summary", "values", "notes"],
          type: "object",
        },
        record_type: { type: ["string", "null"] },
      },
      required: [
        "record_type",
        "document_title",
        "extracted_fields",
        "attachments",
      ],
      type: "object",
    },
    source: {
      additionalProperties: false,
      properties: {
        barcode: { type: ["string", "null"] },
        confidence: { type: "number" },
        image_url: { type: ["string", "null"] },
        input_type: {
          enum: ["text", "photo", "barcode", "voice", "document", "manual"],
          type: "string",
        },
        query: { type: "string" },
        requires_review: { const: true },
      },
      required: [
        "input_type",
        "query",
        "image_url",
        "barcode",
        "confidence",
        "requires_review",
      ],
      type: "object",
    },
    summary: {
      additionalProperties: false,
      properties: {
        important_notes: { items: { type: "string" }, type: "array" },
        medical_disclaimer_required: { type: "boolean" },
        short_description: { type: "string" },
        title: { type: "string" },
      },
      required: [
        "title",
        "short_description",
        "important_notes",
        "medical_disclaimer_required",
      ],
      type: "object",
    },
    supplement: {
      additionalProperties: false,
      properties: {
        dosage: { type: ["string", "null"] },
        interaction_notes: { items: { type: "string" }, type: "array" },
        name: { type: ["string", "null"] },
        purpose: { type: ["string", "null"] },
        timing: { type: ["string", "null"] },
      },
      required: ["name", "dosage", "purpose", "timing", "interaction_notes"],
      type: "object",
    },
    women_health: {
      additionalProperties: false,
      properties: {
        contraceptive: { type: ["string", "null"] },
        cycle_day: { type: ["number", "null"] },
        mood: { type: ["string", "null"] },
        notes: { items: { type: "string" }, type: "array" },
        pregnancy_related: { type: "boolean" },
        symptoms: { items: { type: "string" }, type: "array" },
      },
      required: [
        "cycle_day",
        "symptoms",
        "mood",
        "contraceptive",
        "pregnancy_related",
        "notes",
      ],
      type: "object",
    },
  },
  required: [
    "source",
    "intent",
    "summary",
    "health_flags",
    "nutrition",
    "fitness",
    "medication",
    "supplement",
    "calendar",
    "baby_child",
    "women_health",
    "family",
    "records",
    "import_targets",
    "actions",
  ],
  type: "object",
} as const;

const chatResponseSchema = {
  additionalProperties: false,
  properties: {
    importPayload: {
      anyOf: [importPayloadSchema, { type: "null" }],
    },
    reply: { type: "string" },
    sources: {
      items: {
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
        required: ["title", "url"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["reply", "sources", "importPayload"],
  type: "object",
} as const;

function systemPrompt() {
  return [
    "You are HealthSync AI, a careful family health app assistant.",
    "You can answer general health organization, nutrition, workout, document, recipe, calendar, baby, cycle, medication, supplement, records, and family-care planning questions.",
    "You do not diagnose, prescribe, replace clinicians, or tell users to change medication. Use safety language for medical uncertainty.",
    "If the user asks to open or use an existing app area, the mobile app may route locally before calling you. When you are called, answer the question directly.",
    "When the response contains an importable plan or structured data, return importPayload with can_import true and the correct import_targets.",
    "Only create importPayload for actionable drafts such as workout plans, meal plans, recipes, shopping lists, medication reminder drafts, calendar events, health documents/records, baby logs, cycle notes, or family care notes.",
    "All imports are drafts requiring user confirmation. Never imply automatic saving.",
    "Return JSON matching the schema only.",
  ].join(" ");
}

function extractOutputText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;

  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content)
      ? (item as { content: unknown[] }).content
      : [];
    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") continue;
      const text = (contentItem as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const { error: authError } = requireAuthenticatedUser(req);
  if (authError) return jsonResponse({ error: authError }, 401);

  try {
    const body = (await req.json()) as AiChatRequest;
    const message = body.message?.trim();
    const inputType = body.inputType ?? "text";

    if (!message) return jsonResponse({ error: "Message is required." }, 400);
    if (!VALID_INPUT_TYPES.has(inputType)) {
      return jsonResponse({ error: "Invalid inputType." }, 400);
    }
    if (body.requestedTarget && !VALID_IMPORT_TARGETS.has(body.requestedTarget)) {
      return jsonResponse({ error: "Invalid requestedTarget." }, 400);
    }
    if (body.context?.messages?.length && body.user_confirmed_context !== true) {
      return jsonResponse({ error: "Private context requires confirmation." }, 400);
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return jsonResponse(mockResponse(message, inputType));

    const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.5";
    const history = body.context?.messages?.slice(-8) ?? [];
    const input = [
      {
        content: [{ text: systemPrompt(), type: "input_text" }],
        role: "developer",
      },
      ...history.map((item) => ({
        content: [{ text: item.text.slice(0, 4000), type: "input_text" }],
        role: item.role,
      })),
      {
        content: [{ text: message.slice(0, 8000), type: "input_text" }],
        role: "user",
      },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      body: JSON.stringify({
        input,
        max_output_tokens: 1800,
        model,
        text: {
          format: {
            name: "healthsync_ai_chat_response",
            schema: chatResponseSchema,
            strict: true,
            type: "json_schema",
          },
        },
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const responseBody = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      return jsonResponse(
        { error: "Could not process this with AI right now. No data was saved." },
        response.status,
      );
    }

    const outputText = extractOutputText(responseBody);
    if (!outputText) {
      return jsonResponse({ error: "OpenAI returned no structured text." }, 502);
    }

    const parsed = JSON.parse(outputText) as AiChatStructuredOutput;
    return jsonResponse({
      importPayload: parsed.importPayload,
      mode: "real",
      reply: parsed.reply,
      sources: parsed.sources,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Could not process this with AI right now. No data was saved.",
      },
      500,
    );
  }
});
