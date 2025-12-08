import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  Brain,
  Heart,
  User,
  Moon,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import Button from '../Common/Button';
import Card, { CardHeader, CardBody } from '../Common/Card';

const ScreeningForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: 45,
    gender: 'Male',
    sleepDuration: 4.5,
    sleepQuality: 3,
    physicalActivity: 20,
    dailySteps: 3000,
    heartRate: 98,
    bmiCategory: 'Obese',
    bloodPressure: '150/95',
    log_to_neo4j: true
  });

  // Stress questionnaire state (10 questions)
  const [stressAnswers, setStressAnswers] = useState({
    q1: 1, // Beban Akademik/Pekerjaan
    q2: 1, // Ekspektasi Sosial & Keluarga
    q3: 1, // Tekanan Sebaya
    q4: 1, // Ketidakpastian Masa Depan
    q5: 1, // Kondisi Keuangan
    q6: 1, // Hubungan Interpersonal
    q7: 1, // Evaluasi Diri
    q8: 1, // Kesehatan & Fisik
    q9: 1, // Lingkungan & Situasi
    q10: 1 // Kecemasan Tidur
  });

  const stressQuestions = [
    {
      id: 'q1',
      text: 'Apakah Anda merasa kewalahan dengan tenggat waktu (deadline), ujian, skripsi/tesis, atau beban kerja yang menumpuk?',
      category: 'Beban Akademik/Pekerjaan'
    },
    {
      id: 'q2',
      text: 'Apakah Anda merasakan tekanan dari ekspektasi orang tua, kerabat, atau pertanyaan kapan lulus/menikah/sukses?',
      category: 'Ekspektasi Sosial & Keluarga'
    },
    {
      id: 'q3',
      text: 'Apakah Anda merasa cemas atau minder saat melihat pencapaian teman sebaya (lulus lebih dulu, gaji lebih besar, dll) di media sosial atau kehidupan nyata?',
      category: 'Tekanan Sebaya (Peer Pressure)'
    },
    {
      id: 'q4',
      text: 'Apakah Anda merasa khawatir berlebihan mengenai pencarian kerja, karir, atau ketidakpastian masa depan?',
      category: 'Ketidakpastian Masa Depan'
    },
    {
      id: 'q5',
      text: 'Apakah Anda merasa tertekan memikirkan masalah keuangan, hutang, atau biaya hidup?',
      category: 'Kondisi Keuangan'
    },
    {
      id: 'q6',
      text: 'Apakah ada konflik dengan pasangan, teman, atau lingkungan sosial yang mengganggu pikiran Anda akhir-akhir ini?',
      category: 'Hubungan Interpersonal'
    },
    {
      id: 'q7',
      text: 'Apakah Anda sering menyalahkan diri sendiri, merasa tidak cukup baik, atau merasa "tertinggal"?',
      category: 'Evaluasi Diri (Self-Pressure)'
    },
    {
      id: 'q8',
      text: 'Apakah Anda merasa stres mengenai kondisi fisik, berat badan, atau penampilan Anda?',
      category: 'Kesehatan & Fisik'
    },
    {
      id: 'q9',
      text: 'Apakah situasi lingkungan (kebisingan, perjalanan jauh, berita buruk) membuat Anda sulit merasa tenang?',
      category: 'Lingkungan & Situasi'
    },
    {
      id: 'q10',
      text: 'Apakah Anda merasa cemas justru ketika memikirkan "harus bisa tidur" atau takut tidak bisa bangun pagi?',
      category: 'Kecemasan Tidur'
    }
  ];

  // Calculate stress level from questionnaire (convert to 1-10 scale)
  const calculateStressLevel = () => {
    const totalScore = Object.values(stressAnswers).reduce((sum, val) => sum + val, 0);
    // Total max = 20 (10 questions × 2 points)
    // Convert to 1-10 scale: ceil(totalScore / 2)
    const stressLevel = Math.max(1, Math.ceil(totalScore / 2));
    return stressLevel;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Calculate stress level from questionnaire
      const stressLevel = calculateStressLevel();
      
      // Prepare data with calculated stress level
      const submissionData = {
        ...formData,
        stressLevel
      };
      
      const response = await api.post('/screening/process', submissionData);
      toast.success('Screening completed successfully!');
      navigate('/results', { state: { results: response.data.data } });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Screening failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      color: 'blue',
      fields: [
        {
          label: 'Age (years)',
          type: 'number',
          name: 'age',
          min: 1,
          max: 120,
          value: formData.age,
          onChange: (e) => setFormData({...formData, age: parseInt(e.target.value)})
        },
        {
          label: 'Gender',
          type: 'select',
          name: 'gender',
          options: ['Male', 'Female', 'Other'],
          value: formData.gender,
          onChange: (e) => setFormData({...formData, gender: e.target.value})
        }
      ]
    },
    {
      title: 'Sleep Data',
      icon: Bed,
      color: 'purple',
      fields: [
        {
          label: `Sleep Duration: ${formData.sleepDuration} hours`,
          type: 'range',
          name: 'sleepDuration',
          min: 0,
          max: 12,
          step: 0.5,
          value: formData.sleepDuration,
          onChange: (e) => setFormData({...formData, sleepDuration: parseFloat(e.target.value)})
        },
        {
          label: `Sleep Quality: ${formData.sleepQuality}/10`,
          type: 'range',
          name: 'sleepQuality',
          min: 1,
          max: 10,
          value: formData.sleepQuality,
          onChange: (e) => setFormData({...formData, sleepQuality: parseInt(e.target.value)})
        }
      ]
    },
    {
      title: 'Lifestyle & Stress',
      icon: Brain,
      color: 'green',
      fields: [
        {
          label: 'Physical Activity (minutes/day)',
          type: 'number',
          name: 'physicalActivity',
          min: 0,
          max: 600,
          value: formData.physicalActivity,
          onChange: (e) => setFormData({...formData, physicalActivity: parseInt(e.target.value)})
        },
        {
          label: 'Daily Steps',
          type: 'number',
          name: 'dailySteps',
          min: 0,
          max: 50000,
          value: formData.dailySteps,
          onChange: (e) => setFormData({...formData, dailySteps: parseInt(e.target.value)})
        }
      ]
    },
    {
      title: 'Health Metrics',
      icon: Heart,
      color: 'red',
      fields: [
        {
          label: 'BMI Category',
          type: 'select',
          name: 'bmiCategory',
          options: ['Normal', 'Overweight', 'Obese', 'Underweight'],
          value: formData.bmiCategory,
          onChange: (e) => setFormData({...formData, bmiCategory: e.target.value})
        },
        {
          label: 'Blood Pressure (e.g., 120/80)',
          type: 'text',
          name: 'bloodPressure',
          placeholder: '120/80',
          value: formData.bloodPressure,
          onChange: (e) => setFormData({...formData, bloodPressure: e.target.value})
        },
        {
          label: 'Heart Rate (bpm)',
          type: 'number',
          name: 'heartRate',
          min: 30,
          max: 200,
          value: formData.heartRate,
          onChange: (e) => setFormData({...formData, heartRate: parseInt(e.target.value)})
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Sleep Health Screening</h1>
        <p className="text-secondary">Complete the form below for a comprehensive sleep disorder assessment</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <Card hover>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${section.color}-500/10`}>
                    <section.icon className={`w-6 h-6 text-${section.color}-400`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">{section.title}</h2>
                  </div>
                </div>
              </CardHeader>
              
              <CardBody>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label className="block text-sm font-medium text-secondary">
                        {field.label}
                      </label>
                      
                      {field.type === 'range' ? (
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={field.value}
                          onChange={field.onChange}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-600"
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={field.value}
                          onChange={field.onChange}
                          className="w-full input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={field.onChange}
                          min={field.min}
                          max={field.max}
                          placeholder={field.placeholder}
                          className="w-full input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}

        {/* Stress Questionnaire Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sections.length * 0.1 }}
        >
          <Card hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Brain className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">Kuesioner Tingkat Stress</h2>
                    <p className="text-sm text-secondary mt-1">
                      Tingkat Stress Saat Ini: <span className="font-bold text-orange-400">{calculateStressLevel()}/10</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-6">
                {stressQuestions.map((question, index) => (
                  <div key={question.id} className="p-4 surface-secondary rounded-lg border border-app">
                    <p className="text-sm font-medium text-secondary mb-2">{question.category}</p>
                    <p className="text-primary mb-4">{index + 1}. {question.text}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={0}
                          checked={stressAnswers[question.id] === 0}
                          onChange={() => setStressAnswers({...stressAnswers, [question.id]: 0})}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-secondary">Tidak Pernah (0)</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={1}
                          checked={stressAnswers[question.id] === 1}
                          onChange={() => setStressAnswers({...stressAnswers, [question.id]: 1})}
                          className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-secondary">Kadang-kadang (1)</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={2}
                          checked={stressAnswers[question.id] === 2}
                          onChange={() => setStressAnswers({...stressAnswers, [question.id]: 2})}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-secondary">Sering (2)</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-medium text-primary">Log to Neo4j Graph Database</h3>
                  <p className="text-sm text-secondary">
                    Enable this to log the screening results to Neo4j for advanced analytics
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.log_to_neo4j}
                  onChange={(e) => setFormData({...formData, log_to_neo4j: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
              </label>
            </div>
          </CardBody>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-end space-x-4"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            title="Cancel and return to dashboard"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            size="large"
            title="Submit screening and get diagnosis"
          >
            <div className="flex items-center space-x-2">
              <Moon className="w-5 h-5" />
              <span>Run Diagnosis</span>
            </div>
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default ScreeningForm;