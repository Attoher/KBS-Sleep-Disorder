const { Screening, User } = require('../models');
const { Op } = require('sequelize');

class HistoryController {
  // Get detailed history with filters
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        search,
        diagnosis,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;
      
      // Build where clause
      const where = { userId };
      
      // Search by diagnosis or notes
      if (search) {
        where[Op.or] = [
          { diagnosis: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Filter by diagnosis
      if (diagnosis) {
        where.diagnosis = diagnosis;
      }
      
      // Filter by date range
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }
      
      // Calculate pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Get screenings
      const { count, rows: screenings } = await Screening.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [{
          model: User,
          attributes: ['name', 'email']
        }]
      });
      
      // Get statistics
      const statistics = await this.getHistoryStatistics(userId, where);
      
      res.json({
        success: true,
        data: {
          screenings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit))
          },
          statistics
        }
      });
      
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch history'
      });
    }
  }
  
  // Get history statistics
  async getHistoryStatistics(userId, where = {}) {
    try {
      const totalScreenings = await Screening.count({ where: { ...where, userId } });
      
      // Diagnosis distribution
      const diagnosisDistribution = await Screening.findAll({
        where: { ...where, userId },
        attributes: [
          'diagnosis',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['diagnosis'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });
      
      // Risk level distribution
      const riskDistribution = await Screening.findAll({
        where: { ...where, userId },
        attributes: [
          'insomniaRisk',
          'apneaRisk',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['insomniaRisk', 'apneaRisk']
      });
      
      // Monthly trend
      const monthlyTrend = await Screening.findAll({
        where: { ...where, userId },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
        limit: 12
      });
      
      // Most common recommendations
      const allScreenings = await Screening.findAll({
        where: { ...where, userId },
        attributes: ['recommendations']
      });
      
      const recommendationCounts = {};
      allScreenings.forEach(screening => {
        (screening.recommendations || []).forEach(rec => {
          recommendationCounts[rec] = (recommendationCounts[rec] || 0) + 1;
        });
      });
      
      const topRecommendations = Object.entries(recommendationCounts)
        .map(([rec, count]) => ({ recommendation: rec, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      return {
        totalScreenings,
        diagnosisDistribution,
        riskDistribution,
        monthlyTrend,
        topRecommendations,
        mostCommonDiagnosis: diagnosisDistribution[0]?.diagnosis || 'N/A'
      };
    } catch (error) {
      console.error('Get statistics error:', error);
      return {};
    }
  }
  
  // Get screening analytics
  async getAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const statistics = await this.getHistoryStatistics(userId);
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  }
  
  // Add notes to screening
  async addNotes(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const userId = req.user.id;
      
      const screening = await Screening.findOne({ where: { id, userId } });
      
      if (!screening) {
        return res.status(404).json({
          success: false,
          error: 'Screening not found'
        });
      }
      
      screening.notes = notes;
      await screening.save();
      
      res.json({
        success: true,
        message: 'Notes added successfully',
        data: screening
      });
      
    } catch (error) {
      console.error('Add notes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add notes'
      });
    }
  }
  
  // Archive screening
  async archiveScreening(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const screening = await Screening.findOne({ where: { id, userId } });
      
      if (!screening) {
        return res.status(404).json({
          success: false,
          error: 'Screening not found'
        });
      }
      
      screening.isArchived = true;
      await screening.save();
      
      res.json({
        success: true,
        message: 'Screening archived successfully'
      });
      
    } catch (error) {
      console.error('Archive screening error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to archive screening'
      });
    }
  }
  
  // Unarchive screening
  async unarchiveScreening(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const screening = await Screening.findOne({ where: { id, userId } });
      
      if (!screening) {
        return res.status(404).json({
          success: false,
          error: 'Screening not found'
        });
      }
      
      screening.isArchived = false;
      await screening.save();
      
      res.json({
        success: true,
        message: 'Screening unarchived successfully'
      });
      
    } catch (error) {
      console.error('Unarchive screening error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unarchive screening'
      });
    }
  }
  
  // Get archived screenings
  async getArchived(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const { count, rows: screenings } = await Screening.findAndCountAll({
        where: { userId, isArchived: true },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: {
          screenings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
      
    } catch (error) {
      console.error('Get archived error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch archived screenings'
      });
    }
  }
}

module.exports = new HistoryController();