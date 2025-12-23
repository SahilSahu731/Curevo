import Appointment from "../models/appointment.model.js";

export const generateToken = async (clinicId, doctorId, date) => {
  // Find the last token number for this doctor/clinic/day
  const lastAppointment = await Appointment.findOne({
    clinicId,
    doctorId,
    date
  }).sort({ tokenNumber: -1 });

  return lastAppointment ? lastAppointment.tokenNumber + 1 : 1;
};
