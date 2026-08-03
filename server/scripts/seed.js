import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import Appointment from "../models/appointment.model.js";
import Clinic from "../models/clinic.model.js";
import ClinicReview from "../models/clinicReview.model.js";
import Consent from "../models/consent.model.js";
import Doctor from "../models/doctor.model.js";
import Feedback from "../models/feedback.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import Notification from "../models/notification.model.js";
import PrivacyRequest from "../models/privacyRequest.model.js";
import Queue from "../models/queue.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import { createTelehealthRoomId } from "../utils/telehealth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env"), quiet: true });

const COUNTS = {
  clinics: 100,
  doctors: 100,
  patients: 150,
  todayAppointmentsPerDoctor: 3,
  historicalAppointments: 300,
  futureAppointments: 200,
  medicalRecords: 200,
  reviews: 300,
  clinicReviews: 300,
  feedback: 150,
  notifications: 500,
};

const DEFAULT_PASSWORD = "Password123!";
const SEED_ADMIN_EMAIL = "admin.seed@curevo.com";
const SEED_BATCH = `synthetic-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const synthetic = { isSynthetic: true, seedBatch: SEED_BATCH };

const firstNames = [
  "Aarav", "Aditi", "Aisha", "Akash", "Amelia", "Ananya", "Arjun", "Ava", "Benjamin", "Charlotte",
  "Daniel", "Diya", "Ethan", "Fatima", "Grace", "Ishaan", "James", "Kavya", "Liam", "Maya",
  "Meera", "Mia", "Noah", "Olivia", "Priya", "Rahul", "Riya", "Samuel", "Sophia", "Vihaan",
];
const lastNames = [
  "Anderson", "Brown", "Davis", "Garcia", "Gupta", "Harris", "Jackson", "Johnson", "Kapoor", "Khan",
  "Kumar", "Lee", "Martin", "Mehta", "Miller", "Patel", "Rodriguez", "Shah", "Sharma", "Singh",
  "Smith", "Taylor", "Thomas", "Walker", "Williams",
];
const cities = [
  ["Mumbai", "MH", "400001"], ["Delhi", "DL", "110001"], ["Bengaluru", "KA", "560001"],
  ["Hyderabad", "TS", "500001"], ["Chennai", "TN", "600001"], ["Kolkata", "WB", "700001"],
  ["Pune", "MH", "411001"], ["Ahmedabad", "GJ", "380001"], ["Jaipur", "RJ", "302001"],
  ["Lucknow", "UP", "226001"], ["Chandigarh", "CH", "160017"], ["Kochi", "KL", "682001"],
];
const clinicPrefixes = [
  "Curevo", "Harmony", "Lifeline", "WellSpring", "NovaCare", "CityMed", "Evergreen", "Unity", "Sunrise", "PrimeCare",
];
const clinicSuffixes = ["Medical Center", "Health Clinic", "Specialty Hospital", "Family Care", "Wellness Centre"];
const specializations = [
  "Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics", "General Medicine", "Psychiatry",
  "Ophthalmology", "Dentistry", "ENT", "Gynecology", "Endocrinology", "Gastroenterology", "Pulmonology",
];
const services = [
  "General Consultation", "Preventive Care", "Diagnostics", "Urgent Visit Requests", "Pediatrics", "Cardiology",
  "Dermatology", "Vaccination", "Health Screening", "Telehealth", "Pharmacy", "Laboratory Services",
];
const symptoms = [
  "Recurring headache and mild fatigue", "Seasonal cough and sore throat", "Routine follow-up consultation",
  "Lower back discomfort", "Skin irritation and redness", "Digestive discomfort after meals",
  "Annual wellness examination", "Joint pain during movement", "Sleep difficulty and stress", "Blood pressure review",
];
const diagnoses = [
  "Seasonal allergic rhinitis", "Tension headache", "Viral upper respiratory infection", "Vitamin D deficiency",
  "Mild hypertension", "Acid reflux", "Contact dermatitis", "Muscle strain", "Iron deficiency anemia", "Type 2 diabetes follow-up",
];
const medicines = [
  "Paracetamol", "Cetirizine", "Omeprazole", "Vitamin D3", "Ibuprofen", "Metformin", "Amlodipine", "Azithromycin",
];
const reviewComments = [
  "The doctor listened carefully and explained the treatment clearly.",
  "Professional staff and a smooth appointment experience.",
  "I appreciated the short wait and helpful follow-up advice.",
  "Clean facility, friendly team, and efficient service.",
  "The consultation was thorough and easy to understand.",
];
const clinicComments = [
  "The clinic was clean, organized, and easy to find.",
  "Check-in was quick and the reception team was helpful.",
  "Modern facilities with a comfortable waiting area.",
  "The queue updates made the visit much easier to plan.",
  "Good service and clear communication throughout the visit.",
];
const feedbackSubjects = [
  "Appointment reminder suggestion", "Queue status question", "Billing receipt request", "Video consultation feedback",
  "Profile update issue", "Clinic search suggestion", "Notification timing", "Medical record access",
];
const avatarUrls = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
];
const clinicImages = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516549655169-df83a0833860?auto=format&fit=crop&w=1200&q=80",
];

const pick = (items, index, offset = 0) => items[(index + offset) % items.length];
const pad = (value, length = 3) => String(value).padStart(length, "0");
const nameFor = (index) => `${pick(firstNames, index)} ${pick(lastNames, index * 3 + 2)}`;
const dateAtOffset = (days, hour = 0, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

const clearSeedableData = async () => {
  const models = [Notification, Queue, MedicalRecord, Review, ClinicReview, Feedback, Appointment, Doctor, Clinic, User];
  const unmarkedCounts = await Promise.all(models.map((model) => model.countDocuments({ isSynthetic: { $ne: true } })));
  const hasUnmarkedData = unmarkedCounts.some((count) => count > 0);
  const target = new URL(process.env.MONGO_URI);
  const isLocal = ["127.0.0.1", "localhost"].includes(target.hostname);

  if (hasUnmarkedData && !(isLocal && process.env.RESET_ALL_DATA === "true")) {
    throw new Error("Unmarked data exists. Seed aborted to prevent data loss. Inspect it first; for a disposable local database only, set RESET_ALL_DATA=true.");
  }

  console.log(hasUnmarkedData ? "Local destructive reset explicitly approved." : "Clearing previously tagged synthetic fixtures...");
  const filter = hasUnmarkedData ? {} : { isSynthetic: true };
  const usersToDelete = await User.find(filter).select('_id').lean();
  const userIds = usersToDelete.map(({ _id }) => _id);
  await Promise.all([
    Notification.deleteMany(filter),
    Queue.deleteMany(filter),
    MedicalRecord.deleteMany(filter),
    Review.deleteMany(filter),
    ClinicReview.deleteMany(filter),
    Feedback.deleteMany(filter),
    Appointment.deleteMany(filter),
    Consent.deleteMany(hasUnmarkedData ? {} : { $or: [{ isSynthetic: true }, { userId: { $in: userIds } }] }),
    PrivacyRequest.deleteMany(hasUnmarkedData ? {} : { isSynthetic: true }),
  ]);
  await Doctor.deleteMany(filter);
  await Clinic.deleteMany(filter);
  await User.deleteMany(filter);
};

const seedUsersAndClinics = async (password) => {
  const clinics = await Clinic.insertMany(Array.from({ length: COUNTS.clinics }, (_, index) => {
    const [city, state, zipCode] = pick(cities, index);
    const clinicServices = Array.from({ length: 5 }, (__, serviceIndex) => pick(services, index + serviceIndex * 2));

    return {
      ...synthetic,
      name: `${pick(clinicPrefixes, index)} ${city} ${pick(clinicSuffixes, index * 2)} ${pad(index + 1)}`,
      address: `${20 + index} Healthcare Avenue, ${city}`,
      city,
      state,
      zipCode,
      description: `Synthetic clinic fixture in ${city} for testing submitted outpatient, diagnostic, and virtual-care listings.`,
      images: [pick(clinicImages, index), pick(clinicImages, index, 1), pick(clinicImages, index, 2)],
      services: [...new Set(clinicServices)],
      phone: `+9122${String(60000000 + index).padStart(8, "0")}`,
      email: `clinic${pad(index + 1)}@seed.curevo.com`,
      openingTime: index % 3 === 0 ? "08:00" : "09:00",
      closingTime: index % 4 === 0 ? "20:00" : "18:00",
      averageConsultationTime: 15 + (index % 4) * 5,
      workingDays: index % 4 === 0
        ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      maxPatientsPerDay: 50 + (index % 6) * 10,
      slotBufferMinutes: index % 3 === 0 ? 10 : 5,
      breakSlots: [{ startTime: "13:00", endTime: "14:00", reason: "Lunch break" }],
      isActive: index % 20 !== 0,
    };
  }));

  const doctorUsers = await User.insertMany(Array.from({ length: COUNTS.doctors }, (_, index) => {
    const [city, state, zipCode] = pick(cities, index);
    return {
      ...synthetic,
      name: `Dr. ${nameFor(index)}`,
      email: `doctor${pad(index + 1)}@seed.curevo.com`,
      password,
      role: "doctor",
      phone: `+9198${String(10000000 + index).padStart(8, "0")}`,
      gender: pick(["male", "female", "other"], index),
      dateOfBirth: new Date(1972 + (index % 20), index % 12, 1 + (index % 25)),
      profileImage: pick(avatarUrls, index),
      address: { street: `${100 + index} Medical Lane`, city, state, zipCode, country: "India" },
      bio: `Synthetic ${pick(specializations, index)} profile for interface testing; not a real clinician or credential.`,
    };
  }));

  const patientUsers = await User.insertMany(Array.from({ length: COUNTS.patients }, (_, index) => {
    const [city, state, zipCode] = pick(cities, index * 2);
    return {
      ...synthetic,
      name: nameFor(index + COUNTS.doctors),
      email: `patient${pad(index + 1)}@seed.curevo.com`,
      password,
      role: "patient",
      phone: `+9170${String(20000000 + index).padStart(8, "0")}`,
      gender: pick(["female", "male", "other"], index),
      dateOfBirth: new Date(1955 + (index % 50), index % 12, 1 + (index % 25)),
      profileImage: pick(avatarUrls, index + 1),
      address: { street: `${200 + index} Park Road`, city, state, zipCode, country: "India" },
      bio: "Demo patient account for exploring Curevo appointments, queues, and medical records.",
    };
  }));

  const [admin] = await User.insertMany([{
    ...synthetic,
    name: "Curevo Seed Admin",
    email: SEED_ADMIN_EMAIL,
    password,
    role: "admin",
    phone: "+919900000001",
    address: { street: "1 Curevo Way", city: "Mumbai", state: "MH", zipCode: "400001", country: "India" },
  }]);

  return { clinics, doctorUsers, patientUsers, admin };
};

const seedDoctors = async (clinics, doctorUsers, admin) => Doctor.insertMany(
  doctorUsers.map((user, index) => ({
    ...synthetic,
    userId: user._id,
    clinicId: clinics[index % clinics.length]._id,
    specialization: pick(specializations, index),
    qualification: pick(["MBBS, MD", "MBBS, DNB", "MBBS, MS", "BDS, MDS"], index),
    experience: 3 + (index % 28),
    consultationFee: 400 + (index % 10) * 150,
    isAvailable: index % 9 !== 0,
    verification: {
      status: index % 12 === 0 ? "pending" : "approved",
      licenseNumber: `SYNTHETIC-NOT-A-LICENSE-${pad(index + 1, 5)}`,
      licenseFileUrl: `https://example.com/licenses/doctor-${pad(index + 1)}.pdf`,
      submittedAt: dateAtOffset(-40 - (index % 20)),
      reviewedAt: index % 12 === 0 ? undefined : dateAtOffset(-20 - (index % 10)),
      reviewedBy: index % 12 === 0 ? undefined : admin._id,
      notes: index % 12 === 0 ? "Synthetic fixture awaiting workflow review" : "Synthetic approved state; no credentialing was performed",
    },
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startTime: index % 2 === 0 ? "09:00" : "10:00",
      endTime: index % 2 === 0 ? "17:00" : "18:00",
      slotDuration: 20 + (index % 3) * 5,
    },
    blockedSlots: index % 10 === 0
      ? [{ date: dateAtOffset(7), startTime: "14:00", endTime: "15:00", reason: "Medical conference" }]
      : [],
  }))
);

const seedAppointmentsAndQueues = async (clinics, doctors, patients) => {
  const appointmentData = [];
  const tokenCounters = new Map();

  const addAppointment = ({ doctorIndex, patientIndex, date, status, priority = "normal", consultationType = "in-person" }) => {
    const doctor = doctors[doctorIndex % doctors.length];
    const clinic = clinics[doctorIndex % clinics.length];
    const dayKey = date.toISOString().slice(0, 10);
    const tokenKey = `${doctor._id}:${dayKey}`;
    const tokenNumber = (tokenCounters.get(tokenKey) || 0) + 1;
    tokenCounters.set(tokenKey, tokenNumber);
    const hour = 8 + Math.floor((tokenNumber - 1) / 2);
    const minute = tokenNumber % 2 === 0 ? "30" : "00";
    const isVideo = consultationType === "video";
    const telehealthRoomId = isVideo ? createTelehealthRoomId() : undefined;
    const checkInTime = ["waiting", "in-progress", "completed"].includes(status)
      ? new Date(date.getTime() + Math.max(0, hour - 8) * 60 * 60 * 1000)
      : undefined;

    appointmentData.push({
      ...synthetic,
      patientId: patients[patientIndex % patients.length]._id,
      doctorId: doctor._id,
      clinicId: clinic._id,
      date,
      slotTime: `${String(hour).padStart(2, "0")}:${minute}`,
      tokenNumber,
      status,
      priority,
      symptoms: pick(symptoms, appointmentData.length),
      consultationType,
      telehealthRoomId,
      telehealthUrl: telehealthRoomId ? `http://localhost:3000/telehealth/room/${telehealthRoomId}` : undefined,
      telehealthGrantVersion: isVideo ? 1 : 0,
      estimatedWaitTime: Math.max(0, (tokenNumber - 1) * 15),
      actualWaitTime: status === "completed" ? 5 + (appointmentData.length % 35) : undefined,
      checkInTime,
      consultationStartTime: status === "completed" ? new Date(date.getTime() + hour * 60 * 60 * 1000) : undefined,
      consultationEndTime: status === "completed" ? new Date(date.getTime() + (hour * 60 + 25) * 60 * 1000) : undefined,
      notes: status === "completed" ? "Consultation completed. Follow the treatment plan and return if symptoms persist." : undefined,
    });
  };

  for (let doctorIndex = 0; doctorIndex < COUNTS.doctors; doctorIndex += 1) {
    for (let slot = 0; slot < COUNTS.todayAppointmentsPerDoctor; slot += 1) {
      addAppointment({
        doctorIndex,
        patientIndex: doctorIndex === 0 && slot === 1 ? 0 : doctorIndex * 3 + slot,
        date: dateAtOffset(0),
        status: slot === 0 ? "in-progress" : "waiting",
        priority: slot === 2 && doctorIndex % 8 === 0 ? "emergency" : "normal",
        consultationType: slot === 1 && doctorIndex % 4 === 0 ? "video" : "in-person",
      });
    }
  }

  for (let index = 0; index < COUNTS.historicalAppointments; index += 1) {
    addAppointment({
      doctorIndex: index,
      patientIndex: index * 7,
      date: dateAtOffset(-1 - (index % 75)),
      status: index < 240 ? "completed" : index % 2 === 0 ? "cancelled" : "no-show",
      priority: index % 31 === 0 ? "emergency" : "normal",
      consultationType: index % 5 === 0 ? "video" : "in-person",
    });
  }

  for (let index = 0; index < COUNTS.futureAppointments; index += 1) {
    addAppointment({
      doctorIndex: index * 3,
      patientIndex: index === 0 ? 0 : index * 5 + 1,
      date: dateAtOffset(1 + (index % 45)),
      status: "booked",
      consultationType: index % 4 === 0 ? "video" : "in-person",
    });
  }

  const appointments = await Appointment.insertMany(appointmentData);
  const todayAppointmentCount = COUNTS.doctors * COUNTS.todayAppointmentsPerDoctor;
  const todayAppointments = appointments.slice(0, todayAppointmentCount);

  const queues = await Queue.insertMany(doctors.map((doctor, index) => {
    const queueAppointments = todayAppointments.slice(
      index * COUNTS.todayAppointmentsPerDoctor,
      (index + 1) * COUNTS.todayAppointmentsPerDoctor,
    );
    return {
      ...synthetic,
      clinicId: clinics[index % clinics.length]._id,
      doctorId: doctor._id,
      date: dateAtOffset(0),
      currentToken: 1,
      appointmentIds: queueAppointments.map((appointment) => appointment._id),
      emergencyQueue: queueAppointments.filter((appointment) => appointment.priority === "emergency").map((appointment) => appointment._id),
      lastUpdated: new Date(),
    };
  }));

  await Promise.all(doctors.map((doctor, index) => Doctor.updateOne(
    { _id: doctor._id },
    { currentPatient: todayAppointments[index * COUNTS.todayAppointmentsPerDoctor]._id },
  )));

  return { appointments, queues };
};

const seedMedicalRecords = async (appointments) => {
  const completedAppointments = appointments.filter((appointment) => appointment.status === "completed");
  return MedicalRecord.insertMany(completedAppointments.slice(0, COUNTS.medicalRecords).map((appointment, index) => ({
    ...synthetic,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    appointmentId: appointment._id,
    diagnosis: pick(diagnoses, index),
    symptoms: appointment.symptoms,
    prescription: [
      {
        medicine: pick(medicines, index),
        dosage: pick(["500 mg", "10 mg", "20 mg", "Once daily"], index),
        frequency: pick(["Once daily", "Twice daily", "After meals", "As needed"], index + 1),
        duration: `${3 + (index % 12)} days`,
        instructions: "Take with water and follow the prescribed schedule.",
      },
      ...(index % 3 === 0 ? [{
        medicine: pick(medicines, index, 2),
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "14 days",
        instructions: "Take after breakfast.",
      }] : []),
    ],
    treatmentPlan: "Rest, maintain hydration, take medication as prescribed, and monitor symptoms.",
    doctorNotes: "Patient was stable during consultation and understood the care plan.",
    followUpDate: dateAtOffset(14 + (index % 15)),
    attachments: index % 5 === 0
      ? [{ name: "Lab summary.pdf", url: `https://example.com/records/lab-${pad(index + 1)}.pdf`, type: "application/pdf" }]
      : [],
  })));
};

const seedReviewsAndFeedback = async (clinics, doctors, patients, admin) => {
  const reviews = await Review.insertMany(Array.from({ length: COUNTS.reviews }, (_, index) => ({
    ...synthetic,
    doctorId: doctors[index % doctors.length]._id,
    patientId: patients[(index * 7) % patients.length]._id,
    rating: 3 + (index % 3),
    comment: pick(reviewComments, index),
    isHelpful: (index * 3) % 42,
    createdAt: dateAtOffset(-1 - (index % 120)),
  })));

  const clinicReviews = await ClinicReview.insertMany(Array.from({ length: COUNTS.clinicReviews }, (_, index) => ({
    ...synthetic,
    clinicId: clinics[index % clinics.length]._id,
    patientId: patients[(index * 11) % patients.length]._id,
    rating: 3 + ((index + 1) % 3),
    comment: pick(clinicComments, index),
    isHelpful: (index * 5) % 36,
    createdAt: dateAtOffset(-2 - (index % 150)),
  })));

  const feedback = await Feedback.insertMany(Array.from({ length: COUNTS.feedback }, (_, index) => {
    const status = pick(["open", "in-review", "resolved", "closed"], index);
    const resolved = ["resolved", "closed"].includes(status);
    return {
      ...synthetic,
      userId: patients[index % patients.length]._id,
      category: pick(["complaint", "bug", "billing", "feature", "clinical", "other"], index),
      subject: pick(feedbackSubjects, index),
      message: `Demo feedback ${pad(index + 1)}: Please review this ${pick(feedbackSubjects, index).toLowerCase()} and share an update.`,
      status,
      priority: pick(["low", "normal", "high", "urgent"], index * 3),
      adminResponse: resolved ? "Thank you for the report. The team reviewed and resolved this request." : undefined,
      resolvedAt: resolved ? dateAtOffset(-(index % 20)) : undefined,
      handledBy: resolved ? admin._id : undefined,
      createdAt: dateAtOffset(-1 - (index % 90)),
    };
  }));

  return { reviews, clinicReviews, feedback };
};

const seedNotifications = async (appointments, patients) => Notification.insertMany(
  Array.from({ length: COUNTS.notifications }, (_, index) => {
    const appointment = appointments[index % appointments.length];
    const type = pick([
      "booking-confirmation", "turn-approaching", "turn-now", "appointment-cancelled", "system-alert",
    ], index);
    const messages = {
      "booking-confirmation": `Appointment token #${appointment.tokenNumber} has been confirmed.`,
      "turn-approaching": `Your queue turn is approaching. There are only a few patients ahead.`,
      "turn-now": `It is your turn for token #${appointment.tokenNumber}. Please proceed to the consultation room.`,
      "appointment-cancelled": `Appointment token #${appointment.tokenNumber} was cancelled.`,
      "system-alert": "Your Curevo health dashboard has a new update.",
    };

    return {
      ...synthetic,
      userId: index < appointments.length ? appointment.patientId : patients[index % patients.length]._id,
      appointmentId: type === "system-alert" ? undefined : appointment._id,
      type,
      message: messages[type],
      isRead: index % 3 !== 0,
      createdAt: dateAtOffset(-(index % 45)),
    };
  }),
);

const printSummary = async () => {
  const models = {
    users: User,
    clinics: Clinic,
    doctors: Doctor,
    appointments: Appointment,
    queues: Queue,
    medicalRecords: MedicalRecord,
    reviews: Review,
    clinicReviews: ClinicReview,
    feedback: Feedback,
    notifications: Notification,
  };
  const summary = {};

  for (const [name, model] of Object.entries(models)) {
    summary[name] = await model.countDocuments();
  }

  console.table(summary);
};

const seed = async () => {
  try {
    await connectDB();
    await clearSeedableData();

    const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const { clinics, doctorUsers, patientUsers, admin } = await seedUsersAndClinics(password);
    console.log(`Created ${clinics.length} clinics and ${doctorUsers.length + patientUsers.length + 1} demo users.`);

    const doctors = await seedDoctors(clinics, doctorUsers, admin);
    console.log(`Created ${doctors.length} doctor profiles.`);

    const { appointments, queues } = await seedAppointmentsAndQueues(clinics, doctors, patientUsers);
    console.log(`Created ${appointments.length} appointments and ${queues.length} live queues.`);

    const medicalRecords = await seedMedicalRecords(appointments);
    const { reviews, clinicReviews, feedback } = await seedReviewsAndFeedback(
      clinics,
      doctors,
      patientUsers,
      admin,
    );
    const notifications = await seedNotifications(appointments, patientUsers);
    console.log(
      `Created ${medicalRecords.length} medical records, ${reviews.length} doctor reviews, ` +
      `${clinicReviews.length} clinic reviews, ${feedback.length} feedback tickets, and ${notifications.length} notifications.`,
    );

    await printSummary();
    console.log("\nDemo accounts (all use Password123!):");
    console.log("  Patient: patient001@seed.curevo.com");
    console.log("  Doctor:  doctor001@seed.curevo.com");
    console.log(`  Admin:   ${SEED_ADMIN_EMAIL}`);
    console.log("\nSeeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
