import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Stethoscope,
  TrendingUp,
  Activity,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentScreenings from '../components/Dashboard/RecentScreenings';
import Loader from '../components/Common/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentScreenings: [],
    analytics: null
  });
  const [dynamicStats, setDynamicStats] = useState({
    weekGrowth: 0,
    todayNew: 0,
    totalAll: 0,
    avgRulesFired: 0,
    mostCommonDiagnosis: 'N/A'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateDynamicStats = (screenings, analytics) => {
    if (!screenings || screenings.length === 0) {
      return {
        weekGrowth: 0,
        todayNew: 0,
        totalAll: analytics?.statistics?.totalScreenings || 0,
        avgRulesFired: analytics?.statistics?.avgRulesFired || 0,
        mostCommonDiagnosis: analytics?.statistics?.mostCommonDiagnosis || 'N/A'
      };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count today's screenings
    const todayScreenings = screenings.filter(s => {
      const dateStr = s.timestamp || s.createdAt || s.readableTimestamp;
      if (dateStr) {
        const screeningDate = new Date(dateStr);
        return screeningDate >= todayStart;
      }
      return false;
    }).length;

    // Count this week's screenings
    const weekScreenings = screenings.filter(s => {
      const dateStr = s.timestamp || s.createdAt || s.readableTimestamp;
      if (dateStr) {
        const screeningDate = new Date(dateStr);
        return screeningDate >= weekStart;
      }
      return false;
    }).length;

    // Calculate week growth percentage
    const lastWeekScreenings = screenings.filter(s => {
      const dateStr = s.timestamp || s.createdAt || s.readableTimestamp;
      if (dateStr) {
        const screeningDate = new Date(dateStr);
        return screeningDate >= new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000) && 
               screeningDate < weekStart;
      }
      return false;
    }).length;

    const weekGrowth = lastWeekScreenings > 0 
      ? Math.round(((weekScreenings - lastWeekScreenings) / lastWeekScreenings) * 100)
      : (weekScreenings > 0 ? 100 : 0);

    return {
      weekGrowth,
      todayNew: todayScreenings,
      totalAll: analytics?.statistics?.totalScreenings || screenings.length,
      avgRulesFired: analytics?.statistics?.avgRulesFired || 0,
      mostCommonDiagnosis: analytics?.statistics?.mostCommonDiagnosis || 'N/A'
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data first (includes statistics)
      const analyticsResponse = await api.get('/analytics/overview?timeframe=today');
      const analytics = analyticsResponse.data.data;
      
      // Fetch all screenings for accurate stats calculation
      const screeningsResponse = await api.get('/history');
      const screenings = screeningsResponse.data.data.screenings || [];
      
      // Calculate dynamic stats from analytics
      const stats = calculateDynamicStats(screenings, analytics);
      
      setDynamicStats(stats);
      setDashboardData({
        stats: analytics.statistics,
        recentScreenings: screenings.slice(0, 5), // Show only 5 most recent
        analytics: analytics
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set fallback data
      setDynamicStats({
        weekGrowth: 0,
        todayNew: 0,
        totalAll: 0,
        avgRulesFired: 0,
        mostCommonDiagnosis: 'N/A'
      });
      setDashboardData({
        stats: {
          totalScreenings: 0,
          avgRulesFired: 0,
          mostCommonDiagnosis: 'N/A'
        },
        recentScreenings: [],
        analytics: null
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData.recentScreenings.length) {
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
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">
              Welcome back! Here's your sleep health overview
            </p>
          </div>
          <div className="text-sm text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - SEMUA DINAMIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Screenings"
          value={dynamicStats.totalAll}
          icon={Stethoscope}
          trend={dynamicStats.weekGrowth > 0 ? `+${dynamicStats.weekGrowth}%` : (dynamicStats.weekGrowth < 0 ? `${dynamicStats.weekGrowth}%` : '')}
          description={dynamicStats.weekGrowth !== 0 ? 'from last week' : 'total screenings'}
          color="blue"
          delay={0.1}
        />
        
        <StatsCard
          title="Today's Cases"
          value={dynamicStats.todayNew}
          icon={Users}
          trend=""
          description={dynamicStats.todayNew === 1 ? 'case today' : 'cases today'}
          color="purple"
          delay={0.2}
        />
        
        <StatsCard
          title="Most Common"
          value={dynamicStats.mostCommonDiagnosis}
          icon={TrendingUp}
          trend=""
          description="diagnosis"
          color="green"
          delay={0.3}
        />
        
        <StatsCard
          title="Avg. Rules Fired"
          value={dynamicStats.avgRulesFired}
          icon={Activity}
          trend=""
          description="per case"
          color="red"
          delay={0.4}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Screenings */}
        <div className="lg:col-span-2">
          <RecentScreenings screenings={dashboardData.recentScreenings} />
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/screening'}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white hover:opacity-90 transition-opacity flex items-center justify-between"
              >
                <span className="font-medium">New Screening</span>
                <Stethoscope className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => window.location.href = '/history'}
                className="w-full p-4 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">View History</span>
                <Calendar className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => window.location.href = '/analytics'}
                className="w-full p-4 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Analytics</span>
                <TrendingUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">API Server</span>
                </div>
                <span className="text-green-400 text-sm">Online</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">PostgreSQL</span>
                </div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Neo4j Graph</span>
                </div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">Rule Engine</span>
                </div>
                <span className="text-green-400 text-sm">Active (20 rules)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;