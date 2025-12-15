import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Button from '../Common/Button';
import { useTheme } from '../../contexts/ThemeContext';

const HistoryTable = ({ screenings, onRefresh, onDownloadReport }) => {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  // Helper function to safely format dates
  const formatDate = (dateValue, formatString) => {
    if (!dateValue) return 'N/A';

    try {
      const date = new Date(dateValue);
      if (!isValid(date)) return 'N/A';
      return format(date, formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const handleExport = async (screening) => {
    try {
      if (onDownloadReport) {
        // Use parent component's download function
        onDownloadReport(screening);
        toast.success('Report downloaded successfully');
      } else {
        // Fallback: try API call
        const response = await api.get(`/screening/export?id=${screening.screeningId}`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `screening-${screening.screeningId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success('Report downloaded successfully');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const handleDelete = async (screeningId) => {
    if (!window.confirm('Are you sure you want to delete this screening?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/screening/${screeningId}`);
      toast.success('Screening deleted successfully');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete screening');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDiagnosisIcon = (diagnosis) => {
    if (diagnosis.includes('No Sleep')) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  };

  if (!screenings || screenings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-400">No screening history found</p>
        <p className="text-sm text-gray-500 mt-1">Start your first screening to see history here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700/50">
      <table className="min-w-full divide-y divide-gray-700/50">
        <thead className="bg-gray-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Diagnosis
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Risk Levels
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Recommendations
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/50 bg-gray-900/30">
          {screenings.map((screening) => (
            <tr
              key={screening.screeningId || screening.id}
              className={`transition-colors ${theme === 'light'
                  ? 'hover:bg-purple-100/50'
                  : 'hover:bg-purple-500/10'
                }`}
              style={theme === 'light' ? { backgroundColor: '#F5F2FA' } : {}}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: theme === 'light' ? '#7C3AED' : '#9CA3AF' }} />
                  <div>
                    <div className={`text-sm ${theme === 'light' ? 'font-semibold' : ''}`} style={{ color: theme === 'light' ? '#5B21B6' : '#FFFFFF' }}>
                      {formatDate(screening.timestamp || screening.createdAt || screening.readableTimestamp, 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs flex items-center" style={{ color: theme === 'light' ? '#7C3AED' : '#9CA3AF' }}>
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(screening.timestamp || screening.createdAt || screening.readableTimestamp, 'h:mm a')}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  {getDiagnosisIcon(screening.diagnosis)}
                  <span className="text-sm font-medium" style={{ color: theme === 'light' ? '#5B21B6' : '#FFFFFF' }}>
                    {screening.diagnosis}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(screening.insomniaRisk)}`}>
                    Insomnia: {screening.insomniaRisk}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(screening.apneaRisk)}`}>
                    Apnea: {screening.apneaRisk}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {screening.recommendations?.slice(0, 2).map((rec, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs"
                    >
                      {rec.replace('REC_', '').replace('_', ' ')}
                    </span>
                  ))}
                  {screening.recommendations?.length > 2 && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                      +{screening.recommendations.length - 2} more
                    </span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => window.location.href = `/results?id=${screening.screeningId}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleExport(screening)}
                    title="Download screening report"
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(screening.screeningId)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;