const mongoose = require('mongoose');
const User = require('../models/User');
const Workout = require('../models/Workout');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness_tracker';

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node migrate_workouts_set_user.js <user-email-or-id>');
    process.exit(1);
  }

  let user = null;
  // try find by id first
  try {
    user = await User.findById(arg);
  } catch (e) {
    // ignore
  }
  if (!user) {
    user = await User.findOne({ email: arg.toLowerCase() });
  }
  if (!user) {
    console.error('User not found for:', arg);
    process.exit(1);
  }

  const res = await Workout.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
  console.log(`Updated ${res.modifiedCount || res.nModified || 0} workouts to user ${user.email} (${user._id})`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
