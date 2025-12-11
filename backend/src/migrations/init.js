const sequelize = require('../config/database');
const sqliteDb = require('../config/sqlite');
const User = require('../models/User');
const Screening = require('../models/Screening');

async function initDatabase() {
  console.log('[SETUP] Starting database initialization...');

  try {
    // Test PostgreSQL connection
    await sequelize.authenticate();
    console.log('[SUCCESS] PostgreSQL connection established');

    // Create Users table in PostgreSQL first (required for Screenings foreign key)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        "id" UUID PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "age" INTEGER,
        "gender" VARCHAR(10),
        "role" VARCHAR(20) DEFAULT 'user',
        "isActive" BOOLEAN DEFAULT true,
        "lastLogin" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('[SUCCESS] Users table created in PostgreSQL');

    // Sync Screening model (creates Screenings table)
    await Screening.sync({ force: false, alter: true });
    console.log('[SUCCESS] Screenings table synchronized');

    // Also sync SQLite for User model (local auth storage)
    await sqliteDb.sync({ force: false });
    console.log('[SUCCESS] SQLite database synchronized');

    // Create indexes
    await sequelize.query(`
      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON "Users" (email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON "Users" ("createdAt");
      
      CREATE INDEX IF NOT EXISTS idx_screenings_user_id ON "Screenings" ("userId");
      CREATE INDEX IF NOT EXISTS idx_screenings_created_at ON "Screenings" ("createdAt" DESC);
      CREATE INDEX IF NOT EXISTS idx_screenings_diagnosis ON "Screenings" (diagnosis);
      CREATE INDEX IF NOT EXISTS idx_screenings_insomnia_risk ON "Screenings" ("insomniaRisk");
      CREATE INDEX IF NOT EXISTS idx_screenings_apnea_risk ON "Screenings" ("apneaRisk");
    `);

    console.log('[SUCCESS] Database indexes created');

    // Check if admin user exists, create if not
    const adminExists = await User.findOne({ where: { email: 'admin@sleephealth.com' } });

    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@sleephealth.com',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('[SUCCESS] Default admin user created');
    }

    console.log('[COMPLETE] Database initialization completed successfully!');

  } catch (error) {
    console.error('[ERROR] Database initialization failed:', error);
    throw error;
  }
}

// Run initialization if script is called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('[SUCCESS] Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[ERROR] Migration failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;