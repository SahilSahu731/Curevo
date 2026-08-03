import Appointment from "../models/appointment.model.js";

const TRANSITIONS = {
  booked: {
    waiting: ["patient", "admin"],
    cancelled: ["patient", "doctor", "admin"],
  },
  waiting: {
    "in-progress": ["doctor", "admin"],
    cancelled: ["patient", "doctor", "admin"],
    "no-show": ["doctor", "admin"],
  },
  "in-progress": {
    completed: ["doctor", "admin"],
    cancelled: ["admin"],
  },
  completed: {}, cancelled: {}, "no-show": {},
};

export const canTransitionAppointment = (from, to, role) => Boolean(TRANSITIONS[from]?.[to]?.includes(role));

export const transitionAppointment = async ({ appointment, to, actor, reason }) => {
  if (appointment.status === to) return { appointment, replayed: true };
  if (!canTransitionAppointment(appointment.status, to, actor.role)) {
    throw Object.assign(new Error(`Cannot change appointment from ${appointment.status} to ${to}`), { statusCode: 409 });
  }
  const from = appointment.status;
  const set = { status: to };
  if (to === "waiting") set.checkInTime = appointment.checkInTime || new Date();
  if (to === "in-progress") set.consultationStartTime = appointment.consultationStartTime || new Date();
  if (to === "completed") set.consultationEndTime = appointment.consultationEndTime || new Date();
  if (["cancelled", "completed", "no-show"].includes(to)) set.telehealthGrantVersion = (appointment.telehealthGrantVersion || 0) + 1;
  const updated = await Appointment.findOneAndUpdate(
    { _id: appointment._id, status: from, __v: appointment.__v },
    {
      $set: set,
      $inc: { __v: 1 },
      $push: { statusHistory: { from, to, actorUserId: actor._id, actorRole: actor.role, reason } },
    },
    { new: true },
  );
  if (!updated) throw Object.assign(new Error("Appointment changed in another request; refresh and retry"), { statusCode: 409 });
  return { appointment: updated, replayed: false };
};
