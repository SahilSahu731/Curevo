import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import Doctor from "../models/doctor.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";

const populateRecord = (query) => query
  .populate("patientId", "name email phone profileImage gender dateOfBirth")
  .populate({
    path: "doctorId",
    populate: { path: "userId", select: "name email profileImage" },
  })
  .populate({
    path: "appointmentId",
    select: "date slotTime tokenNumber consultationType clinicId",
    populate: { path: "clinicId", select: "name address city phone" },
  });

const getDoctorForUser = (userId) => Doctor.findOne({ userId });

const parsePrescription = (items = [], prescriptionText = "") => {
  if (Array.isArray(items) && items.length > 0) return items;

  return prescriptionText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [medicine, dosage = "", frequency = "", duration = "", instructions = ""] = line.split("|").map((part) => part.trim());
      return { medicine, dosage, frequency, duration, instructions };
    });
};

const canAccessRecord = async (user, record) => {
  if (user.role === "admin") return true;
  if (record.patientId?._id?.toString?.() === user.id || record.patientId?.toString?.() === user.id) return true;
  if (user.role !== "doctor") return false;
  const doctor = await getDoctorForUser(user.id);
  return doctor?._id.toString() === record.doctorId?._id?.toString?.() || doctor?._id.toString() === record.doctorId?.toString?.();
};

export const createMedicalRecord = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor && req.user.role !== "admin") {
      return res.status(404).json({ success: false, error: "Doctor profile not found" });
    }

    const { appointmentId, diagnosis, prescription, prescriptionText, treatmentPlan, doctorNotes, followUpDate, attachments } = req.body;
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, error: "Invalid Appointment ID" });
    }
    if (!diagnosis?.trim()) {
      return res.status(400).json({ success: false, error: "Diagnosis is required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, error: "Appointment not found" });
    if (req.user.role !== "admin" && appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized for this appointment" });
    }

    const record = await MedicalRecord.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        diagnosis,
        symptoms: appointment.symptoms,
        prescription: parsePrescription(prescription, prescriptionText),
        treatmentPlan,
        doctorNotes,
        followUpDate: followUpDate || undefined,
        attachments: attachments || [],
      },
      { new: true, upsert: true, runValidators: true }
    );

    const populated = await populateRecord(MedicalRecord.findById(record._id));
    res.status(201).json({ success: true, message: "Medical record saved", data: populated });
  } catch (error) {
    console.error("Create Medical Record Error:", error);
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === "patient") {
      query.patientId = req.user.id;
    } else if (req.user.role === "doctor") {
      const doctor = await getDoctorForUser(req.user.id);
      if (!doctor) return res.status(404).json({ success: false, error: "Doctor profile not found" });
      query.doctorId = doctor._id;
      if (req.query.patientId) query.patientId = req.query.patientId;
    } else if (req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    const records = await populateRecord(MedicalRecord.find(query)).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    console.error("Get Medical Records Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const getMedicalRecord = async (req, res) => {
  try {
    const record = await populateRecord(MedicalRecord.findById(req.params.id));
    if (!record) return res.status(404).json({ success: false, error: "Medical record not found" });
    if (!(await canAccessRecord(req.user, record))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("Get Medical Record Error:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: "Medical record not found" });
    if (!(await canAccessRecord(req.user, record))) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const allowed = ["diagnosis", "prescription", "treatmentPlan", "doctorNotes", "followUpDate", "attachments"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) record[field] = req.body[field];
    });
    if (req.body.prescriptionText !== undefined) {
      record.prescription = parsePrescription(req.body.prescription, req.body.prescriptionText);
    }

    await record.save();
    const populated = await populateRecord(MedicalRecord.findById(record._id));
    res.status(200).json({ success: true, message: "Medical record updated", data: populated });
  } catch (error) {
    console.error("Update Medical Record Error:", error);
    res.status(500).json({ success: false, error: error.message || "Server Error" });
  }
};
