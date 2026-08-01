import Appointment from "../models/appointment.model.js";

export const generateToken = async (clinicId, doctorId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Find the last token number for this doctor/clinic/day
  const lastAppointment = await Appointment.findOne({
    clinicId,
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).sort({ tokenNumber: -1 });

  return lastAppointment ? lastAppointment.tokenNumber + 1 : 1;
};
