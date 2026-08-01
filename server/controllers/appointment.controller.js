import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import { generateToken } from "../utils/tokenGenerator.js";
import { addToQueue, removeFromQueue } from "../utils/queueManager.js";

const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const populateAppointment = (query) => query
  .populate('patientId', 'name email phone profileImage gender dateOfBirth')
  .populate({
    path: 'doctorId',
    populate: { path: 'userId', select: 'name email profileImage phone' }
  })
  .populate('clinicId', 'name address city phone');

const getDoctorForUser = (userId) => Doctor.findOne({ userId });

const canAccessAppointment = async (user, appointment) => {
  if (user.role === 'admin') return true;
  if (appointment.patientId?._id?.toString?.() === user.id || appointment.patientId?.toString?.() === user.id) return true;
  if (user.role !== 'doctor') return false;
  const doctor = await getDoctorForUser(user.id);
  return doctor?._id.toString() === appointment.doctorId?._id?.toString?.() || doctor?._id.toString() === appointment.doctorId?.toString?.();
};

const ensureSlotAvailable = async ({ doctorId, clinicId, date, slotTime, excludeId }) => {
  const conflict = await Appointment.findOne({
    _id: excludeId ? { $ne: excludeId } : { $exists: true },
    doctorId,
    clinicId,
    date: { $gte: getStartOfDay(date), $lte: getEndOfDay(date) },
    slotTime,
    status: { $nin: ['cancelled', 'no-show'] },
  });

  return !conflict;
};

const attachTelehealth = (appointment) => {
  if (appointment.consultationType !== 'video') {
    appointment.telehealthRoomId = undefined;
    appointment.telehealthUrl = undefined;
    return;
  }

  appointment.telehealthRoomId = appointment.telehealthRoomId || `curevo-${appointment._id}`;
  appointment.telehealthUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/telehealth/room/${appointment.telehealthRoomId}`;
};

export const getAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    }
    if (req.user.role === 'doctor') {
      const doctor = await getDoctorForUser(req.user.id);
      if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });
      query.doctorId = doctor._id;
    }
    if (status && status !== 'all') query.status = status;
    if (date) query.date = { $gte: getStartOfDay(date), $lte: getEndOfDay(date) };

    const appointments = await populateAppointment(Appointment.find(query))
      .sort({ date: 1, tokenNumber: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error("Get Appointments Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
    }

    const appointment = await populateAppointment(Appointment.findById(id));
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error("Get Appointment Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, clinicId, date, slotTime, symptoms, priority, consultationType, patientId } = req.body;
    const actualPatientId = req.user.role === 'admin' && patientId ? patientId : req.user.id;

    if (!doctorId || !date || !slotTime) {
      return res.status(400).json({ success: false, error: "doctorId, date, and slotTime are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, error: "Doctor not found" });

    const actualClinicId = clinicId || doctor.clinicId;
    const appointmentDate = getStartOfDay(date);
    const available = await ensureSlotAvailable({
      doctorId,
      clinicId: actualClinicId,
      date: appointmentDate,
      slotTime,
    });

    if (!available) {
      return res.status(409).json({ success: false, error: "Slot already booked" });
    }

    const tokenNumber = await generateToken(actualClinicId, doctorId, appointmentDate);
    const appointment = await Appointment.create({
      patientId: actualPatientId,
      doctorId,
      clinicId: actualClinicId,
      date: appointmentDate,
      slotTime,
      tokenNumber,
      symptoms,
      priority: priority || 'normal',
      consultationType: consultationType || 'in-person',
      status: 'booked',
    });

    attachTelehealth(appointment);
    await appointment.save();

    res.status(201).json({ success: true, message: "Appointment created", data: appointment });
  } catch (error) {
    console.error("Create Appointment Error:", error);
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const editableFieldsByRole = {
      patient: ['symptoms'],
      doctor: ['status', 'notes'],
      admin: ['doctorId', 'clinicId', 'slotTime', 'status', 'priority', 'symptoms', 'consultationType', 'notes'],
    };
    const allowedFields = editableFieldsByRole[req.user.role] || [];
    const canReschedule = req.user.role === 'admin';

    const nextDate = canReschedule && req.body.date ? getStartOfDay(req.body.date) : appointment.date;
    const nextSlot = canReschedule && req.body.slotTime ? req.body.slotTime : appointment.slotTime;
    const nextDoctorId = canReschedule && req.body.doctorId ? req.body.doctorId : appointment.doctorId;
    const nextClinicId = canReschedule && req.body.clinicId ? req.body.clinicId : appointment.clinicId;

    if (
      nextSlot !== appointment.slotTime ||
      getStartOfDay(nextDate).getTime() !== getStartOfDay(appointment.date).getTime() ||
      nextDoctorId.toString() !== appointment.doctorId.toString() ||
      nextClinicId.toString() !== appointment.clinicId.toString()
    ) {
      const available = await ensureSlotAvailable({
        doctorId: nextDoctorId,
        clinicId: nextClinicId,
        date: nextDate,
        slotTime: nextSlot,
        excludeId: appointment._id,
      });
      if (!available) return res.status(409).json({ success: false, error: "Slot already booked" });
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) appointment[field] = req.body[field];
    });
    appointment.date = nextDate;
    attachTelehealth(appointment);
    await appointment.save();

    if (appointment.status === 'waiting') await addToQueue(appointment._id);
    if (['cancelled', 'completed', 'no-show'].includes(appointment.status)) await removeFromQueue(appointment);

    const populated = await populateAppointment(Appointment.findById(appointment._id));
    res.status(200).json({ success: true, message: "Appointment updated", data: populated });
  } catch (error) {
    console.error("Update Appointment Error:", error);
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    await removeFromQueue(appointment);
    res.status(200).json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.error("Delete Appointment Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getTelehealthSession = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (!(await canAccessAppointment(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    if (appointment.consultationType !== 'video') {
      return res.status(400).json({ success: false, error: "This appointment is not a telehealth visit" });
    }

    attachTelehealth(appointment);
    await appointment.save();

    res.status(200).json({
      success: true,
      data: {
        roomId: appointment.telehealthRoomId,
        url: appointment.telehealthUrl,
        appointmentId: appointment._id,
      }
    });
  } catch (error) {
    console.error("Telehealth Session Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
