export type Role = "member" | "admin";
export type Tone = "forest" | "clay" | "amber" | "sky" | "plum";
export type Feeling = "clear" | "steady" | "stretched" | "restless" | "low";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  mfaEnabled: boolean;
  profileImage?: string;
};

export type FocusSession = {
  id: string;
  intention: string;
  durationMinutes: number;
  distractionCount: number;
  closingNote?: string;
  status: "completed" | "paused" | "planned";
  startedAt: string;
  completedAt?: string;
};

export type Routine = {
  id: string;
  title: string;
  cue?: string;
  durationMinutes: number;
  days: string[];
  preferredTime: string;
  color: Tone;
  active: boolean;
  completionCount: number;
  lastCompletedAt?: string;
};

export type Reflection = {
  id: string;
  focusLevel: number;
  energyLevel: number;
  feeling: Feeling;
  win?: string;
  friction?: string;
  nextStep?: string;
  note?: string;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type FeedbackItem = {
  id: string;
  message: string;
  category: "feature" | "bug" | "support";
  status: "new" | "in-review" | "done";
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  status: "open" | "in-review" | "resolved";
  createdAt: string;
};

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "suspended";
};

export type AppState = {
  user: User | null;
  theme: "light" | "dark" | "system";
  focusSessions: FocusSession[];
  routines: Routine[];
  reflections: Reflection[];
  notifications: NotificationItem[];
  feedback: FeedbackItem[];
  supportTickets: SupportTicket[];
  members: AdminMember[];
};

export type Overview = {
  todayMinutes: number;
  weekMinutes: number;
  completedSessions: number;
  activeRoutines: number;
  reflectionsThisWeek: number;
  daily: { day: string; minutes: number; sessions: number }[];
  latestReflection: Reflection | null;
};
