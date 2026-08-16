import type { AppState } from "./types";

const now = new Date();
const isoDaysAgo = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const initialState: AppState = {
  user: {
    id: "user-1",
    name: "Avery Morgan",
    email: "avery@curevo.app",
    role: "member",
    emailVerified: true,
    mfaEnabled: false,
  },
  theme: "system",
  focusSessions: [
    {
      id: "focus-1",
      intention: "Draft the first paragraph",
      durationMinutes: 25,
      distractionCount: 2,
      closingNote: "Phone stayed in another room.",
      status: "completed",
      startedAt: isoDaysAgo(0),
      completedAt: isoDaysAgo(0),
    },
    {
      id: "focus-2",
      intention: "Tidy the inbox for ten minutes",
      durationMinutes: 10,
      distractionCount: 1,
      status: "completed",
      startedAt: isoDaysAgo(1),
      completedAt: isoDaysAgo(1),
    },
  ],
  routines: [
    {
      id: "routine-1",
      title: "Clear the desk",
      cue: "After the morning drink",
      durationMinutes: 5,
      days: ["mon", "tue", "wed", "thu", "fri"],
      preferredTime: "09:00",
      color: "forest",
      active: true,
      completionCount: 12,
      lastCompletedAt: isoDaysAgo(0),
    },
    {
      id: "routine-2",
      title: "Stretch and breathe",
      cue: "Before opening email",
      durationMinutes: 3,
      days: ["mon", "wed", "fri"],
      preferredTime: "12:30",
      color: "amber",
      active: true,
      completionCount: 7,
      lastCompletedAt: isoDaysAgo(2),
    },
  ],
  reflections: [
    {
      id: "reflection-1",
      focusLevel: 4,
      energyLevel: 3,
      feeling: "steady",
      win: "Started before I felt ready.",
      friction: "Notifications pulled me off course.",
      nextStep: "Mute alerts during the next block.",
      note: "A short start was enough.",
      createdAt: isoDaysAgo(0),
    },
    {
      id: "reflection-2",
      focusLevel: 2,
      energyLevel: 2,
      feeling: "stretched",
      win: "I still returned after a break.",
      nextStep: "Make the task smaller.",
      createdAt: isoDaysAgo(2),
    },
  ],
  notifications: [
    { id: "notif-1", type: "routine", message: "Stretch and breathe is due soon.", isRead: false, createdAt: isoDaysAgo(0) },
    { id: "notif-2", type: "focus", message: "You recorded a 25 minute focus block.", isRead: true, createdAt: isoDaysAgo(1) },
  ],
  feedback: [
    { id: "feedback-1", message: "Please add a quick dark-mode toggle on the mobile profile screen.", category: "feature", status: "new", createdAt: isoDaysAgo(0) },
    { id: "feedback-2", message: "The focus timer should remember the last duration.", category: "bug", status: "in-review", createdAt: isoDaysAgo(1) },
  ],
  supportTickets: [
    { id: "ticket-1", subject: "Email verification not arriving", status: "open", createdAt: isoDaysAgo(0) },
    { id: "ticket-2", subject: "Need help exporting my data", status: "resolved", createdAt: isoDaysAgo(3) },
  ],
  members: [
    { id: "member-1", name: "Avery Morgan", email: "avery@curevo.app", role: "member", status: "active" },
    { id: "member-2", name: "Jordan Lee", email: "jordan@curevo.app", role: "member", status: "active" },
    { id: "member-3", name: "Morgan Patel", email: "morgan@curevo.app", role: "admin", status: "active" },
  ],
};
