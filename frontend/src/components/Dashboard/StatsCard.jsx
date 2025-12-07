import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  color = 'blue',
  delay = 0 
}) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend}</span>
              <span className="text-gray-500 ml-2">{description}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;