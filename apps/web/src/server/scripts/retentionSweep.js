import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import ClinicalNote from "../models/clinicalNote.model.js";
import MedicalRecord from "../models/medicalRecord.model.js";
import MedicalRecordRevision from "../models/medicalRecordRevision.model.js";

const deleteOrphans = async (collection) => {
  const cursor = collection.aggregate([
    { $lookup: { from: MedicalRecord.collection.name, localField: "medicalRecordId", foreignField: "_id", as: "record" } },
    { $match: { record: { $size: 0 } } },
    { $project: { _id: 1 } },
  ]);
  let deletedCount = 0;
  let batch = [];
  for await (const document of cursor) {
    batch.push(document._id);
    if (batch.length === 500) {
      const result = await collection.deleteMany({ _id: { $in: batch } });
      deletedCount += result.deletedCount;
      batch = [];
    }
  }
  if (batch.length) {
    const result = await collection.deleteMany({ _id: { $in: batch } });
    deletedCount += result.deletedCount;
  }
  return deletedCount;
};

try {
  await connectDB();
  const orphanNotesRemoved = await deleteOrphans(ClinicalNote.collection);
  const orphanRevisionsRemoved = await deleteOrphans(MedicalRecordRevision.collection);
  const retentionDays = Number(process.env.MEDICAL_RECORD_RETENTION_DAYS || 2555);
  if (!Number.isFinite(retentionDays) || retentionDays < 365) throw new Error("MEDICAL_RECORD_RETENTION_DAYS must be at least 365");
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const agedRecordsRequiringRetentionReview = await MedicalRecord.collection.countDocuments({ createdAt: { $lt: cutoff } });
  console.log(JSON.stringify({ orphanNotesRemoved, orphanRevisionsRemoved, agedRecordsRequiringRetentionReview, retentionDays }));
} finally {
  await mongoose.disconnect();
}
