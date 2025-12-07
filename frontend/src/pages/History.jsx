import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  Search,
  BarChart3
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import api from '../utils/api';
import HistoryTable from '../components/History/HistoryTable';
import Loader from '../components/Common/Loader';
import Button from '../components/Common/Button';

const History = () => {
  const [loading, setLoading] = useState(true);
  const [screenings, setScreenings] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    diagnosis: '',
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/history?${params}`);
      setScreenings(response.data.data.screenings);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/screening/export?format=csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sleep-health-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading && !screenings.length) {
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
            <h1 className="text-3xl font-bold text-white">Screening History</h1>
            <p className="text-gray-400">
              View and manage all your sleep health screenings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => window.location.href = '/analytics'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-white">Filters</h3>
          </div>
          <button
            onClick={() => setFilters({
              search: '',
              diagnosis: '',
              startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
              endDate: format(new Date(), 'yyyy-MM-dd'),
              page: 1,
              limit: 10,
            })}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by diagnosis..."
                className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Diagnosis</label>
            <select
              value={filters.diagnosis}
              onChange={(e) => handleFilterChange('diagnosis', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Diagnoses</option>
              <option value="Insomnia">Insomnia</option>
              <option value="Sleep Apnea">Sleep Apnea</option>
              <option value="Mixed Sleep Disorder">Mixed Sleep Disorder</option>
              <option value="No Sleep Disorder">No Sleep Disorder</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">
            Showing {screenings.length} screenings
          </div>
          <button
            onClick={fetchHistory}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <Loader />
        ) : (
          <HistoryTable screenings={screenings} onRefresh={fetchHistory} />
        )}
      </motion.div>

      {/* Pagination */}
      {screenings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="text-sm text-gray-400">
            Page {filters.page} of {Math.ceil(screenings.length / filters.limit)}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={screenings.length < filters.limit}
            >
              Next
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default History;