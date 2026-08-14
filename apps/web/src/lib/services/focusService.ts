import api from "../api";

export type FocusSession = {
  _id: string;
  routineId?: string;
  intention: string;
  durationMinutes: number;
  status: "planned" | "active" | "completed" | "cancelled";
  startedAt: string;
  completedAt?: string;
  distractionCount: number;
  closingNote?: string;
};

export type Routine = {
  _id: string;
  title: string;
  cue?: string;
  durationMinutes: number;
  days: string[];
  preferredTime: string;
  color: "forest" | "clay" | "amber" | "sky" | "plum";
  active: boolean;
  completionCount: number;
  lastCompletedAt?: string;
};

export type Reflection = {
  _id: string;
  focusLevel: number;
  energyLevel: number;
  feeling: "clear" | "steady" | "stretched" | "restless" | "low";
  win?: string;
  friction?: string;
  nextStep?: string;
  note?: string;
  createdAt: string;
};

export type FocusOverview = {
  summary: {
    todayMinutes: number;
    weekMinutes: number;
    completedSessions: number;
    activeRoutines: number;
    reflectionsThisWeek: number;
  };
  daily: { _id: string; minutes: number; sessions: number }[];
  routines: Routine[];
  recentSessions: FocusSession[];
  latestReflection: Reflection | null;
};

const unwrap = <T>(response: { data: { data: T } }) => response.data.data;

export const focusService = {
  getOverview: async () => unwrap<FocusOverview>(await api.get("/focus/overview")),
  getSessions: async (limit = 30) => unwrap<FocusSession[]>(await api.get(`/focus/sessions?limit=${limit}`)),
  createSession: async (data: {
    intention: string;
    durationMinutes: number;
    status?: FocusSession["status"];
    startedAt?: string;
    completedAt?: string;
    distractionCount?: number;
    closingNote?: string;
  }) => unwrap<FocusSession>(await api.post("/focus/sessions", data)),
  updateSession: async (id: string, data: Partial<Omit<FocusSession, "_id">>) => unwrap<FocusSession>(await api.patch(`/focus/sessions/${id}`, data)),
  deleteSession: async (id: string) => api.delete(`/focus/sessions/${id}`),
  getRoutines: async () => unwrap<Routine[]>(await api.get("/focus/routines")),
  createRoutine: async (data: { title: string; cue?: string; durationMinutes: number; days: string[]; preferredTime: string; color: Routine["color"] }) =>
    unwrap<Routine>(await api.post("/focus/routines", data)),
  updateRoutine: async (id: string, data: Partial<Omit<Routine, "_id" | "completionCount">>) => unwrap<Routine>(await api.patch(`/focus/routines/${id}`, data)),
  completeRoutine: async (id: string, data: { distractionCount?: number; closingNote?: string } = {}) =>
    unwrap<{ routine: Routine; session: FocusSession }>(await api.post(`/focus/routines/${id}/complete`, data)),
  deleteRoutine: async (id: string) => api.delete(`/focus/routines/${id}`),
  getReflections: async (limit = 30) => unwrap<Reflection[]>(await api.get(`/focus/reflections?limit=${limit}`)),
  createReflection: async (data: Omit<Reflection, "_id" | "createdAt">) => unwrap<Reflection>(await api.post("/focus/reflections", data)),
  deleteReflection: async (id: string) => api.delete(`/focus/reflections/${id}`),
};
