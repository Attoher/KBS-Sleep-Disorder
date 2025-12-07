import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  Moon,
  Download,
  Share2,
  ArrowLeft,
  BarChart3,
  Zap,
  Heart,
  Scale
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import api from '../utils/api';
import { RECOMMENDATION_TEXTS, RULE_DESCRIPTIONS } from '../utils/constants';
import Button from '../components/Common/Button';
import Loader from '../components/Common/Loader';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    
    if (id) {
      fetchScreening(id);
    } else if (location.state?.results) {
      setResults(location.state.results);
    } else {
      navigate('/screening');
    }
  }, [location]);

  const fetchScreening = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/screening/${id}`);
      setResults(response.data.data.screening.results);
    } catch (error) {
      console.error('Failed to fetch screening:', error);
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log('Export results');
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBgColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-500/20';
      case 'moderate': return 'bg-yellow-500/20';
      case 'low': return 'bg-green-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  if (loading || !results) {
    return <Loader fullScreen />;
  }

  const lifestyleData = {
    labels: ['Sleep Issue', 'Stress Issue', 'Activity Issue', 'Weight Issue'],
    datasets: [
      {
        data: [
          results.lifestyleIssues.sleep ? 1 : 0,
          results.lifestyleIssues.stress ? 1 : 0,
          results.lifestyleIssues.activity ? 1 : 0,
          results.lifestyleIssues.weight ? 1 : 0
        ],
        backgroundColor: [
          '#8b5cf6',
          '#10b981',
          '#3b82f6',
          '#f59e0b'
        ],
        borderWidth: 2,
        borderColor: '#1f2937'
      }
    ]
  };

  const riskComparisonData = {
    labels: ['Insomnia Risk', 'Apnea Risk'],
    datasets: [
      {
        label: 'Risk Level',
        data: [
          results.insomniaRisk === 'high' ? 3 : 
          results.insomniaRisk === 'moderate' ? 2 : 1,
          results.apneaRisk === 'high' ? 3 : 
          results.apneaRisk === 'moderate' ? 2 : 1
        ],
        backgroundColor: ['#3b82f6', '#8b5cf6'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to History</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Diagnosis Results</h1>
          <p className="text-gray-400">
            Analysis completed on {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnosis Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  results.diagnosis.includes('No Sleep Disorder') 
                    ? 'bg-green-500/20' 
                    : 'bg-red-500/20'
                }`}>
                  {results.diagnosis.includes('No Sleep Disorder') ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Final Diagnosis</h2>
                  <p className="text-gray-400">Based on rule-based analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Confidence</div>
                <div className="text-2xl font-bold text-green-400">94%</div>
              </div>
            </div>

            <div className="text-center py-6">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {results.diagnosis}
              </span>
              <p className="text-gray-400 mt-4">
                {results.diagnosis.includes('No Sleep Disorder')
                  ? 'Your sleep patterns appear healthy. Maintain your current lifestyle.'
                  : 'Based on your inputs, there are indicators of sleep disorders that require attention.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Moon className="w-6 h-6 text-blue-400" />
                  <h3 className="font-semibold text-white">Insomnia Risk</h3>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${getRiskBgColor(results.insomniaRisk)}`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    results.insomniaRisk === 'high' ? 'bg-red-500' :
                    results.insomniaRisk === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className={`font-bold ${getRiskColor(results.insomniaRisk)}`}>
                    {results.insomniaRisk?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-6 h-6 text-purple-400" />
                  <h3 className="font-semibold text-white">Apnea Risk</h3>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${getRiskBgColor(results.apneaRisk)}`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    results.apneaRisk === 'high' ? 'bg-red-500' :
                    results.apneaRisk === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className={`font-bold ${getRiskColor(results.apneaRisk)}`}>
                    {results.apneaRisk?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Recommendations</h2>
            <div className="space-y-4">
              {results.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      {rec.replace('REC_', '').replace(/_/g, ' ')}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1">
                      {RECOMMENDATION_TEXTS[rec] || 'No description available'}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!results.recommendations || results.recommendations.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  No specific recommendations for your case.
                </div>
              )}
            </div>
          </motion.div>

          {/* Rules Fired */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Rule Engine Analysis</h2>
              <div className="text-sm text-gray-400">
                {results.firedRules?.length || 0} rules fired
              </div>
            </div>
            
            <div className="space-y-3">
              {results.firedRules?.map((ruleId, index) => (
                <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{ruleId}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {RULE_DESCRIPTIONS[ruleId]?.split('→')[0] || ruleId}
                        </div>
                        <div className="text-sm text-gray-400">
                          {RULE_DESCRIPTIONS[ruleId]?.split('→')[1] || 'No description'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Step {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-6">
          {/* Lifestyle Issues */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Lifestyle Issues</h2>
            <div className="h-64">
              <Doughnut 
                data={lifestyleData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#9ca3af',
                        padding: 20
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {Object.entries(results.lifestyleIssues || {}).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <div className={`text-2xl font-bold mb-2 ${value ? 'text-red-400' : 'text-green-400'}`}>
                    {value ? '⚠️' : '✅'}
                  </div>
                  <div className="text-sm text-gray-300 capitalize">
                    {key.replace('Issue', '')}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Risk Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Risk Comparison</h2>
            <div className="h-64">
              <Bar
                data={riskComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 3,
                      ticks: {
                        color: '#9ca3af',
                        callback: function(value) {
                          return value === 3 ? 'High' : value === 2 ? 'Moderate' : 'Low';
                        }
                      }
                    },
                    x: {
                      ticks: {
                        color: '#9ca3af'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Next Steps</h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-gray-300">
                  Schedule a follow-up consultation with a sleep specialist
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-gray-300">
                  Implement recommended lifestyle changes for 30 days
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-gray-300">
                  Track your progress in the dashboard
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Scale className="w-3 h-3 text-yellow-400" />
                </div>
                <span className="text-gray-300">
                  Re-screen after 2 weeks to monitor improvements
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Results;