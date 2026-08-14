import '../config/env.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

const BATCH = 'legacy-seed-synthetic-2026-08-03';
const marker = { isSynthetic: true, seedBatch: BATCH };

const ids = async (collection, filter) => (await collection.find(filter, { projection: { _id: 1 } }).toArray()).map(({ _id }) => _id);

const tag = async () => {
  const target = new URL(process.env.MONGO_URI);
  if (!['127.0.0.1', 'localhost'].includes(target.hostname) || process.env.TAG_LEGACY_SYNTHETIC !== 'true') {
    throw new Error('Refusing to tag data. This migration requires local MongoDB and TAG_LEGACY_SYNTHETIC=true.');
  }

  await connectDB();
  const db = mongoose.connection;
  const users = db.collection('users');
  const seedUserFilter = {
    $or: [
      { email: /@seed\.curevo\.com$/i },
      { email: 'admin.seed@curevo.com' },
    ],
  };
  const userIds = await ids(users, seedUserFilter);
  if (userIds.length !== 251) {
    throw new Error(`Expected exactly 251 legacy seed users; found ${userIds.length}. No records were changed.`);
  }

  const doctors = db.collection('doctors');
  const doctorIds = await ids(doctors, { userId: { $in: userIds } });
  const clinicIds = [...new Set((await doctors.find({ _id: { $in: doctorIds } }, { projection: { clinicId: 1 } }).toArray()).map(({ clinicId }) => clinicId.toString()))]
    .map((id) => new mongoose.Types.ObjectId(id));
  const appointments = db.collection('appointments');
  const appointmentFilter = { $or: [{ patientId: { $in: userIds } }, { doctorId: { $in: doctorIds } }] };
  const appointmentIds = await ids(appointments, appointmentFilter);

  const operations = [
    users.updateMany(seedUserFilter, { $set: marker }),
    db.collection('clinics').updateMany({ _id: { $in: clinicIds } }, { $set: marker }),
    doctors.updateMany({ _id: { $in: doctorIds } }, { $set: marker }),
    appointments.updateMany(appointmentFilter, { $set: marker }),
    db.collection('queues').updateMany({ doctorId: { $in: doctorIds } }, { $set: marker }),
    db.collection('medicalrecords').updateMany({ $or: [{ patientId: { $in: userIds } }, { doctorId: { $in: doctorIds } }, { appointmentId: { $in: appointmentIds } }] }, { $set: marker }),
    db.collection('reviews').updateMany({ $or: [{ patientId: { $in: userIds } }, { doctorId: { $in: doctorIds } }] }, { $set: marker }),
    db.collection('clinicreviews').updateMany({ $or: [{ patientId: { $in: userIds } }, { clinicId: { $in: clinicIds } }] }, { $set: marker }),
    db.collection('feedbacks').updateMany({ userId: { $in: userIds } }, { $set: marker }),
    db.collection('notifications').updateMany({ $or: [{ userId: { $in: userIds } }, { appointmentId: { $in: appointmentIds } }] }, { $set: marker }),
    db.collection('consents').updateMany({ userId: { $in: userIds } }, { $set: marker }),
    db.collection('privacyrequests').updateMany({ userId: { $in: userIds } }, { $set: marker }),
  ];

  const results = await Promise.all(operations);
  console.table(results.map((result, index) => ({ operation: index + 1, matched: result.matchedCount, changed: result.modifiedCount })));
  console.log(`Tagged exact legacy seed graph as ${BATCH}; unrelated accounts were not modified.`);
};

tag()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
