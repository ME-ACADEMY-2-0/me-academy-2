import type { Database } from "@/lib/database.types";

// Shared by server and client. One account can hold several roles; everyone is a student.
export type AppRole = Database["public"]["Enums"]["app_role"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super admin",
  editor: "Editor",
  accountant: "Accounts",
  tutor: "Instructor",
  student: "Student",
};

export const ROLE_BLURBS: Record<AppRole, string> = {
  super_admin: "Owns the platform. Manages everything.",
  editor: "Runs the blog, announcements and posts.",
  accountant: "Sees payments, refunds and coupons.",
  tutor: "Creates and edits courses, and appears as a course instructor.",
  student: "Takes courses and uses course materials.",
};

// Granted only by a super admin (Admin > Team); these open the admin dashboard.
export const STAFF_ROLES: AppRole[] = ["super_admin", "editor", "accountant", "tutor"];

export const isStaff = (roles: AppRole[]) => roles.some((r) => STAFF_ROLES.includes(r));
// Who can be picked as a course's instructor.
export const canTeach = (roles: AppRole[]) => roles.includes("tutor") || roles.includes("super_admin");

// Admin dashboard areas and who can open them. Super admins open everything.
export const ADMIN_AREAS = {
  dashboard: ["super_admin", "editor", "accountant", "tutor"],
  users: ["super_admin"],
  courses: ["super_admin", "tutor"],
  blog: ["super_admin", "editor"],
  announcements: ["super_admin", "editor"],
  documents: ["super_admin"],
  chats: ["super_admin"],
  tracking: ["super_admin"],
  financials: ["super_admin", "accountant"],
  coupons: ["super_admin", "accountant"],
  team: ["super_admin"],
  emails: ["super_admin"],
  settings: ["super_admin", "editor", "accountant", "tutor"],
  platform: ["super_admin"],
} satisfies Record<string, AppRole[]>;

export type AdminArea = keyof typeof ADMIN_AREAS;

export const canAccess = (roles: AppRole[], area: AdminArea) => roles.some((r) => (ADMIN_AREAS[area] as AppRole[]).includes(r));

// Most senior role first, for one-word labels.
const ORDER: AppRole[] = ["super_admin", "accountant", "editor", "tutor", "student"];
export const primaryRole = (roles: AppRole[]) => ORDER.find((r) => roles.includes(r)) ?? "student";
