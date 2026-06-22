require('dotenv').config();
const mongoose = require('mongoose');

const cleanup = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
    console.log(`Cleared: ${col.name}`);
  }

  console.log('All demo data cleared. Database is ready for fresh data.');
  await mongoose.connection.close();
  process.exit(0);
};

cleanup().catch((err) => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
