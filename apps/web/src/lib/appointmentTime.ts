export type AppointmentTime = { slotStartUtc?: string; date: string; slotTime?: string; clinicTimezone?: string }

export const formatAppointmentTime = (appointment: AppointmentTime, options?: Intl.DateTimeFormatOptions) => {
  const timezone = appointment.clinicTimezone || "Asia/Kolkata"
  if (!appointment.slotStartUtc) return `${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: timezone }).format(new Date(appointment.date))}${appointment.slotTime ? ` at ${appointment.slotTime}` : ""} (${timezone})`
  return `${new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short", timeZone: timezone, ...options }).format(new Date(appointment.slotStartUtc))} (${timezone})`
}
