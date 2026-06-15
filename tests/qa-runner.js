const fs = require("fs");
const path = require("path");

const { blockedPrompts } = require("./fixtures/aiPrompts");
const { recipeIngredients, waterLogs } = require("./fixtures/nutritionLogs");
const { reminders } = require("./fixtures/reminders");

const root = path.resolve(__dirname, "..");
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function testRequiredQaDocs() {
  [
    "QA_CHECKLIST.md",
    "PRIVACY_TEST_MATRIX.md",
    "HEALTH_SAFETY_WORDING_CHECKLIST.md",
    "PERMISSION_TEST_CASES.md",
    "REMINDER_TEST_CASES.md",
    "AI_SAFETY_TEST_CASES.md",
    "RELEASE_READINESS_CHECKLIST.md",
    "APP_STORE_PRIVACY_CHECKLIST.md",
    "GOOGLE_PLAY_DATA_SAFETY_CHECKLIST.md",
    "POPIA_PREPARATION_CHECKLIST.md",
    "DATA_INVENTORY.md",
  ].forEach((file) =>
    assert(exists(file), `Missing required QA document: ${file}`),
  );
}

function testPrivacyComplianceArtifacts() {
  const service = read("src/lib/privacyComplianceStorage.ts");
  [
    "grantConsent",
    "denyConsent",
    "revokeConsent",
    "createDataExportRequest",
    "createDataDeletionRequest",
    "createPrivacyAuditLog",
  ].forEach((name) =>
    assert(
      service.includes(`function ${name}`),
      `Privacy compliance service missing ${name}.`,
    ),
  );
  assert(
    service.includes("Do not sell") === false,
    "Service should store controls, not legal marketing claims.",
  );
  assert(
    exists("docs/privacy-compliance-phase-23-schema.sql"),
    "Missing Phase 23 privacy SQL documentation.",
  );
}

function testSupabaseHardeningArtifacts() {
  [
    "SUPABASE_SECURITY_AUDIT.md",
    "RLS_POLICY_MATRIX.md",
    "STORAGE_SECURITY_PLAN.md",
    "EDGE_FUNCTIONS_SECURITY.md",
    "ENVIRONMENT_VARIABLES.md",
    "SUPABASE_ENVIRONMENT.md",
    "BACKUP_RESTORE_PLAN.md",
    "MIGRATION_SAFETY_CHECKLIST.md",
    "SECURITY_RELEASE_CHECKLIST.md",
    "docs/supabase-production-hardening-phase-24.sql",
    "tests/supabase/rls_privacy_test_plan.sql",
  ].forEach((file) =>
    assert(exists(file), `Missing Phase 24 security artifact: ${file}`),
  );
  const envExample = read(".env.example");
  assert(
    !envExample.includes("SUPABASE_SERVICE_ROLE_KEY"),
    ".env.example must not include service-role keys.",
  );
  assert(
    exists(".env.local.example"),
    "Missing server-only environment example.",
  );
  const privateFileService = read("src/services/storage/privateFileService.ts");
  assert(
    privateFileService.includes("SIGNED_URL_EXPIRY_SECONDS = 60 * 5"),
    "Signed URLs should be short-lived.",
  );
  assert(
    privateFileService.includes("ALLOWED_EXTENSIONS"),
    "Private file upload allowlist is missing.",
  );
}

function testAssistantGuardrails() {
  const assistant = read("src/lib/assistantStorage.ts").toLowerCase();
  blockedPrompts.forEach((prompt) => {
    const importantWords = prompt
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter((word) => word.length > 3);
    assert(
      importantWords.some((word) => assistant.includes(word)),
      `Assistant guardrails do not appear to cover prompt: ${prompt}`,
    );
  });
  assert(
    assistant.includes("review and confirm before saving"),
    "Assistant draft-first footer is missing.",
  );
  assert(
    assistant.includes("you do not have permission to view that information"),
    "Assistant permission-blocked copy is missing.",
  );
}

function testSensitiveDefaultsBySource() {
  const assistant = read("src/lib/assistantStorage.ts");
  const pregnancy = read("src/lib/pregnancyStorage.ts");
  const reminders = read("src/services/reminders/reminderEngine.ts");
  assert(
    assistant.includes("assistantEnabled: false"),
    "Assistant should default off.",
  );
  assert(
    assistant.includes("conversationHistoryEnabled: false"),
    "Assistant history should default off.",
  );
  assert(
    pregnancy.includes('privacy: "private"'),
    "Pregnancy profile should default private.",
  );
  assert(
    reminders.includes("isPrivate: true"),
    "Health reminders should default private.",
  );
  assert(
    reminders.includes("lockedPrivate: true"),
    "Health reminders should default locked private.",
  );
}

function testSupabaseRlsDocs() {
  const docs = fs
    .readdirSync(path.join(root, "docs"))
    .filter((file) => file.endsWith(".sql"));
  assert(docs.length > 0, "No SQL documentation files found.");
  docs.forEach((file) => {
    const sql = read(path.join("docs", file).replace(/\\/g, "/")).toLowerCase();
    assert(
      sql.includes("row level security"),
      `${file} does not document RLS expectations.`,
    );
    assert(
      sql.includes("authenticated"),
      `${file} does not document authenticated access policy style.`,
    );
    assert(
      sql.includes("auth.uid()") && sql.includes("user_id"),
      `${file} does not document auth.uid ownership predicates.`,
    );
  });
}

function testSafetyWordingChecklist() {
  const checklist = read("HEALTH_SAFETY_WORDING_CHECKLIST.md").toLowerCase();
  [
    "safe day",
    "unsafe day",
    "contraception failed",
    "your baby is delayed",
    "normal growth",
    "abnormal growth",
    "give this dose",
    "stop taking",
  ].forEach((phrase) =>
    assert(
      checklist.includes(phrase),
      `Safety checklist missing blocked phrase: ${phrase}`,
    ),
  );
}

function testNutritionCalculations() {
  const totals = recipeIngredients.reduce(
    (sum, item) => ({
      calories: sum.calories + item.calories,
      proteinG: sum.proteinG + item.proteinG,
      carbsG: sum.carbsG + item.carbsG,
      fatG: sum.fatG + item.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
  assert(
    totals.calories === 300,
    "Recipe calories fixture total should be 300.",
  );
  assert(totals.proteinG === 25, "Recipe protein fixture total should be 25g.");
  assert(totals.carbsG === 25, "Recipe carbs fixture total should be 25g.");
  assert(totals.fatG === 10, "Recipe fat fixture total should be 10g.");
  assert(
    totals.calories / 2 === 150,
    "Recipe per-serving calories should be 150 for two servings.",
  );
  assert(
    waterLogs.reduce((sum, item) => sum + item.amountMl, 0) === 1500,
    "Water fixture total should be 1500ml.",
  );
}

function testDateCalculations() {
  const lmp = new Date("2026-01-01T00:00:00.000Z");
  const due = new Date(lmp);
  due.setUTCDate(due.getUTCDate() + 280);
  assert(
    due.toISOString().slice(0, 10) === "2026-10-08",
    "LMP + 280 days pregnancy due date fixture failed.",
  );
  assert(
    trimesterForWeek(13) === "first",
    "Week 13 should be first trimester.",
  );
  assert(
    trimesterForWeek(14) === "second",
    "Week 14 should be second trimester.",
  );
  assert(
    trimesterForWeek(28) === "third",
    "Week 28 should be third trimester.",
  );
}

function trimesterForWeek(week) {
  if (!week || week < 1) return "unknown";
  if (week <= 13) return "first";
  if (week <= 27) return "second";
  return "third";
}

function testReminderLogicFixtures() {
  const now = new Date("2026-06-05T09:00:00.000Z");
  const overdue = reminders.filter(
    (reminder) =>
      new Date(reminder.dueAt) < now && reminder.status !== "completed",
  );
  assert(
    overdue.length === 2,
    "Reminder fixture should identify two past due reminders at 09:00.",
  );
  const titles = new Set(
    reminders.map((reminder) => `${reminder.title}:${reminder.dueAt}`),
  );
  assert(
    titles.size === reminders.length,
    "Reminder fixtures should not contain duplicate source instances.",
  );
}

function run() {
  testRequiredQaDocs();
  testPrivacyComplianceArtifacts();
  testSupabaseHardeningArtifacts();
  testAssistantGuardrails();
  testSensitiveDefaultsBySource();
  testSupabaseRlsDocs();
  testSafetyWordingChecklist();
  testNutritionCalculations();
  testDateCalculations();
  testReminderLogicFixtures();

  if (failures.length) {
    console.error("QA checks failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("QA checks passed.");
}

run();
