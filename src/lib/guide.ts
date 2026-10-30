// Shared by server and client: where a learner is with the in-app guides (profiles.guide_state).
export type GuideState = {
  // When they finished or skipped the spotlight tour. Unset: the tour starts after the welcome guide.
  tour?: string;
  // They closed the getting-started card on the dashboard.
  checklist_hidden?: boolean;
  // Page tips they've dismissed, by key.
  tips?: string[];
};

export const readGuide = (raw: unknown): GuideState => (raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as GuideState) : {});

// Fired on window to start the tour from anywhere (account menu, checklist, Support).
export const START_TOUR = "et:start-tour";
export const startTour = () => window.dispatchEvent(new Event(START_TOUR));

// Fired on window to reopen the welcome questions (goals, topics, level, time) with the current answers.
export const OPEN_LEARNING_PREFS = "et:open-learning-prefs";
export const openLearningPrefs = () => window.dispatchEvent(new Event(OPEN_LEARNING_PREFS));

// One tip per main learner page, shown the first time they open it. Keyed by exact path.
export const PAGE_TIPS: Record<string, { title: string; body: string }> = {
  "/learn/browse": { title: "Find your next course", body: "Every course we offer. Use the level filters, or For you to see the best matches for your goals." },
  "/learn/courses": { title: "Your courses live here", body: "Everything you've enrolled in, with your progress. Open a course to pick up exactly where you stopped." },
  "/learn/saved": { title: "Saved for later", body: "Tap the heart on any course to keep it here until you're ready to start." },
  "/learn/announcements": { title: "Announcements", body: "Updates from the team: new courses, changes and events." },
};
