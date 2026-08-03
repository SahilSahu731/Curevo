import '../config/env.js';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

const collections = [
  'users', 'clinics', 'doctors', 'appointments', 'queues', 'medicalrecords',
  'reviews', 'clinicreviews', 'feedbacks', 'notifications', 'consents', 'privacyrequests',
];

const audit = async () => {
  await connectDB();
  const report = {};
  for (const name of collections) {
    const collection = mongoose.connection.collection(name);
    const [total, synthetic, unmarked] = await Promise.all([
      collection.countDocuments(),
      collection.countDocuments({ isSynthetic: true }),
      collection.countDocuments({ isSynthetic: { $ne: true } }),
    ]);
    report[name] = { total, synthetic, unmarked };
  }

  const userDomains = await mongoose.connection.collection('users').aggregate([
    { $project: { domain: { $arrayElemAt: [{ $split: ['$email', '@'] }, 1] }, isSynthetic: 1 } },
    { $group: { _id: { domain: '$domain', isSynthetic: '$isSynthetic' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  console.table(report);
  console.log('User-domain summary (no addresses):');
  console.table(userDomains.map((row) => ({ domain: row._id.domain, synthetic: row._id.isSynthetic === true, count: row.count })));
  console.log('Unmarked does not mean real. It means provenance has not been established and requires review.');
};

audit()
  .catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
