// Feature switches: features that can be turned off or launched to staff first. Admins change them in
// Settings → Features (stored in feature_flags); anything never changed uses `initial`.

export type FeatureStatus = "off" | "staff" | "on";

export const FEATURES = {
  ai_assistant: { label: "AI assistant", description: "The floating AI helper in the app.", initial: "on" },
  ai_course_tools: { label: "AI course tools", description: "AI suggestions while creating courses: outlines, descriptions, lesson notes and covers.", initial: "on" },
  ai_lesson: { label: "Ask AI in lessons", description: "The Ask AI tab in the course player.", initial: "on" },
} satisfies Record<string, { label: string; description: string; initial: FeatureStatus }>;

export type FeatureKey = keyof typeof FEATURES;
export const FEATURE_KEYS = Object.keys(FEATURES) as FeatureKey[];
export type FeatureMap = Record<FeatureKey, boolean>;
