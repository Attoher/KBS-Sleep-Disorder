import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';

const RecentScreenings = ({ screenings }) => {
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getDiagnosisIcon = (diagnosis) => {
    if (diagnosis && diagnosis.includes('No Sleep')) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    return <AlertCircle className="w-5 h-5 text-yellow-400" />;
  };

  const formatTime = (timestamp) => {
    if (!timestamp || timestamp === 'N/A') return 'Just now';
    
    try {
      // Check if timestamp is already formatted
      if (typeof timestamp === 'string' && timestamp.includes(',')) {
        return timestamp;
      }
      
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Just now';
      
      // Format to "Mon, Jan 1, 2024 · 2:30 PM"
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Just now';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-primary">Recent Screenings</h2>
        <Link
          to="/history"
          className="text-sm text-primary hover:underline transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-4">
        {screenings?.map((screening, index) => (
          <Link
            key={index}
            to={`/results?id=${screening.screeningId}`}
            className="block p-4 surface-muted rounded-lg hover:shadow transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getDiagnosisIcon(screening.diagnosis)}
                <div>
                  <h3 className="font-medium text-white">{screening.diagnosis}</h3>
                  <div className="flex items-center space-x-4 text-sm text-secondary mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatTime(screening.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-secondary">Insomnia</p>
                    <p className={`font-medium ${getRiskColor(screening.insomniaRisk)}`}>
                      {screening.insomniaRisk || 'unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Apnea</p>
                    <p className={`font-medium ${getRiskColor(screening.apneaRisk)}`}>
                      {screening.apneaRisk || 'unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {(!screenings || screenings.length === 0) && (
          <div className="text-center py-8 surface-muted rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-primary">No screenings yet</p>
            <p className="text-sm text-secondary mt-1">Start your first screening to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentScreenings;