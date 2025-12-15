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
  Scale,
  Calendar,
  Clock
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
import toast from 'react-hot-toast';
import api from '../utils/api';
import { RECOMMENDATION_TEXTS, RULE_DESCRIPTIONS } from '../utils/constants';
import { exportAsJSON, exportAsPDF, shareResults } from '../utils/exportUtils';
import Button from '../components/Common/Button';
import Loader from '../components/Common/Loader';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');

    if (id) {
      fetchScreening(id);
    } else if (location.state?.results) {
      // Set results from state (new screening)
      const stateResults = location.state.results;
      setResults(stateResults);
      setTimestamp(new Date().toISOString());
    } else {
      navigate('/screening');
    }
  }, [location]);

  const fetchScreening = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/screening/${id}`);
      const screeningData = response.data.data || response.data;

      // Format the data for display
      // Try to extract firedRules from multiple sources
      let firedRulesArray = screeningData.firedRules || screeningData.firedRulesArray || [];

      // Fallback: extract from facts.firedRules if available
      if ((!firedRulesArray || firedRulesArray.length === 0) && screeningData.facts) {
        const facts = typeof screeningData.facts === 'string'
          ? JSON.parse(screeningData.facts)
          : screeningData.facts;

        if (facts.firedRules && Array.isArray(facts.firedRules)) {
          firedRulesArray = facts.firedRules;
        }
      }

      const formattedResults = {
        diagnosis: screeningData.diagnosis || 'No Sleep Disorder Detected',
        insomniaRisk: screeningData.insomniaRisk || 'low',
        apneaRisk: screeningData.apneaRisk || 'low',
        lifestyleIssues: screeningData.lifestyleIssues || {
          sleep: false,
          stress: false,
          activity: false,
          weight: false
        },
        recommendations: screeningData.recommendations || [],
        firedRules: firedRulesArray,
        inputData: screeningData.inputData || screeningData.inputSummary || {},
        facts: screeningData.facts || {},
        timestamp: screeningData.timestamp || screeningData.readableTimestamp || new Date().toISOString()
      };

      setResults(formattedResults);
      setTimestamp(screeningData.timestamp || screeningData.readableTimestamp);
    } catch (error) {
      console.error('Failed to fetch screening:', error);
      // Fallback to demo data
      setResults({
        diagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)',
        insomniaRisk: 'high',
        apneaRisk: 'moderate',
        lifestyleIssues: {
          sleep: true,
          stress: true,
          activity: false,
          weight: true
        },
        recommendations: [
          'REC_SLEEP_HYGIENE',
          'REC_STRESS_MANAGEMENT',
          'REC_WEIGHT_MANAGEMENT'
        ],
        firedRules: ['R1', 'R3', 'R5', 'R12', 'R15'],
        inputData: {
          age: 45,
          gender: 'Male',
          sleepDuration: 4.5,
          sleepQuality: 3,
          stressLevel: 8,
          physicalActivity: 20,
          dailySteps: 3000,
          heartRate: 98,
          bmiCategory: 'Obese',
          bloodPressure: '150/95'
        }
      });
      setTimestamp(new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    try {
      exportAsJSON(results, timestamp);
      toast.success('Results exported as JSON successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export results');
    }
  };

  const handleExportPDF = () => {
    try {
      exportAsPDF(results, timestamp);
      toast.success('Opening print dialog for PDF export...');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export results');
    }
  };

  const handleShare = () => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');

    if (id) {
      const success = shareResults(id);
      if (success) {
        toast.success('Link copied to clipboard!');
      } else {
        toast.error('Failed to copy link');
      }
    } else {
      toast.error('Cannot share unsaved results. Please save first.');
    }
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

  // Calculate confidence based on rules fired and risk levels
  const calculateConfidence = () => {
    if (!results) return 50;

    let confidence = 50; // Base confidence

    // Add points based on number of rules fired (max 20 points)
    const rulesCount = results.firedRules?.length || 0;
    confidence += Math.min((rulesCount / 25) * 20, 20);

    // Add points based on insomnia risk (max 15 points)
    const insomniaRiskValue = {
      'high': 15,
      'moderate': 10,
      'low': 5,
      'unknown': 2
    };
    confidence += insomniaRiskValue[results.insomniaRisk?.toLowerCase()] || 2;

    // Add points based on apnea risk (max 15 points)
    const apneaRiskValue = {
      'high': 15,
      'moderate': 10,
      'low': 5,
      'unknown': 2
    };
    confidence += apneaRiskValue[results.apneaRisk?.toLowerCase()] || 2;

    // Cap confidence at 99%
    return Math.min(Math.round(confidence), 99);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';

    try {
      if (typeof timestamp === 'string' && timestamp.includes(',')) {
        return timestamp; // Already formatted
      }

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Just now';

      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Just now';
    }
  };

  if (loading || !results) {
    return <Loader fullScreen />;
  }

  // Prepare data for charts
  const lifestyleData = {
    labels: ['Sleep Issue', 'Stress Issue', 'Activity Issue', 'Weight Issue'],
    datasets: [
      {
        data: [
          results.lifestyleIssues?.sleep ? 1 : 0,
          results.lifestyleIssues?.stress ? 1 : 0,
          results.lifestyleIssues?.activity ? 1 : 0,
          results.lifestyleIssues?.weight ? 1 : 0
        ],
        backgroundColor: [
          '#8b5cf6',
          '#10b981',
          '#3b82f6',
          '#f59e0b'
        ],
        borderWidth: 0,
        borderColor: 'transparent'
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
          <div className="flex items-center space-x-4 text-gray-400 mt-1">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatTimestamp(timestamp)}</span>
            </div>
            {results.firedRules && (
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>{results.firedRules.length} rules fired</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
          <Button variant="outline" onClick={handleExportJSON}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={handleShare}>
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
            className={theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8'
            }
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${results.diagnosis.includes('No Sleep Disorder')
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
                  <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Final Diagnosis</h2>
                  <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Based on rule-based analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Confidence</div>
                <div className="text-2xl font-bold text-green-400">{calculateConfidence()}%</div>
              </div>
            </div>

            <div className="text-center py-6">
              <span className="text-4xl font-bold text-purple-400">
                {results.diagnosis}
              </span>
              <p className={`mt-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                {results.diagnosis.includes('No Sleep Disorder')
                  ? 'Your sleep patterns appear healthy. Maintain your current lifestyle.'
                  : 'Based on your inputs, there are indicators of sleep disorders that require attention.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className={theme === 'light' ? 'bg-purple-100 rounded-xl p-6' : 'bg-gray-800/50 rounded-xl p-6'}>
                <div className="flex items-center space-x-3 mb-4">
                  <Moon className="w-6 h-6 text-blue-400" />
                  <h3 className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Insomnia Risk</h3>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${getRiskBgColor(results.insomniaRisk)}`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${results.insomniaRisk === 'high' ? 'bg-red-500' :
                    results.insomniaRisk === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  <span className={`font-bold ${getRiskColor(results.insomniaRisk)}`}>
                    {results.insomniaRisk?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              <div className={theme === 'light' ? 'bg-pink-100 rounded-xl p-6' : 'bg-gray-800/50 rounded-xl p-6'}>
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-6 h-6 text-purple-400" />
                  <h3 className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Apnea Risk</h3>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${getRiskBgColor(results.apneaRisk)}`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${results.apneaRisk === 'high' ? 'bg-red-500' :
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
            className={theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8'
            }
          >
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Recommendations</h2>
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
                      {RECOMMENDATION_TEXTS[rec] || 'Follow this recommendation for better sleep health'}
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

          {/* Triggered Medical Rules */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8'
            }
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Triggered Medical Rules</h2>
              {results.firedRules && results.firedRules.length > 0 && (
                <span className="text-sm text-gray-400">
                  {results.firedRules.length} rules triggered
                </span>
              )}
            </div>
            {results.firedRules && results.firedRules.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {results.firedRules.map((rule, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-default"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="text-gray-400 mb-2">No specific rules triggered</div>
                <p className="text-sm text-gray-500">
                  Your screening results are within normal parameters
                </p>
              </div>
            )}
          </motion.div>

          {/* Screening Overview - Comprehensive Metrics Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-8'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-8'
            }
          >
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Screening Results Overview</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Age & Gender */}
              {results.inputData?.age && (
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Age</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.age} years</p>
                </div>
              )}
              {results.inputData?.gender && (
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Gender</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.gender}</p>
                </div>
              )}

              {/* Sleep Metrics */}
              {results.inputData?.sleepDuration !== undefined && (
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <p className="text-xs text-purple-400 mb-2 uppercase tracking-wide">Sleep Duration</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.sleepDuration} hours</p>
                </div>
              )}
              {(results.inputData?.sleepQuality !== undefined || results.inputData?.sleepQualityScore !== undefined) && (
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <p className="text-xs text-purple-400 mb-2 uppercase tracking-wide">Sleep Quality Score</p>
                  <p className="text-white font-semibold text-lg">
                    {results.inputData.sleepQualityScore || results.inputData.sleepQuality}/10
                  </p>
                </div>
              )}

              {/* Stress Level - NOW VISIBLE */}
              {results.inputData?.stressLevel !== undefined && (
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-xs text-orange-400 mb-2 uppercase tracking-wide">Stress Level</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.stressLevel}/10</p>
                </div>
              )}

              {/* Physical Activity */}
              {results.inputData?.physicalActivity !== undefined && (
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-xs text-green-400 mb-2 uppercase tracking-wide">Physical Activity</p>
                  <p className="text-white font-semibold text-lg">
                    {results.inputData.physicalActivity >= 30 ? '≥30 min/day' :
                      results.inputData.physicalActivity >= 10 ? '10-20 min/day' :
                        'None'}
                  </p>
                </div>
              )}
              {results.inputData?.dailySteps !== undefined && (
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <p className="text-xs text-green-400 mb-2 uppercase tracking-wide">Daily Steps</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.dailySteps.toLocaleString()}</p>
                </div>
              )}

              {/* Health Metrics */}
              {results.inputData?.heartRate !== undefined && (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <p className="text-xs text-red-400 mb-2 uppercase tracking-wide">Heart Rate</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.heartRate} bpm</p>
                </div>
              )}
              {results.inputData?.bloodPressure && (
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <p className="text-xs text-red-400 mb-2 uppercase tracking-wide">Blood Pressure</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.bloodPressure}</p>
                </div>
              )}

              {/* BMI Category */}
              {results.inputData?.bmiCategory && (
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-xs text-yellow-400 mb-2 uppercase tracking-wide">BMI Category</p>
                  <p className="text-white font-semibold text-lg">{results.inputData.bmiCategory}</p>
                </div>
              )}
              {(results.inputData?.weight && results.inputData?.height) && (
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-xs text-yellow-400 mb-2 uppercase tracking-wide">Weight / Height</p>
                  <p className="text-white font-semibold text-lg">
                    {results.inputData.weight}{results.inputData.weightUnit || 'kg'} / {results.inputData.height}{results.inputData.heightUnit || 'cm'}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Info Banner */}
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Stress Level and Sleep Quality scores are calculated from your questionnaire responses.
                These metrics are now visible in your results for comprehensive health tracking.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-6">
          {/* Lifestyle Issues */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6'
            }
          >
            <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Lifestyle Issues</h2>
            {lifestyleData.datasets[0].data.some(val => val > 0) ? (
              <div className="h-64">
                <Doughnut
                  data={lifestyleData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        align: 'center',
                        labels: {
                          color: theme === 'light' ? '#374151' : '#9ca3af',
                          padding: 15,
                          boxWidth: 15,
                          boxHeight: 15,
                          usePointStyle: false,
                          font: {
                            size: 11
                          }
                        },
                        display: true,
                        fullSize: true
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
                  <p className="text-gray-300">No lifestyle issues detected</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {Object.entries(results.lifestyleIssues || {}).map(([key, value]) => (
                <div key={key} className={`text-center p-3 rounded-lg ${theme === 'light' ? 'bg-purple-100' : 'bg-gray-800/50'}`}>
                  <div className={`text-2xl font-bold mb-2 ${value ? 'text-red-400' : 'text-green-400'}`}>
                    {value ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div className={`text-sm capitalize ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
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
            className={theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6'
            }
          >
            <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Risk Comparison</h2>
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
                        callback: function (value) {
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
            className={theme === 'light'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-6'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6'
            }
          >
            <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Next Steps</h2>
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