import api from "../api";

export const queueService = {
  getQueue: (doctorId: string) =>
    api.get(`/queue/${doctorId}`),
};
