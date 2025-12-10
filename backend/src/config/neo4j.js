const neo4j = require('neo4j-driver');
const dotenv = require('dotenv');

dotenv.config();

// Create Neo4j driver
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'kbsPassword123'
  ),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
    disableLosslessIntegers: true
  }
);

// Initialize Neo4j schema
async function initNeo4jSchema() {
  const session = driver.session();
  
  try {
    console.log('[SETUP] Initializing Neo4j schema...');
    
    // Create constraints for uniqueness
    await session.executeWrite(async tx => {
      await tx.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (p:Person) 
        REQUIRE p.personId IS UNIQUE
      `);
      
      await tx.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (c:Case) 
        REQUIRE c.caseId IS UNIQUE
      `);
      
      await tx.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (r:Rule) 
        REQUIRE r.ruleId IS UNIQUE
      `);
      
      await tx.run(`
        CREATE CONSTRAINT IF NOT EXISTS FOR (d:Diagnosis) 
        REQUIRE d.name IS UNIQUE
      `);
    });
    
    // Create indexes for performance
    await session.executeWrite(async tx => {
      await tx.run(`
        CREATE INDEX IF NOT EXISTS FOR (p:Person) ON (p.createdAt)
      `);
      
      await tx.run(`
        CREATE INDEX IF NOT EXISTS FOR (c:Case) ON (c.timestamp)
      `);
      
      await tx.run(`
        CREATE INDEX IF NOT EXISTS FOR (c:Case) ON (c.diagnosis)
      `);
    });
    
    console.log('[SUCCESS] Neo4j schema initialized successfully');
  } catch (error) {
    console.error('[ERROR] Neo4j schema initialization failed:', error);
    throw error;
  } finally {
    await session.close();
  }
}

// Test connection
async function testNeo4jConnection() {
  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 as connection_test');
    console.log('[SUCCESS] Neo4j connection established successfully');
    return true;
  } catch (error) {
    console.error('[ERROR] Neo4j connection failed:', error);
    return false;
  } finally {
    await session.close();
  }
}

// Close driver connection
async function closeNeo4jDriver() {
  await driver.close();
  console.log('[SUCCESS] Neo4j driver closed');
}

module.exports = {
  driver,
  initNeo4jSchema,
  testNeo4jConnection,
  closeNeo4jDriver
};