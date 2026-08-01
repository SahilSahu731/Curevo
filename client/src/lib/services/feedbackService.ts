import api from "../api";

export const feedbackService = {
  createFeedback: async (data: {
    category?: string;
    subject: string;
    message: string;
    priority?: string;
  }) => {
    const response = await api.post("/feedback", data);
    return response.data;
  },

  getMyFeedback: async () => {
    const response = await api.get("/feedback/me");
    return response.data;
  },
};
