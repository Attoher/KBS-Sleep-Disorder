const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Screening = sequelize.define('Screening', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  inputData: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Input data is required'
      }
    }
  },
  insomniaRisk: {
    type: DataTypes.ENUM('high', 'moderate', 'low', 'unknown'),
    defaultValue: 'unknown'
  },
  apneaRisk: {
    type: DataTypes.ENUM('high', 'moderate', 'low', 'unknown'),
    defaultValue: 'unknown'
  },
  diagnosis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recommendations: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  firedRules: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  lifestyleIssues: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  neo4jCaseId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  results: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'Screenings',
  indexes: [
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['diagnosis']
    }
  ]
});

// Instance method to get summary
Screening.prototype.getSummary = function() {
  return {
    id: this.id,
    diagnosis: this.diagnosis,
    insomniaRisk: this.insomniaRisk,
    apneaRisk: this.apneaRisk,
    createdAt: this.createdAt,
    recommendations: this.recommendations,
    firedRulesCount: this.firedRules ? this.firedRules.length : 0
  };
};

module.exports = Screening;