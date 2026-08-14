import api from "@/lib/api"

export type NotificationItem = {
  _id: string
  type: string
  message: string
  safeLink?: string
  isRead: boolean
  createdAt: string
  deliveryStatus: string
}

export const notificationService = {
  list: async (page = 1) => (await api.get(`/notifications?page=${page}&limit=20`)).data,
  markRead: async (id: string) => (await api.patch(`/notifications/read/${id}`)).data,
  preferences: async () => (await api.get("/notifications/preferences")).data,
  updatePreferences: async (data: Record<string, boolean | string>) => (await api.put("/notifications/preferences", data)).data,
}
