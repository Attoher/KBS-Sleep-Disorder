const neo4jService = require('../services/neo4jService');
const { Screening } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

class AnalyticsController {
  // Get comprehensive analytics
  async getOverview(req, res) {
    try {
      if (DEMO_MODE) {
        return res.json({
          success: true,
          data: {
            ruleFrequency: [],
            rulePatterns: [],
            ruleNetwork: {},
            diagnosisDistribution: [],
            monthlyTrends: [],
            riskDistribution: [],
            topRecommendations: [],
            statistics: {
              totalScreenings: 0,
              avgRulesFired: 0,
              mostCommonDiagnosis: 'N/A',
              totalRulesFired: 0,
              uniqueRulesFired: 0
            },
            timeframe: req.query?.timeframe || 'all',
            generatedAt: new Date().toISOString()
          }
        });
      }

      const userId = req.user?.id;
      const { timeframe = 'all' } = req.query;
      
      // Calculate date range based on timeframe
      let dateFilter = {};
      const now = new Date();
      
      switch (timeframe) {
        case 'today':
          dateFilter = {
            createdAt: {
              [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            }
          };
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFilter = { createdAt: { [Op.gte]: weekAgo } };
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateFilter = { createdAt: { [Op.gte]: monthAgo } };
          break;
        case 'year':
          const yearAgo = new Date();
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          dateFilter = { createdAt: { [Op.gte]: yearAgo } };
          break;
      }
      
      // Get Neo4j analytics
      const [ruleFrequency, rulePatterns, dashboardStats, ruleNetwork] = await Promise.all([
        neo4jService.getRuleFiringPatterns(),
        neo4jService.getCommonDiagnosisPaths(),
        neo4jService.getDashboardStats(),
        neo4jService.getRuleNetwork()
      ]);
      
      // Get PostgreSQL analytics
      const whereClause = userId ? { userId, ...dateFilter } : dateFilter;
      
      const [
        diagnosisDistribution,
        monthlyTrends,
        totalScreenings,
        avgRulesFired
      ] = await Promise.all([
        // Diagnosis distribution
        Screening.findAll({
          where: whereClause,
          attributes: [
            'diagnosis',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['diagnosis'],
          order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        }),
        
        // Monthly trends
        Screening.findAll({
          where: whereClause,
          attributes: [
            [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
          order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
          limit: 12
        }),
        
        // Total screenings
        Screening.count({ where: whereClause }),
        
        // Average rules fired
        Screening.findAll({
          where: whereClause,
          attributes: [
            [sequelize.fn('AVG', sequelize.fn('jsonb_array_length', sequelize.col('firedRules'))), 'avgRules']
          ]
        })
      ]);
      
      // Calculate risk distribution
      const riskDistribution = await Screening.findAll({
        where: whereClause,
        attributes: [
          'insomniaRisk',
          'apneaRisk',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['insomniaRisk', 'apneaRisk']
      });
      
      // Calculate recommendation frequency
      const allScreenings = await Screening.findAll({
        where: whereClause,
        attributes: ['recommendations']
      });
      
      const recommendationFrequency = {};
      allScreenings.forEach(screening => {
        (screening.recommendations || []).forEach(rec => {
          recommendationFrequency[rec] = (recommendationFrequency[rec] || 0) + 1;
        });
      });
      
      const topRecommendations = Object.entries(recommendationFrequency)
        .map(([rec, count]) => ({ recommendation: rec, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      res.json({
        success: true,
        data: {
          // Neo4j data
          ruleFrequency,
          rulePatterns: rulePatterns.slice(0, 15),
          ruleNetwork,
          
          // PostgreSQL data
          diagnosisDistribution,
          monthlyTrends: monthlyTrends.map(item => ({
            month: item.get('month'),
            count: item.get('count')
          })),
          riskDistribution,
          topRecommendations,
          
          // Combined statistics
          statistics: {
            totalScreenings,
            avgRulesFired: avgRulesFired[0]?.get('avgRules') || 0,
            mostCommonDiagnosis: diagnosisDistribution[0]?.diagnosis || 'N/A',
            totalRulesFired: ruleFrequency.reduce((sum, rule) => sum + rule.frequency, 0),
            uniqueRulesFired: ruleFrequency.length,
            ...dashboardStats
          },
          
          // Timeframe info
          timeframe,
          generatedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
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
            ruleFrequency: [],
            rulePatterns: [],
            ruleNetwork: {},
            ruleEffectiveness: [],
            summary: {
              totalRules: 0,
              mostFiredRule: null,
              mostEffectiveRule: null,
              averageRulesPerCase: 0
            }
          }
        });
      }

      const ruleFrequency = await neo4jService.getRuleFiringPatterns();
      const rulePatterns = await neo4jService.getCommonDiagnosisPaths();
      const ruleNetwork = await neo4jService.getRuleNetwork();
      
      // Calculate rule effectiveness (how often rules lead to diagnosis)
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
            (ruleEffectiveness[rule.ruleId].timesLeadingToDiagnosis / rule.frequency) * 100;
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
            mostFiredRule: ruleFrequency[0],
            mostEffectiveRule: Object.values(ruleEffectiveness).sort((a, b) => 
              b.effectivenessRate - a.effectivenessRate
            )[0],
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
            trends: [],
            diagnosisTrends: [],
            period: req.query?.period || 'monthly',
            generatedAt: new Date().toISOString()
          }
        });
      }

      const { period = 'monthly', limit = 12 } = req.query;
      const userId = req.user?.id;
      
      let dateTrunc = 'month';
      switch (period) {
        case 'daily':
          dateTrunc = 'day';
          break;
        case 'weekly':
          dateTrunc = 'week';
          break;
        case 'monthly':
          dateTrunc = 'month';
          break;
        case 'yearly':
          dateTrunc = 'year';
          break;
      }
      
      const whereClause = userId ? { userId } : {};
      
      // Get trend data
      const trends = await Screening.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('DATE_TRUNC', dateTrunc, sequelize.col('createdAt')), 'period'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCases'],
          [sequelize.fn('AVG', sequelize.fn('jsonb_array_length', sequelize.col('firedRules'))), 'avgRulesFired']
        ],
        group: [sequelize.fn('DATE_TRUNC', dateTrunc, sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', dateTrunc, sequelize.col('createdAt')), 'ASC']],
        limit: parseInt(limit)
      });
      
      // Get diagnosis trends
      const diagnosisTrends = await Screening.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('DATE_TRUNC', dateTrunc, sequelize.col('createdAt')), 'period'],
          'diagnosis',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [
          sequelize.fn('DATE_TRUNC', dateTrunc, sequelize.col('createdAt')),
          'diagnosis'
        ],
        order: [
          [sequelize.fn('DATE_TRUNC', dateTrunc, sequelize.col('createdAt')), 'ASC'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'DESC']
        ],
        limit: parseInt(limit) * 5
      });
      
      res.json({
        success: true,
        data: {
          trends: trends.map(item => ({
            period: item.get('period'),
            totalCases: item.get('totalCases'),
            avgRulesFired: parseFloat(item.get('avgRulesFired') || 0)
          })),
          diagnosisTrends,
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
          data: { insights: [], generatedAt: new Date().toISOString() }
        });
      }

      // Get common patterns
      const rulePatterns = await neo4jService.getCommonDiagnosisPaths();
      const ruleFrequency = await neo4jService.getRuleFiringPatterns();
      
      // Analyze patterns for insights
      const insights = [];
      
      // Insight 1: Most common rule sequences for each diagnosis
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
          confidence: (patterns[0]?.count / patterns.reduce((sum, p) => sum + p.count, 0)) * 100
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