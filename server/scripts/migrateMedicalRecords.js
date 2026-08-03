import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import ClinicalNote from "../models/clinicalNote.model.js";
import Doctor from "../models/doctor.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";

let checked = 0;
let notesMigrated = 0;
let skippedNotes = 0;

try {
  await connectDB();
  const records = await MedicalRecord.collection.find({
    $or: [
      { authorDoctorId: { $exists: false } },
      { doctorNotes: { $exists: true, $ne: "" } },
    ],
  }, {
    projection: { patientId: 1, doctorId: 1, appointmentId: 1, doctorNotes: 1, authorDoctorId: 1, revision: 1 },
  }).toArray();

  checked = records.length;
  for (const record of records) {
    let privateNoteMigrated = false;
    if (record.doctorNotes) {
      const doctor = await Doctor.findById(record.doctorId).select("userId").lean();
      if (doctor?.userId) {
        await ClinicalNote.updateOne(
          { medicalRecordId: record._id },
          { $setOnInsert: { medicalRecordId: record._id, appointmentId: record.appointmentId, patientId: record.patientId, doctorId: record.doctorId, notes: record.doctorNotes, authorUserId: doctor.userId } },
          { upsert: true },
        );
        privateNoteMigrated = true;
        notesMigrated += 1;
      } else {
        skippedNotes += 1;
      }
    }

    await MedicalRecord.collection.updateOne({ _id: record._id }, {
      $set: { authorDoctorId: record.authorDoctorId || record.doctorId, revision: record.revision || 1 },
      ...(privateNoteMigrated ? { $unset: { doctorNotes: "" } } : {}),
    });
  }

  const remainingLegacyNotes = await MedicalRecord.collection.countDocuments({ doctorNotes: { $exists: true, $ne: "" } });
  console.log(JSON.stringify({ checked, notesMigrated, skippedNotes, remainingLegacyNotes }));
  if (remainingLegacyNotes > 0) process.exitCode = 2;
} finally {
  await mongoose.disconnect();
}
