const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RuleLog = sequelize.define('RuleLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  screeningId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Screenings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  ruleId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  condition: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  action: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  firedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  inputSnapshot: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  outputSnapshot: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  executionOrder: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'RuleLogs',
  indexes: [
    {
      fields: ['screeningId']
    },
    {
      fields: ['ruleId']
    },
    {
      fields: ['firedAt']
    }
  ]
});

module.exports = RuleLog;