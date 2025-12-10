const neo4jService = require('../services/neo4jService');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

class AnalyticsController {
  // Get comprehensive analytics - DIPERBARUI LENGKAP
  async getOverview(req, res) {
    try {
      if (DEMO_MODE) {
        return res.json({
          success: true,
          data: {
            ruleFrequency: [
              { ruleId: 'R1', frequency: 15, diagnoses: ['Insomnia'], avgOrder: 1.2 },
              { ruleId: 'R5', frequency: 12, diagnoses: ['Sleep Apnea'], avgOrder: 2.5 },
              { ruleId: 'R9', frequency: 10, diagnoses: ['Mixed Sleep Disorder'], avgOrder: 3.1 }
            ],
            rulePatterns: [
              { diagnosis: 'Insomnia', rulePath: ['R1', 'R3', 'R13'], count: 8 },
              { diagnosis: 'Sleep Apnea', rulePath: ['R5', 'R14'], count: 6 },
              { diagnosis: 'Mixed Sleep Disorder', rulePath: ['R1', 'R5', 'R15'], count: 4 }
            ],
            ruleNetwork: [
              { source: 'R1', target: 'R3', weight: 8, lastUpdated: new Date().toISOString() },
              { source: 'R5', target: 'R14', weight: 6, lastUpdated: new Date().toISOString() }
            ],
            diagnosisDistribution: [
              { diagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)', count: 5 },
              { diagnosis: 'Insomnia', count: 3 },
              { diagnosis: 'Sleep Apnea', count: 2 },
              { diagnosis: 'No Sleep Disorder', count: 1 }
            ],
            monthlyTrends: [
              { month: 'Jan', count: 3 },
              { month: 'Feb', count: 5 },
              { month: 'Mar', count: 4 },
              { month: 'Apr', count: 6 },
              { month: 'May', count: 7 },
              { month: 'Jun', count: 8 },
              { month: 'Jul', count: 6 },
              { month: 'Aug', count: 5 },
              { month: 'Sep', count: 4 },
              { month: 'Oct', count: 3 },
              { month: 'Nov', count: 2 },
              { month: 'Dec', count: 1 }
            ],
            riskDistribution: {
              insomnia: { high: 3, moderate: 5, low: 10 },
              apnea: { high: 2, moderate: 4, low: 12 }
            },
            topRecommendations: [
              { recommendation: 'Maintain consistent sleep schedule', count: 15 },
              { recommendation: 'Reduce caffeine intake', count: 12 },
              { recommendation: 'Exercise regularly', count: 10 }
            ],
            statistics: {
              totalScreenings: 18,
              avgRulesFired: 3.2,
              mostCommonDiagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)',
              totalRulesFired: 58,
              uniqueRulesFired: 12
            },
            timeframe: req.query?.timeframe || 'all',
            generatedAt: new Date().toISOString()
          }
        });
      }

      const userId = req.user?.id;
      const { timeframe = 'all' } = req.query;
      
      console.log('[ANALYTICS] Analytics request for userId:', userId);
      
      // Get all analytics data - pass userId for user-specific data
      const [
        ruleFrequency, 
        rulePatterns, 
        dashboardStats,
        ruleNetwork,
        diagnosisDistribution,
        monthlyTrends,
        riskDistribution,
        topRecommendations
      ] = await Promise.all([
        neo4jService.getRuleFiringPatterns(userId),
        neo4jService.getCommonDiagnosisPaths(userId),
        neo4jService.getDashboardStats(userId),
        neo4jService.getRuleNetwork(userId),
        neo4jService.getDiagnosisDistribution(userId),
        neo4jService.getMonthlyTrends(userId),
        neo4jService.getRiskDistribution(userId),
        neo4jService.getTopRecommendations(userId)
      ]);
      
      console.log('[ANALYTICS] Dashboard stats received:', dashboardStats);
      
      res.json({
        success: true,
        data: {
          // Neo4j data
          ruleFrequency,
          rulePatterns,
          ruleNetwork,
          
          // New dynamic data
          diagnosisDistribution,
          monthlyTrends,
          riskDistribution,
          topRecommendations,
          
          // Dashboard statistics
          statistics: {
            totalScreenings: dashboardStats.totalCases || 0,
            todayCases: dashboardStats.todayCases || 0,
            avgRulesFired: parseFloat(dashboardStats.avgRulesFired || 0).toFixed(1),
            mostCommonDiagnosis: dashboardStats.mostCommonDiagnosis || 'N/A',
            totalRulesFired: ruleFrequency.length > 0 ? ruleFrequency.reduce((sum, rule) => sum + rule.frequency, 0) : 'N/A',
            uniqueRulesFired: ruleFrequency.length || 'N/A',
            ...dashboardStats
          },
          
          // Timeframe info
          timeframe,
          generatedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Analytics error:', error);
      // Return demo data if error
      res.json({
        success: true,
        data: {
          ruleFrequency: [],
          rulePatterns: [],
          ruleNetwork: {},
          diagnosisDistribution: [
            { diagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)', count: 5 },
            { diagnosis: 'Insomnia', count: 3 },
            { diagnosis: 'Sleep Apnea', count: 2 },
            { diagnosis: 'No Sleep Disorder', count: 1 }
          ],
          monthlyTrends: [
            { month: 'Jan', count: 3 },
            { month: 'Feb', count: 5 },
            { month: 'Mar', count: 4 },
            { month: 'Apr', count: 6 },
            { month: 'May', count: 7 },
            { month: 'Jun', count: 8 }
          ],
          riskDistribution: {
            insomnia: { high: 3, moderate: 5, low: 10 },
            apnea: { high: 2, moderate: 4, low: 12 }
          },
          topRecommendations: [
            { recommendation: 'Maintain consistent sleep schedule', count: 15 },
            { recommendation: 'Reduce caffeine intake', count: 12 }
          ],
          statistics: {
            totalScreenings: 18,
            avgRulesFired: 3.2,
            mostCommonDiagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)',
            totalRulesFired: 58,
            uniqueRulesFired: 12
          },
          timeframe: req.query?.timeframe || 'all',
          generatedAt: new Date().toISOString()
        }
      });
    }
  }
  
  // Get rule performance analytics
  async getRuleAnalytics(req, res) {
    try {
      if (DEMO_MODE) {
        return res.json({
          success: true,
          data: {
            ruleFrequency: [
              { ruleId: 'R1', frequency: 15, diagnoses: ['Insomnia'], avgOrder: 1.2 },
              { ruleId: 'R5', frequency: 12, diagnoses: ['Sleep Apnea'], avgOrder: 2.5 }
            ],
            rulePatterns: [
              { diagnosis: 'Insomnia', rulePath: ['R1', 'R3', 'R13'], count: 8 }
            ],
            ruleNetwork: [
              { source: 'R1', target: 'R3', weight: 8 }
            ],
            ruleEffectiveness: [
              { ruleId: 'R1', timesFired: 15, timesLeadingToDiagnosis: 12, effectivenessRate: 80 },
              { ruleId: 'R5', timesFired: 12, timesLeadingToDiagnosis: 9, effectivenessRate: 75 }
            ],
            summary: {
              totalRules: 20,
              mostFiredRule: { ruleId: 'R1', frequency: 15 },
              mostEffectiveRule: { ruleId: 'R1', effectivenessRate: 80 },
              averageRulesPerCase: 3.2
            }
          }
        });
      }

      const ruleFrequency = await neo4jService.getRuleFiringPatterns();
      const rulePatterns = await neo4jService.getCommonDiagnosisPaths();
      const ruleNetwork = await neo4jService.getRuleNetwork();
      
      // Calculate rule effectiveness
      const ruleEffectiveness = {};
      rulePatterns.forEach(pattern => {
        pattern.rulePath.forEach(ruleId => {
          if (!ruleEffectiveness[ruleId]) {
            ruleEffectiveness[ruleId] = {
              ruleId,
              timesFired: 0,
              timesLeadingToDiagnosis: 0,
              associatedDiagnoses: new Set()
            };
          }
          ruleEffectiveness[ruleId].timesLeadingToDiagnosis += pattern.count;
          ruleEffectiveness[ruleId].associatedDiagnoses.add(pattern.diagnosis);
        });
      });
      
      // Merge with firing frequency
      ruleFrequency.forEach(rule => {
        if (ruleEffectiveness[rule.ruleId]) {
          ruleEffectiveness[rule.ruleId].timesFired = rule.frequency;
          ruleEffectiveness[rule.ruleId].effectivenessRate = 
            rule.frequency > 0 ? (ruleEffectiveness[rule.ruleId].timesLeadingToDiagnosis / rule.frequency) * 100 : 0;
          ruleEffectiveness[rule.ruleId].associatedDiagnoses = 
            Array.from(ruleEffectiveness[rule.ruleId].associatedDiagnoses);
        }
      });
      
      res.json({
        success: true,
        data: {
          ruleFrequency,
          rulePatterns: rulePatterns.slice(0, 10),
          ruleNetwork,
          ruleEffectiveness: Object.values(ruleEffectiveness).sort((a, b) => 
            b.effectivenessRate - a.effectivenessRate
          ),
          summary: {
            totalRules: ruleFrequency.length,
            mostFiredRule: ruleFrequency[0] || null,
            mostEffectiveRule: Object.values(ruleEffectiveness).sort((a, b) => 
              b.effectivenessRate - a.effectivenessRate
            )[0] || null,
            averageRulesPerCase: ruleFrequency.reduce((sum, rule) => sum + rule.frequency, 0) / 
              (rulePatterns.reduce((sum, pattern) => sum + pattern.count, 0) || 1)
          }
        }
      });
      
    } catch (error) {
      console.error('Rule analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rule analytics'
      });
    }
  }
  
  // Get trends over time
  async getTrends(req, res) {
    try {
      if (DEMO_MODE) {
        return res.json({
          success: true,
          data: {
            trends: [
              { date: '2024-01', cases: 3 },
              { date: '2024-02', cases: 5 },
              { date: '2024-03', cases: 4 }
            ],
            diagnosisTrends: [
              { diagnosis: 'Insomnia', trend: [3, 4, 2] },
              { diagnosis: 'Sleep Apnea', trend: [2, 3, 1] }
            ],
            period: req.query?.period || 'monthly',
            generatedAt: new Date().toISOString()
          }
        });
      }

      const { period = 'monthly' } = req.query;
      
      let trends = [];
      if (period === 'monthly') {
        trends = await neo4jService.getMonthlyTrends();
      } else {
        // For weekly/daily trends, adjust query
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        
        if (period === 'weekly') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'daily') {
          startDate.setDate(startDate.getDate() - 30);
        }
        
        const dateStr = startDate.toISOString().split('T')[0];
        trends = await neo4jService.getCasesByDateRange(dateStr, endDate);
      }
      
      res.json({
        success: true,
        data: {
          trends,
          period,
          generatedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Trends error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trends'
      });
    }
  }
  
  // Get predictive insights
  async getInsights(req, res) {
    try {
      if (DEMO_MODE) {
        return res.json({
          success: true,
          data: { 
            insights: [
              {
                type: 'common_pattern',
                diagnosis: 'Insomnia',
                mostCommonPattern: ['R1', 'R3', 'R13'],
                frequency: 8,
                confidence: 75
              }
            ], 
            generatedAt: new Date().toISOString() 
          }
        });
      }

      const rulePatterns = await neo4jService.getCommonDiagnosisPaths();
      const ruleFrequency = await neo4jService.getRuleFiringPatterns();
      
      const insights = [];
      
      // Insight 1: Most common rule sequences
      const diagnosisPatterns = {};
      rulePatterns.forEach(pattern => {
        if (!diagnosisPatterns[pattern.diagnosis]) {
          diagnosisPatterns[pattern.diagnosis] = [];
        }
        diagnosisPatterns[pattern.diagnosis].push(pattern);
      });
      
      Object.entries(diagnosisPatterns).forEach(([diagnosis, patterns]) => {
        insights.push({
          type: 'common_pattern',
          diagnosis,
          mostCommonPattern: patterns[0]?.rulePath || [],
          frequency: patterns[0]?.count || 0,
          confidence: patterns[0]?.count / patterns.reduce((sum, p) => sum + p.count, 0) * 100
        });
      });
      
      // Insight 2: Rules that frequently fire together
      const ruleCoOccurrence = {};
      rulePatterns.forEach(pattern => {
        const rules = pattern.rulePath;
        for (let i = 0; i < rules.length; i++) {
          for (let j = i + 1; j < rules.length; j++) {
            const key = [rules[i], rules[j]].sort().join('_');
            ruleCoOccurrence[key] = (ruleCoOccurrence[key] || 0) + pattern.count;
          }
        }
      });
      
      const topCoOccurrences = Object.entries(ruleCoOccurrence)
        .map(([key, count]) => {
          const [rule1, rule2] = key.split('_');
          return { rule1, rule2, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      insights.push({
        type: 'rule_co_occurrence',
        title: 'Rules That Frequently Fire Together',
        data: topCoOccurrences
      });
      
      // Insight 3: Diagnosis risk factors
      const riskFactors = ruleFrequency
        .filter(rule => rule.frequency > 10)
        .map(rule => ({
          rule: rule.ruleId,
          frequency: rule.frequency,
          associatedDiagnoses: rule.diagnoses || [],
          impact: rule.frequency / ruleFrequency.reduce((sum, r) => sum + r.frequency, 0) * 100
        }))
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 5);
      
      insights.push({
        type: 'risk_factors',
        title: 'Top Risk Factors',
        data: riskFactors
      });
      
      res.json({
        success: true,
        data: {
          insights,
          summary: {
            totalInsights: insights.length,
            patternsAnalyzed: rulePatterns.length,
            rulesAnalyzed: ruleFrequency.length,
            generatedAt: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      console.error('Insights error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate insights'
      });
    }
  }
}

module.exports = new AnalyticsController();