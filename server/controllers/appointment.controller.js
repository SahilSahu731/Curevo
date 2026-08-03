import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import Clinic from "../models/clinic.model.js";
import { generateToken } from "../utils/tokenGenerator.js";
import { addToQueue, removeFromQueue } from "../utils/queueManager.js";
import { createTelehealthRoomId, isLegacyRoomId, isTelehealthWindowOpen } from "../utils/telehealth.js";
import { createRoomGrant } from "../utils/roomGrant.js";

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

const canJoinTelehealth = async (user, appointment) => {
  if (!user?.emailVerifiedAt || !['patient', 'doctor'].includes(user.role)) return false;
  if (user.role === 'patient') return appointment.patientId?.toString() === user.id;
  const doctor = await Doctor.findOne({ userId: user.id, _id: appointment.doctorId, 'verification.status': 'approved' }).select('_id').lean();
  return Boolean(doctor);
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

  if (!appointment.telehealthRoomId || isLegacyRoomId(appointment.telehealthRoomId)) {
    appointment.telehealthRoomId = createTelehealthRoomId();
    appointment.telehealthGrantVersion = (appointment.telehealthGrantVersion || 0) + 1;
  }
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
    if (doctor.verification?.status !== 'approved' || !doctor.isAvailable) {
      return res.status(409).json({ success: false, error: "This clinician is not currently eligible for booking" });
    }

    const actualClinicId = clinicId || doctor.clinicId;
    if (actualClinicId.toString() !== doctor.clinicId.toString()) {
      return res.status(400).json({ success: false, error: "Clinician is not assigned to the selected clinic" });
    }
    const clinic = await Clinic.findById(actualClinicId).select('isActive');
    if (!clinic?.isActive) {
      return res.status(409).json({ success: false, error: "This clinic is not currently accepting appointment requests" });
    }
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

    const statusChanged = req.body.status !== undefined && req.body.status !== appointment.status;
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) appointment[field] = req.body[field];
    });
    if (statusChanged) {
      appointment.telehealthGrantVersion = (appointment.telehealthGrantVersion || 0) + 1;
    }
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
    appointment.telehealthGrantVersion = (appointment.telehealthGrantVersion || 0) + 1;
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
    if (!(await canJoinTelehealth(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    if (appointment.consultationType !== 'video') {
      return res.status(400).json({ success: false, error: "This appointment is not a telehealth visit" });
    }
    if (!isTelehealthWindowOpen(appointment)) {
      return res.status(403).json({ success: false, error: "The telehealth room is only available during the appointment window" });
    }

    attachTelehealth(appointment);
    await appointment.save();
    const accessGrant = createRoomGrant({
      appointmentId: appointment._id,
      roomId: appointment.telehealthRoomId,
      userId: req.user._id,
      role: req.user.role,
      grantVersion: appointment.telehealthGrantVersion,
    });

    res.status(200).json({
      success: true,
      data: {
        roomId: appointment.telehealthRoomId,
        url: appointment.telehealthUrl,
        appointmentId: appointment._id,
        accessGrant,
      }
    });
  } catch (error) {
    console.error("Telehealth Session Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getTelehealthAccessByRoom = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      telehealthRoomId: req.params.roomId,
      consultationType: 'video',
    });
    if (!appointment) return res.status(404).json({ success: false, error: "Telehealth room not found" });
    if (!(await canJoinTelehealth(req.user, appointment))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }
    if (!isTelehealthWindowOpen(appointment)) {
      return res.status(403).json({ success: false, error: "The telehealth room is only available during the appointment window" });
    }
    attachTelehealth(appointment);
    await appointment.save();
    const accessGrant = createRoomGrant({
      appointmentId: appointment._id,
      roomId: appointment.telehealthRoomId,
      userId: req.user._id,
      role: req.user.role,
      grantVersion: appointment.telehealthGrantVersion,
    });
    res.status(200).json({
      success: true,
      data: { roomId: appointment.telehealthRoomId, appointmentId: appointment._id, accessGrant },
    });
  } catch {
    res.status(500).json({ success: false, error: "Telehealth access could not be prepared" });
  }
};
