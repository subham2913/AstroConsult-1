// migration.js - Run this script once to update existing data
const mongoose = require('mongoose');
const Consultation = require('./models/Consultation'); // Adjust path as needed
const User = require('./models/User'); // Adjust path as needed

async function migrateExistingConsultations() {
  try {
    console.log('Starting consultation migration...');

    // Get all consultations that don't have createdBy field
    const consultationsToUpdate = await Consultation.find({ createdBy: { $exists: false } });
    
    console.log(`Found ${consultationsToUpdate.length} consultations to migrate`);

    for (const consultation of consultationsToUpdate) {
      let createdBy = null;

      // Strategy 1: If clientId exists and refers to a valid user, use that
      if (consultation.clientId) {
        const client = await User.findById(consultation.clientId);
        if (client) {
          createdBy = consultation.clientId;
        }
      }

      // Strategy 2: If no clientId or client doesn't exist, assign to first admin user
      if (!createdBy) {
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
          createdBy = adminUser._id;
          console.log(`Assigning consultation ${consultation._id} to admin ${adminUser.name}`);
        }
      }

      // Strategy 3: If no admin found, create a default system user
      if (!createdBy) {
        let systemUser = await User.findOne({ email: 'system@astroconsult.com' });
        if (!systemUser) {
          systemUser = await User.create({
            name: 'System User',
            email: 'system@astroconsult.com',
            password: 'temp123456', // Change this
            role: 'admin',
            isApproved: true,
            status: 'approved'
          });
          console.log('Created system user for orphaned consultations');
        }
        createdBy = systemUser._id;
      }

      // Update the consultation
      if (createdBy) {
        await Consultation.findByIdAndUpdate(consultation._id, { createdBy });
        console.log(`Updated consultation ${consultation._id} with createdBy: ${createdBy}`);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Connect to MongoDB and run migration
async function runMigration() {
  try {
    // Update this connection string to match your database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/astro-consult');
    console.log('Connected to MongoDB');
    
    await migrateExistingConsultations();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Run only if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateExistingConsultations };