const neo4jClient = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

const neo4jController = {
  // Test Neo4j connection
  async testConnection(req, res) {
    try {
      await neo4jClient.connect();
      const testResult = await neo4jClient.testConnection();
      
      if (testResult.success) {
        res.json({
          success: true,
          message: 'Neo4j connection successful',
          timestamp: new Date().toISOString(),
          neo4j: {
            uri: process.env.NEO4J_URI,
            database: process.env.NEO4J_DATABASE,
            status: 'connected'
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Neo4j connection test failed',
          details: testResult.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to connect to Neo4j',
        message: error.message
      });
    } finally {
      await neo4jClient.close();
    }
  },

  // Initialize database schema
  async initializeDatabase(req, res) {
    try {
      await neo4jClient.connect();
      const session = neo4jClient.driver.session({ database: process.env.NEO4J_DATABASE });
      
      try {
        // Create constraints and indexes
        await session.run(`
          CREATE CONSTRAINT person_id_unique IF NOT EXISTS 
          FOR (p:Person) REQUIRE p.person_id IS UNIQUE
        `);
        
        await session.run(`
          CREATE CONSTRAINT rule_id_unique IF NOT EXISTS 
          FOR (r:Rule) REQUIRE r.id IS UNIQUE
        `);
        
        await session.run(`
          CREATE CONSTRAINT disorder_code_unique IF NOT EXISTS 
          FOR (d:Sleep_Disorder) REQUIRE d.code IS UNIQUE
        `);
        
        await session.run(`
          CREATE CONSTRAINT recommendation_id_unique IF NOT EXISTS 
          FOR (r:Recommendation) REQUIRE r.id IS UNIQUE
        `);

        // Create sleep disorder nodes
        const disorders = [
          { code: 'INS', name: 'Insomnia', description: 'Difficulty falling or staying asleep' },
          { code: 'OSA', name: 'Obstructive Sleep Apnea', description: 'Breathing interruptions during sleep' },
          { code: 'MIX', name: 'Mixed Sleep Disorder', description: 'Combination of insomnia and sleep apnea' },
          { code: 'NONE', name: 'No Sleep Disorder', description: 'Healthy sleep patterns' }
        ];

        for (const disorder of disorders) {
          await session.run(`
            MERGE (d:Sleep_Disorder {code: $code})
            SET d.name = $name,
                d.description = $description,
                d.created_at = datetime()
          `, disorder);
        }

        // Create rule nodes
        const rules = [
          { id: 'R1', name: 'Insomnia High Risk', category: 'insomnia', source: 'AASM/Morin 2012' },
          { id: 'R2', name: 'Insomnia Moderate Risk', category: 'insomnia', source: 'AASM' },
          { id: 'R3', name: 'Insomnia Moderate Risk', category: 'insomnia', source: 'Insomnia literature' },
          { id: 'R4', name: 'Insomnia Low Risk', category: 'insomnia', source: 'AASM/WHO' },
          { id: 'R5', name: 'Apnea High Risk', category: 'apnea', source: 'AASM/OSA guideline' },
          { id: 'R6', name: 'Apnea Moderate Risk', category: 'apnea', source: 'OSA literature' },
          { id: 'R7', name: 'Apnea Moderate Risk', category: 'apnea', source: 'OSA literature' },
          { id: 'R8', name: 'Apnea Low Risk', category: 'apnea', source: 'Clinical baseline' },
          { id: 'R9', name: 'Low Activity Issue', category: 'lifestyle', source: 'WHO' },
          { id: 'R10', name: 'High Stress Issue', category: 'lifestyle', source: 'Psychology literature' },
          { id: 'R11', name: 'Short Sleep Issue', category: 'lifestyle', source: 'AASM/WHO' },
          { id: 'R12', name: 'Weight Issue', category: 'lifestyle', source: 'WHO' },
          { id: 'R13', name: 'Diagnosis: Insomnia', category: 'diagnosis', source: 'AASM' },
          { id: 'R14', name: 'Diagnosis: Apnea', category: 'diagnosis', source: 'AASM' },
          { id: 'R15', name: 'Diagnosis: Mixed', category: 'diagnosis', source: 'Clinical' },
          { id: 'R16', name: 'Diagnosis: None', category: 'diagnosis', source: 'Clinical' },
          { id: 'R17', name: 'Sleep Hygiene Rec', category: 'recommendation', source: 'AASM' },
          { id: 'R18', name: 'Physical Activity Rec', category: 'recommendation', source: 'WHO' },
          { id: 'R19', name: 'Stress Management Rec', category: 'recommendation', source: 'Psychology' },
          { id: 'R20', name: 'Weight + Apnea Eval Rec', category: 'recommendation', source: 'OSA guideline' }
        ];

        for (const rule of rules) {
          await session.run(`
            MERGE (r:Rule {id: $id})
            SET r.name = $name,
                r.category = $category,
                r.source = $source,
                r.created_at = datetime()
          `, rule);
        }

        // Create recommendation nodes
        const recommendations = [
          { 
            id: 'REC_SLEEP_HYGIENE', 
            name: 'Sleep Hygiene Improvement',
            description: 'Improve sleep habits and environment',
            category: 'lifestyle'
          },
          { 
            id: 'REC_PHYSICAL_ACTIVITY', 
            name: 'Increase Physical Activity',
            description: '≥150 minutes of moderate exercise per week',
            category: 'lifestyle'
          },
          { 
            id: 'REC_STRESS_MANAGEMENT', 
            name: 'Stress Management',
            description: 'Practice relaxation techniques',
            category: 'mental health'
          },
          { 
            id: 'REC_WEIGHT_MANAGEMENT', 
            name: 'Weight Management Program',
            description: 'Diet and exercise for weight control',
            category: 'medical'
          },
          { 
            id: 'REC_APNEA_EVAL', 
            name: 'Sleep Apnea Evaluation',
            description: 'Consult healthcare provider for sleep study',
            category: 'medical'
          }
        ];

        for (const rec of recommendations) {
          await session.run(`
            MERGE (r:Recommendation {id: $id})
            SET r.name = $name,
                r.description = $description,
                r.category = $category,
                r.created_at = datetime()
          `, rec);
        }

        res.json({
          success: true,
          message: 'Database initialized successfully',
          created: {
            disorders: disorders.length,
            rules: rules.length,
            recommendations: recommendations.length
          },
          timestamp: new Date().toISOString()
        });
      } finally {
        await session.close();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to initialize database',
        message: error.message
      });
    } finally {
      await neo4jClient.close();
    }
  },

  // Get case history
  async getCases(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      
      await neo4jClient.connect();
      const cases = await neo4jClient.getCaseHistory(limit);
      
      res.json({
        success: true,
        count: cases.length,
        total: cases.length, // In production, you'd get total count separately
        cases: cases.slice(offset, offset + limit),
        pagination: {
          limit,
          offset,
          hasMore: cases.length > offset + limit
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cases',
        message: error.message
      });
    } finally {
      await neo4jClient.close();
    }
  },

  // Get statistics
  async getStatistics(req, res) {
    try {
      await neo4jClient.connect();
      const session = neo4jClient.driver.session({ database: process.env.NEO4J_DATABASE });
      
      try {
        // Get diagnosis distribution
        const diagnosisResult = await session.run(`
          MATCH (p:Person)-[:HAS_SLEEP_DISORDER]->(d:Sleep_Disorder)
          RETURN d.code as diagnosis, count(p) as count
          ORDER BY count DESC
        `);

        // Get rule firing frequency
        const ruleResult = await session.run(`
          MATCH (p:Person)-[:TRIGGERED_RULE]->(r:Rule)
          RETURN r.id as rule, count(p) as frequency
          ORDER BY frequency DESC
          LIMIT 10
        `);

        // Get lifestyle issue frequency
        const lifestyleResult = await session.run(`
          MATCH (p:Person)
          RETURN 
            sum(CASE WHEN p.lifestyle_issue_sleep THEN 1 ELSE 0 END) as sleep_issues,
            sum(CASE WHEN p.lifestyle_issue_stress THEN 1 ELSE 0 END) as stress_issues,
            sum(CASE WHEN p.lifestyle_issue_activity THEN 1 ELSE 0 END) as activity_issues,
            sum(CASE WHEN p.lifestyle_issue_weight THEN 1 ELSE 0 END) as weight_issues
        `);

        // Get recommendation frequency
        const recResult = await session.run(`
          MATCH (p:Person)-[:LIFESTYLE_ISSUE]->(r:Recommendation)
          RETURN r.id as recommendation, count(p) as frequency
          ORDER BY frequency DESC
        `);

        // Get risk distribution
        const riskResult = await session.run(`
          MATCH (p:Person)
          RETURN 
            p.insomnia_risk as insomnia_risk,
            p.apnea_risk as apnea_risk,
            count(p) as count
          WHERE p.insomnia_risk IS NOT NULL OR p.apnea_risk IS NOT NULL
          ORDER BY count DESC
        `);

        // Get time-based statistics
        const timeResult = await session.run(`
          MATCH (p:Person)
          WHERE p.created_at IS NOT NULL
          RETURN 
            date(p.created_at) as date,
            count(p) as daily_cases
          ORDER BY date DESC
          LIMIT 30
        `);

        res.json({
          success: true,
          statistics: {
            diagnosisDistribution: diagnosisResult.records.map(r => ({
              diagnosis: r.get('diagnosis'),
              count: r.get('count').toNumber()
            })),
            topRules: ruleResult.records.map(r => ({
              rule: r.get('rule'),
              frequency: r.get('frequency').toNumber()
            })),
            lifestyleIssues: lifestyleResult.records[0] ? {
              sleep: lifestyleResult.records[0].get('sleep_issues').toNumber(),
              stress: lifestyleResult.records[0].get('stress_issues').toNumber(),
              activity: lifestyleResult.records[0].get('activity_issues').toNumber(),
              weight: lifestyleResult.records[0].get('weight_issues').toNumber()
            } : {},
            recommendationFrequency: recResult.records.map(r => ({
              recommendation: r.get('recommendation'),
              frequency: r.get('frequency').toNumber()
            })),
            riskDistribution: riskResult.records.map(r => ({
              insomnia_risk: r.get('insomnia_risk'),
              apnea_risk: r.get('apnea_risk'),
              count: r.get('count').toNumber()
            })),
            dailyCases: timeResult.records.map(r => ({
              date: r.get('date').toString(),
              cases: r.get('daily_cases').toNumber()
            }))
          },
          timestamp: new Date().toISOString()
        });
      } finally {
        await session.close();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve statistics',
        message: error.message
      });
    } finally {
      await neo4jClient.close();
    }
  },

  // Clear database (development only)
  async clearDatabase(req, res) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'This operation is not allowed in production'
      });
    }

    try {
      await neo4jClient.connect();
      const session = neo4jClient.driver.session({ database: process.env.NEO4J_DATABASE });
      
      try {
        await session.run('MATCH (n) DETACH DELETE n');
        
        res.json({
          success: true,
          message: 'Database cleared successfully',
          timestamp: new Date().toISOString()
        });
      } finally {
        await session.close();
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to clear database',
        message: error.message
      });
    } finally {
      await neo4jClient.close();
    }
  },

  // Get system health
  async getHealth(req, res) {
    try {
      const [neo4jStatus, memoryUsage, uptime] = await Promise.allSettled([
        this.testNeo4jHealth(),
        this.getMemoryUsage(),
        this.getUptime()
      ]);

      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {
          neo4j: neo4jStatus.status === 'fulfilled' ? neo4jStatus.value : { status: 'unhealthy', error: neo4jStatus.reason?.message },
          api: { status: 'healthy', uptime: uptime.status === 'fulfilled' ? uptime.value : 'unknown' },
          memory: memoryUsage.status === 'fulfilled' ? memoryUsage.value : { status: 'unknown' }
        },
        version: process.env.npm_package_version || '1.0.0'
      };

      // Overall status based on components
      if (neo4jStatus.status === 'rejected') {
        health.status = 'degraded';
        health.message = 'Neo4j connection issue';
      }

      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Helper methods
  async testNeo4jHealth() {
    await neo4jClient.connect();
    const result = await neo4jClient.testConnection();
    await neo4jClient.close();
    
    return {
      status: result.success ? 'healthy' : 'unhealthy',
      message: result.success ? 'Connected' : result.error,
      timestamp: new Date().toISOString()
    };
  },

  getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(used.external / 1024 / 1024)} MB`
    };
  },

  getUptime() {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
};

module.exports = neo4jController;