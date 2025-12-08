import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  Activity,
  Moon,
  ArrowLeft
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Common/Card';
import Button from '../components/Common/Button';

const ShowcaseResults = () => {
  const navigate = useNavigate();

  // Mock data untuk showcase
  const mockResults = {
    diagnosis: 'High Risk Insomnia + Moderate Risk Sleep Apnea',
    insomnia_risk: 'high',
    apnea_risk: 'moderate',
    firedRules: ['R1', 'R3', 'R5', 'R12', 'R18', 'R25'],
    recommendations: [
      'Consult with a sleep specialist immediately',
      'Consider cognitive behavioral therapy for insomnia (CBT-I)',
      'Maintain consistent sleep schedule (bedtime: 10 PM, wake: 6 AM)',
      'Reduce caffeine intake after 2 PM',
      'Create a relaxing bedtime routine',
      'Evaluate for sleep apnea with polysomnography test'
    ],
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
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'red';
      case 'moderate': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return XCircle;
      case 'moderate': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return Info;
    }
  };

  return (
    <div className="min-h-screen app-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate('/showcase')}
            className="mb-4"
            title="Back to showcase"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Showcase
          </Button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Diagnosis Results</h1>
              <p className="text-secondary">Sleep Health Screening Analysis</p>
            </div>
          </div>
        </motion.div>

        {/* Main Diagnosis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-primary">Primary Diagnosis</h2>
            </CardHeader>
            <CardBody>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {mockResults.diagnosis}
                </h3>
                <p className="text-secondary">
                  Based on {mockResults.firedRules.length} medical rules triggered
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Risk Assessment */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Insomnia Risk */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Moon className="w-6 h-6 text-purple-400" />
                  <h3 className="font-bold text-primary">Insomnia Risk</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="text-center py-4">
                  {React.createElement(
                    getRiskIcon(mockResults.insomnia_risk),
                    { 
                      className: `w-12 h-12 text-${getRiskColor(mockResults.insomnia_risk)}-400 mx-auto mb-3` 
                    }
                  )}
                  <p className={`text-2xl font-bold text-${getRiskColor(mockResults.insomnia_risk)}-400 capitalize`}>
                    {mockResults.insomnia_risk}
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Sleep Apnea Risk */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h3 className="font-bold text-primary">Sleep Apnea Risk</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="text-center py-4">
                  {React.createElement(
                    getRiskIcon(mockResults.apnea_risk),
                    { 
                      className: `w-12 h-12 text-${getRiskColor(mockResults.apnea_risk)}-400 mx-auto mb-3` 
                    }
                  )}
                  <p className={`text-2xl font-bold text-${getRiskColor(mockResults.apnea_risk)}-400 capitalize`}>
                    {mockResults.apnea_risk}
                  </p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Triggered Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Triggered Medical Rules</h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {mockResults.firedRules.map((rule, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="font-bold text-primary">Recommendations</h3>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {mockResults.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-secondary">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </motion.div>

        {/* Input Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Screening Input Data</h3>
            </CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(mockResults.inputData).map(([key, value]) => (
                  <div key={key} className="p-3 surface-secondary rounded-lg">
                    <p className="text-xs text-secondary mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-primary font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center space-x-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/showcase')}
            title="Return to showcase"
          >
            Back to Showcase
          </Button>
          <Button
            onClick={() => navigate('/screening')}
            title="Start new screening"
          >
            New Screening
          </Button>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-xs text-secondary">
            <Info className="w-3 h-3 inline mr-1" />
            This is mock data for UI showcase purposes only
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ShowcaseResults;
