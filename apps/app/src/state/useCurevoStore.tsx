import React, { createContext, useContext, useMemo, useState } from "react";

import { initialState } from "@/data/seed";
import type {
  AdminMember,
  AppState,
  FeedbackItem,
  FocusSession,
  NotificationItem,
  Overview,
  Reflection,
  Role,
  Routine,
  SupportTicket,
  User,
} from "@/data/types";

type SignInInput = { email: string; password: string; role: Role };
type CreateRoutineInput = Omit<Routine, "id" | "active" | "completionCount" | "lastCompletedAt">;
type CreateReflectionInput = Omit<Reflection, "id" | "createdAt">;
type CreateFeedbackInput = Omit<FeedbackItem, "id" | "status" | "createdAt">;

type StoreValue = {
  state: AppState;
  overview: Overview;
  signIn: (input: SignInInput) => void;
  signOut: () => void;
  setRole: (role: Role) => void;
  setTheme: (theme: AppState["theme"]) => void;
  completeFocusSession: (input: { intention: string; durationMinutes: number; distractionCount: number; closingNote?: string }) => void;
  deleteFocusSession: (id: string) => void;
  createRoutine: (input: CreateRoutineInput) => void;
  toggleRoutine: (id: string) => void;
  completeRoutine: (id: string) => void;
  deleteRoutine: (id: string) => void;
  createReflection: (input: CreateReflectionInput) => void;
  deleteReflection: (id: string) => void;
  markNotificationRead: (id: string) => void;
  createFeedback: (input: CreateFeedbackInput) => void;
  updateMemberStatus: (id: string, status: AdminMember["status"]) => void;
  updateTicketStatus: (id: string, status: SupportTicket["status"]) => void;
  toggleMfa: () => void;
  exportData: () => string;
  deleteAccount: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const dayKey = (date: Date) => date.toISOString().slice(0, 10);
const thisWeekStart = () => {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setHours(0, 0, 0, 0);
  now.setDate(now.getDate() - day + 1);
  return now;
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function buildOverview(state: AppState): Overview {
  const now = new Date();
  const weekStart = thisWeekStart();
  const completed = state.focusSessions.filter((item) => item.status === "completed");
  const todayKey = dayKey(now);
  const completedThisWeek = completed.filter((session) => new Date(session.startedAt) >= weekStart);
  const todayMinutes = completed.filter((session) => dayKey(new Date(session.startedAt)) === todayKey).reduce((sum, session) => sum + session.durationMinutes, 0);
  const weekMinutes = completedThisWeek.reduce((sum, session) => sum + session.durationMinutes, 0);
  const reflectionsThisWeek = state.reflections.filter((reflection) => new Date(reflection.createdAt) >= weekStart).length;
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const key = dayKey(date);
    const matches = completed.filter((session) => dayKey(new Date(session.startedAt)) === key);
    return { day: date.toLocaleDateString("en", { weekday: "short" }), minutes: matches.reduce((sum, session) => sum + session.durationMinutes, 0), sessions: matches.length };
  });
  const latestReflection = [...state.reflections].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;

  return {
    todayMinutes,
    weekMinutes,
    completedSessions: completedThisWeek.length,
    activeRoutines: state.routines.filter((routine) => routine.active).length,
    reflectionsThisWeek,
    daily,
    latestReflection,
  };
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CurevoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(clone(initialState));

  const actions = useMemo<StoreValue>(() => {
    const setUser = (user: User | null) => setState((current) => ({ ...current, user }));

    return {
      state,
      overview: buildOverview(state),
      signIn: ({ email, role }) => {
        setUser({
          ...(clone(initialState.user as User)),
          id: role === "admin" ? "admin-demo" : "user-demo",
          name: role === "admin" ? "Operations Lead" : "Avery Morgan",
          email,
          role,
          emailVerified: true,
          mfaEnabled: role === "admin",
        });
      },
      signOut: () => setUser(null),
      setRole: (role) => {
        setState((current) => (current.user ? { ...current, user: { ...current.user, role } } : current));
      },
      setTheme: (theme) => setState((current) => ({ ...current, theme })),
      completeFocusSession: (input) => {
        setState((current) => ({
          ...current,
          focusSessions: [
            {
              id: uid("focus"),
              status: "completed",
              startedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              ...input,
            },
            ...current.focusSessions,
          ],
          notifications: [
            { id: uid("notif"), type: "focus", message: `Recorded a ${input.durationMinutes} minute focus block.`, isRead: false, createdAt: new Date().toISOString() },
            ...current.notifications,
          ],
        }));
      },
      deleteFocusSession: (id) => setState((current) => ({ ...current, focusSessions: current.focusSessions.filter((item) => item.id !== id) })),
      createRoutine: (input) => setState((current) => ({
        ...current,
        routines: [
          { id: uid("routine"), active: true, completionCount: 0, ...input },
          ...current.routines,
        ],
      })),
      toggleRoutine: (id) => setState((current) => ({
        ...current,
        routines: current.routines.map((routine) => routine.id === id ? { ...routine, active: !routine.active } : routine),
      })),
      completeRoutine: (id) => setState((current) => ({
        ...current,
        routines: current.routines.map((routine) => routine.id === id ? { ...routine, completionCount: routine.completionCount + 1, lastCompletedAt: new Date().toISOString() } : routine),
        focusSessions: [
          {
            id: uid("focus"),
            intention: `Routine: ${current.routines.find((routine) => routine.id === id)?.title ?? "completed"}`,
            durationMinutes: current.routines.find((routine) => routine.id === id)?.durationMinutes ?? 5,
            distractionCount: 0,
            status: "completed",
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
          ...current.focusSessions,
        ],
      })),
      deleteRoutine: (id) => setState((current) => ({ ...current, routines: current.routines.filter((item) => item.id !== id) })),
      createReflection: (input) => setState((current) => ({
        ...current,
        reflections: [
          { id: uid("reflection"), createdAt: new Date().toISOString(), ...input },
          ...current.reflections,
        ],
      })),
      deleteReflection: (id) => setState((current) => ({ ...current, reflections: current.reflections.filter((item) => item.id !== id) })),
      markNotificationRead: (id) => setState((current) => ({
        ...current,
        notifications: current.notifications.map((notification) => notification.id === id ? { ...notification, isRead: true } : notification),
      })),
      createFeedback: (input) => setState((current) => ({
        ...current,
        feedback: [{ id: uid("feedback"), status: "new", createdAt: new Date().toISOString(), ...input }, ...current.feedback],
      })),
      updateMemberStatus: (id, status) => setState((current) => ({
        ...current,
        members: current.members.map((member) => member.id === id ? { ...member, status } : member),
      })),
      updateTicketStatus: (id, status) => setState((current) => ({
        ...current,
        supportTickets: current.supportTickets.map((ticket) => ticket.id === id ? { ...ticket, status } : ticket),
      })),
      toggleMfa: () => setState((current) => current.user ? { ...current, user: { ...current.user, mfaEnabled: !current.user.mfaEnabled } } : current),
      exportData: () => JSON.stringify({ user: state.user, focusSessions: state.focusSessions, routines: state.routines, reflections: state.reflections, notifications: state.notifications, feedback: state.feedback, supportTickets: state.supportTickets }, null, 2),
      deleteAccount: () => {
        setState((current) => ({
          ...current,
          user: null,
          focusSessions: [],
          routines: [],
          reflections: [],
          notifications: [],
          feedback: [],
          supportTickets: [],
          members: [],
        }));
      },
    };
  }, [state]);

  return <StoreContext.Provider value={actions}>{children}</StoreContext.Provider>;
}

export function useCurevo() {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error("useCurevo must be used inside CurevoProvider");
  }
  return value;
}
