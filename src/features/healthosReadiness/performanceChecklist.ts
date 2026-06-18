export type HealthOSReadinessStatus =
  | "blocker"
  | "deferred"
  | "needsReview"
  | "pass"
  | "unknown";

export type HealthOSPerformanceChecklistItem = {
  area: string;
  check: string;
  id: string;
  recommendedAction: string;
  releaseBlocker: boolean;
  status: HealthOSReadinessStatus;
};

export const healthOSPerformanceChecklist: HealthOSPerformanceChecklistItem[] = [
  item("shell", "App shell responsiveness", "Bottom nav and shell are shared and lightweight; verify on low-end Android.", "needsReview", false),
  item("bottom-nav", "Bottom nav animation", "Animation is contained in shell components; test with reduced-motion settings before release.", "needsReview", false),
  item("ai-sheet", "AI/search sheet", "AI assistant currently renders messages in a BottomSheetScrollView; migrate to a virtualized list before long-history release.", "needsReview", false),
  item("calendar", "Calendar scroll/collapse", "Calendar screens use ScrollView and compact day/month data; test month overlays on low-end devices.", "needsReview", false),
  item("scan", "Scan camera overlays", "Camera overlay is absolute-positioned and does not process images in render; test camera startup in development build.", "needsReview", false),
  item("ai-import", "AI import field list", "Review sheets map fields directly; acceptable for small import envelopes, virtualize if imports grow.", "deferred", false),
  item("records", "Records list", "Records overview maps filtered records; use FlatList before production-scale document libraries.", "needsReview", false),
  item("trusted-content", "Trusted content list", "Hub limits filtered content preview to eight items but saved content can grow; virtualize later.", "needsReview", false),
  item("notifications", "Notifications/reminders list", "Reminder center maps grouped reminder sections; use FlatList/SectionList for large family schedules.", "needsReview", false),
  item("fitness-library", "Fitness exercise list", "Exercise library route already uses FlatList for the main exercise list.", "pass", false),
  item("nutrition", "Nutrition timeline", "Meal timeline maps daily sections; acceptable for daily use, review weekly/history expansion later.", "needsReview", false),
  item("medication", "Medication timeline", "Medication and supplement timelines map visible day items; test long schedules.", "needsReview", false),
  item("baby-child", "Baby/Child timeline", "Care timeline is mapped in realm sections; virtualize if real logs become long.", "deferred", false),
  item("pregnancy", "Pregnancy checklists", "Checklist sections are finite and safe for current scope.", "pass", false),
  item("images", "Image thumbnails", "Scan and record previews use provided URIs; ensure thumbnail generation/storage before release.", "needsReview", false),
  item("reduced-motion", "Reduced motion", "No global reduced-motion contract was found; document and add later before animation polish.", "deferred", false),
  item("keyboard", "Keyboard-safe composers/forms", "AI composer and forms need physical-device keyboard QA on small screens.", "needsReview", false),
  item("theme", "Dark/light readability", "Theme support exists; visual QA still required across all main routes.", "needsReview", false),
];

function item(
  id: string,
  area: string,
  check: string,
  status: HealthOSReadinessStatus,
  releaseBlocker: boolean,
): HealthOSPerformanceChecklistItem {
  return { area, check, id, recommendedAction: check, releaseBlocker, status };
}
