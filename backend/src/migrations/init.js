const sequelize = require('../config/database');
const User = require('../models/User');
const Screening = require('../models/Screening');

async function initDatabase() {
  console.log('🔧 Starting database initialization...');
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synchronized');
    
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
    
    console.log('✅ Database indexes created');
    
    // Check if admin user exists, create if not
    const adminExists = await User.findOne({ where: { email: 'admin@sleephealth.com' } });
    
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@sleephealth.com',
        password: 'Admin@123',
        role: 'admin'
      });
      console.log('✅ Default admin user created');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run initialization if script is called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;