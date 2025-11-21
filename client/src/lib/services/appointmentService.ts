import api from "../api";

export const appointmentService = {
  book: (data: any) => api.post("/patients/appointments", data), 
  myAppointments: () => api.get("/patients/appointments"),
};
