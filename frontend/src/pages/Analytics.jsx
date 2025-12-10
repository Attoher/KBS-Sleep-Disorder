import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Calendar,
  Filter
} from 'lucide-react';
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../utils/api';
import Loader from '../components/Common/Loader';
import Button from '../components/Common/Button';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/overview?timeframe=${timeframe}`);
      setAnalytics(response.data.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Gagal memuat analytics. Coba refresh atau cek koneksi.');
      // Provide a safe fallback so the page renders instead of spinning forever
      setAnalytics({
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
        timeframe,
        generatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return <Loader fullScreen />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-400">
              Rule engine insights and pattern analysis from Neo4j
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <Button onClick={fetchAnalytics}>
              Refresh
            </Button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 rounded-2xl border border-blue-800/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total Screenings</p>
              <p className="text-3xl font-bold text-white">
                {analytics.statistics?.totalScreenings || 0}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-2xl border border-purple-800/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Active Rules</p>
              <p className="text-3xl font-bold text-white">20</p>
            </div>
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-900/30 to-green-900/10 rounded-2xl border border-green-800/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Avg Rules Fired</p>
              <p className="text-3xl font-bold text-white">
                {analytics.statistics?.avgRulesFired?.toFixed(1) || '0.0'}
              </p>
            </div>
            <Brain className="w-10 h-10 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-900/30 to-red-900/10 rounded-2xl border border-red-800/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Most Common</p>
              <p className="text-xl font-bold text-white">
                {analytics.statistics?.mostCommonDiagnosis || 'N/A'}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Diagnosis Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <PieChart className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Diagnosis Distribution</h2>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.diagnosisDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="diagnosis" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                  name="Number of Cases"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rule Frequency */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-white">Most Fired Rules</h2>
            </div>
            <div className="text-sm text-gray-400">
              Top 8 Rules
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.ruleFrequency?.slice(0, 8)} 
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="ruleId" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar 
                  dataKey="frequency" 
                  fill="#10b981" 
                  radius={[0, 4, 4, 0]}
                  name="Times Fired"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Monthly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Monthly Trends</h2>
          </div>
          <div className="text-sm text-gray-400">
            Last 12 Months
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Screenings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Rule Patterns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6"
      >
        <h2 className="text-xl font-bold text-white mb-6">Common Rule Patterns</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs uppercase bg-gray-700/50">
              <tr>
                <th className="px-6 py-3">Diagnosis</th>
                <th className="px-6 py-3">Rule Path</th>
                <th className="px-6 py-3">Frequency</th>
                <th className="px-6 py-3">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {analytics.rulePatterns?.slice(0, 5).map((pattern, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-white">{pattern.diagnosis}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {pattern.rulePath?.map((rule, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-700 rounded text-xs font-mono"
                        >
                          {rule}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">{pattern.count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(pattern.count * 10, 100)}%` }}
                        />
                      </div>
                      <span>{Math.min(pattern.count * 10, 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;