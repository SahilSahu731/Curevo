export const queryKeys = {
  auth: ["auth"] as const,
  me: ["me"] as const,
  appointments: ["appointments"] as const,
  appointment: (id: string) => ["appointment", id] as const,
  queue: (id: string) => ["queue", id] as const,
  clinics: ["clinics"] as const,
  doctors: ["doctors"] as const,
};