import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bed,
  Brain,
  Heart,
  User,
  Moon,
  AlertCircle,
  Scale,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Common/Button';
import Card, { CardHeader, CardBody } from '../Common/Card';
import GuestLimitModal from '../Common/GuestLimitModal';

const ScreeningForm = () => {
  const navigate = useNavigate();
  const { user, guestMode, hasReachedGuestLimit, incrementGuestScreeningCount, addGuestScreening } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

  // Basic form data - age and gender from user profile
  const [formData, setFormData] = useState({
    age: user?.age || 25,
    gender: user?.gender || 'Male',
    sleepDuration: 7,
    physicalActivityLevel: '>=30',
    dailySteps: 5000,
    heartRate: 75,
    bloodPressure: '120/80',
    log_to_neo4j: true
  });

  // BMI Calculator state - reset to empty
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [bmiCategory, setBmiCategory] = useState('Normal');

  // Sleep Quality Questionnaire state (10 questions) - NO DEFAULT VALUES
  const [sleepQualityAnswers, setSleepQualityAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '',
    q6: '', q7: '', q8: '', q9: '', q10: ''
  });

  // Stress questionnaire state (10 questions) - NO DEFAULT VALUES
  const [stressAnswers, setStressAnswers] = useState({
    q1: null, q2: null, q3: null, q4: null, q5: null,
    q6: null, q7: null, q8: null, q9: null, q10: null
  });

  // Sleep Quality Questions
  const sleepQualityQuestions = [
    {
      id: 'q1',
      text: 'How long does it usually take you to fall asleep at night after lying down?',
      options: [
        { value: 'a', label: '< 15 minutes', points: 0 },
        { value: 'b', label: '16 - 30 minutes', points: 1 },
        { value: 'c', label: '31 - 60 minutes', points: 2 },
        { value: 'd', label: '> 60 minutes', points: 3 }
      ]
    },
    {
      id: 'q2',
      text: 'How many hours of actual sleep do you get at night on average? (Not counting time lying in bed awake)',
      options: [
        { value: 'a', label: '> 7 hours', points: 0 },
        { value: 'b', label: '6 - 7 hours', points: 1 },
        { value: 'c', label: '5 - 6 hours', points: 2 },
        { value: 'd', label: '< 5 hours', points: 3 }
      ]
    },
    {
      id: 'q3',
      text: 'How often do you wake up in the middle of the night or too early and have trouble falling back asleep?',
      options: [
        { value: 'a', label: 'Never', points: 0 },
        { value: 'b', label: 'Rarely (less than once a week)', points: 1 },
        { value: 'c', label: 'Sometimes (1-2 times a week)', points: 2 },
        { value: 'd', label: 'Often (3 or more times a week)', points: 3 }
      ]
    },
    {
      id: 'q4',
      text: 'Overall, how would you rate your sleep quality in the past month?',
      options: [
        { value: 'a', label: 'Very Good', points: 0 },
        { value: 'b', label: 'Fairly Good', points: 1 },
        { value: 'c', label: 'Fairly Bad', points: 2 },
        { value: 'd', label: 'Very Bad', points: 3 }
      ]
    },
    {
      id: 'q5',
      text: 'How often is your sleep disturbed by physical issues? (e.g., feeling too cold/hot, body pain, difficulty breathing/snoring, or needing to use the bathroom)',
      options: [
        { value: 'a', label: 'Never', points: 0 },
        { value: 'b', label: 'Rarely (less than once a week)', points: 1 },
        { value: 'c', label: 'Sometimes (1-2 times a week)', points: 2 },
        { value: 'd', label: 'Often (3 or more times a week)', points: 3 }
      ]
    },
    {
      id: 'q6',
      text: 'How satisfied are you with your current sleep pattern?',
      options: [
        { value: 'a', label: 'Very Satisfied', points: 0 },
        { value: 'b', label: 'Fairly Satisfied', points: 1 },
        { value: 'c', label: 'Not Very Satisfied', points: 2 },
        { value: 'd', label: 'Very Dissatisfied', points: 3 }
      ]
    },
    {
      id: 'q7',
      text: 'How do you feel when you wake up in the morning?',
      options: [
        { value: 'a', label: 'Fresh and energized', points: 0 },
        { value: 'b', label: 'A bit tired but able to function', points: 1 },
        { value: 'c', label: 'Still very sleepy and heavy', points: 2 },
        { value: 'd', label: 'Dizzy, fatigued, or have a headache', points: 3 }
      ]
    },
    {
      id: 'q8',
      text: 'Do you feel that a night\'s sleep is enough to restore your energy (refreshing)?',
      options: [
        { value: 'a', label: 'Always', points: 0 },
        { value: 'b', label: 'Often', points: 1 },
        { value: 'c', label: 'Sometimes', points: 2 },
        { value: 'd', label: 'Never (Sleep feels non-refreshing)', points: 3 }
      ]
    },
    {
      id: 'q9',
      text: 'How likely are you to doze off or fall asleep during relaxed daytime activities? (e.g., watching TV, reading, or sitting quietly after lunch)',
      options: [
        { value: 'a', label: 'Would never fall asleep', points: 0 },
        { value: 'b', label: 'Slight chance of falling asleep', points: 1 },
        { value: 'c', label: 'Moderate chance of falling asleep', points: 2 },
        { value: 'd', label: 'High chance of falling asleep', points: 3 }
      ]
    },
    {
      id: 'q10',
      text: 'How often do sleep problems interfere with your concentration, mood, or enthusiasm in daily activities?',
      options: [
        { value: 'a', label: 'Never interferes', points: 0 },
        { value: 'b', label: 'Slightly interferes', points: 1 },
        { value: 'c', label: 'Moderately interferes', points: 2 },
        { value: 'd', label: 'Severely interferes with my activities/work', points: 3 }
      ]
    }
  ];

  const stressQuestions = [
    {
      id: 'q1',
      text: 'Do you feel overwhelmed by deadlines, exams, thesis, or piling workload?',
      category: 'Academic/Work Burden'
    },
    {
      id: 'q2',
      text: 'Do you feel pressure from parental or family expectations, or questions about when you\'ll graduate/marry/succeed?',
      category: 'Social & Family Expectations'
    },
    {
      id: 'q3',
      text: 'Do you feel anxious or inferior when seeing peers\' achievements (graduating earlier, higher salary, etc.) on social media or in real life?',
      category: 'Peer Pressure'
    },
    {
      id: 'q4',
      text: 'Do you worry excessively about job hunting, career, or future uncertainty?',
      category: 'Future Uncertainty'
    },
    {
      id: 'q5',
      text: 'Do you feel stressed thinking about financial problems, debt, or cost of living?',
      category: 'Financial Condition'
    },
    {
      id: 'q6',
      text: 'Are there conflicts with your partner, friends, or social environment that have been bothering you lately?',
      category: 'Interpersonal Relationships'
    },
    {
      id: 'q7',
      text: 'Do you often blame yourself, feel not good enough, or feel "left behind"?',
      category: 'Self-Evaluation (Self-Pressure)'
    },
    {
      id: 'q8',
      text: 'Do you feel stressed about your physical condition, weight, or appearance?',
      category: 'Health & Physical'
    },
    {
      id: 'q9',
      text: 'Do environmental situations (noise, long commutes, bad news) make it difficult for you to feel calm?',
      category: 'Environment & Situation'
    },
    {
      id: 'q10',
      text: 'Do you feel anxious when thinking "I must be able to sleep" or fear not being able to wake up in the morning?',
      category: 'Sleep Anxiety'
    }
  ];

  // Calculate BMI and category
  useEffect(() => {
    const weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
    const heightM = heightUnit === 'in' ? height * 0.0254 : height / 100;

    if (weightKg > 0 && heightM > 0) {
      const bmi = weightKg / (heightM ** 2);

      let category;
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';

      setBmiCategory(category);
    }
  }, [weight, weightUnit, height, heightUnit]);

  // Calculate sleep quality score from questionnaire (convert to 1-10 scale)
  const calculateSleepQualityScore = () => {
    const totalPoints = Object.keys(sleepQualityAnswers).reduce((sum, key) => {
      const answer = sleepQualityAnswers[key];
      const question = sleepQualityQuestions.find(q => q.id === key);
      const option = question?.options.find(opt => opt.value === answer);
      return sum + (option?.points || 0);
    }, 0);

    // Total max = 30 (10 questions × 3 points max)
    // Convert to 1-10 scale: 10 - ceil(totalPoints / 3)
    // Inverted so higher score = better quality
    const sleepQualityScore = Math.max(1, 10 - Math.ceil(totalPoints / 3));
    return sleepQualityScore;
  };

  // Calculate stress level from questionnaire (convert to 1-10 scale)
  const calculateStressLevel = () => {
    const totalScore = Object.values(stressAnswers).reduce((sum, val) => sum + val, 0);
    // Total max = 20 (10 questions × 2 points)
    // Convert to 1-10 scale: ceil(totalScore / 2)
    const stressLevel = Math.max(1, Math.ceil(totalScore / 2));
    return stressLevel;
  };

  // Map physical activity dropdown to numeric value
  const getPhysicalActivityValue = (level) => {
    const mapping = {
      '>=30': 30,
      '10-20': 15,
      'none': 0
    };
    return mapping[level] || 0;
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = [];

    // Check basic fields
    if (!formData.age || formData.age < 1) errors.push('Age is required');
    if (!formData.gender) errors.push('Gender must be selected');
    if (!formData.sleepDuration || formData.sleepDuration < 0) errors.push('Sleep duration is required');
    if (!formData.bloodPressure || !formData.bloodPressure.includes('/')) errors.push('Blood pressure must be filled in correct format (e.g., 120/80)');
    if (!formData.heartRate || formData.heartRate < 30) errors.push('Heart rate is required');
    if (!formData.dailySteps || formData.dailySteps < 0) errors.push('Daily steps is required');
    if (!weight || weight < 1) errors.push('Weight is required');
    if (!height || height < 1) errors.push('Height is required');

    // Check sleep quality questionnaire (all 10 questions must be answered)
    const sleepQualityUnanswered = Object.keys(sleepQualityAnswers).filter(
      key => !sleepQualityAnswers[key] || sleepQualityAnswers[key] === ''
    );
    if (sleepQualityUnanswered.length > 0) {
      errors.push(`All sleep quality questions must be answered (${10 - sleepQualityUnanswered.length}/10 answered)`);
    }

    // Check stress questionnaire (all 10 questions must be answered)
    const stressUnanswered = Object.keys(stressAnswers).filter(
      key => stressAnswers[key] === null || stressAnswers[key] === undefined
    );
    if (stressUnanswered.length > 0) {
      errors.push(`All stress level questions must be answered (${10 - stressUnanswered.length}/10 answered)`);
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check guest limit BEFORE validation
    if (guestMode && hasReachedGuestLimit()) {
      setShowGuestLimitModal(true);
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);

    try {
      // Calculate scores
      const stressLevel = calculateStressLevel();
      const sleepQualityScore = calculateSleepQualityScore();
      const physicalActivity = getPhysicalActivityValue(formData.physicalActivityLevel);

      // Prepare data with calculated values
      const submissionData = {
        ...formData,
        stressLevel,
        sleepQuality: sleepQualityScore,
        sleepQualityScore, // Also send as separate field for clarity
        physicalActivity,
        bmiCategory,
        // Include raw questionnaire data for record keeping
        sleepQualityAnswers,
        stressAnswers,
        weight,
        weightUnit,
        height,
        heightUnit,
        log_to_neo4j: formData.log_to_neo4j !== false
      };

      console.log('[DATA] Submitting screening data:', {
        hasAuth: !!localStorage.getItem('authToken'),
        log_to_neo4j: submissionData.log_to_neo4j,
        sleepQualityScore,
        stressLevel,
        bmiCategory,
        physicalActivity,
        guestMode
      });

      const response = await api.post('/screening/process', submissionData);

      console.log('[SUCCESS] Screening response:', response.data);

      // If guest mode, store screening in localStorage and increment count
      if (guestMode) {
        const guestScreening = {
          screeningId: `guest_${Date.now()}`,
          timestamp: new Date().toISOString(),
          diagnosis: response.data.data.diagnosis,
          insomniaRisk: response.data.data.insomniaRisk,
          apneaRisk: response.data.data.apneaRisk,
          recommendations: response.data.data.recommendations,
          firedRules: response.data.data.firedRules,
          inputData: submissionData
        };
        addGuestScreening(guestScreening);
        incrementGuestScreeningCount();
      }

      toast.success('Screening completed successfully!');

      // Navigate to results with the response data
      navigate('/results', {
        state: {
          results: response.data.data,
          metadata: response.data.metadata
        }
      });
    } catch (error) {
      console.error('[ERROR] Screening error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0] || 'Screening failed';
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
          onChange: (e) => setFormData({ ...formData, age: parseInt(e.target.value) })
        },
        {
          label: 'Gender',
          type: 'select',
          name: 'gender',
          options: ['Male', 'Female', 'Other'],
          value: formData.gender,
          onChange: (e) => setFormData({ ...formData, gender: e.target.value })
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
          onChange: (e) => setFormData({ ...formData, sleepDuration: parseFloat(e.target.value) })
        }
      ]
    },
    {
      title: 'Physical Activity',
      icon: Activity,
      color: 'green',
      fields: [
        {
          label: 'Physical Activity Level',
          type: 'select',
          name: 'physicalActivityLevel',
          options: [
            { value: '>=30', label: '≥ 30 Minutes/day' },
            { value: '10-20', label: '10 - 20 Minutes/day' },
            { value: 'none', label: 'None' }
          ],
          value: formData.physicalActivityLevel,
          onChange: (e) => setFormData({ ...formData, physicalActivityLevel: e.target.value })
        },
        {
          label: 'Daily Steps',
          type: 'number',
          name: 'dailySteps',
          min: 0,
          max: 50000,
          value: formData.dailySteps,
          onChange: (e) => setFormData({ ...formData, dailySteps: parseInt(e.target.value) })
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
                            typeof option === 'string' ? (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ) : (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            )
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

        {/* BMI Calculator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sections.length * 0.1 }}
        >
          <Card hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Scale className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">BMI Calculator</h2>
                    <p className="text-sm text-secondary mt-1">
                      BMI Category: <span className="font-bold text-yellow-400">{bmiCategory}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">
                    Weight
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value))}
                      min={1}
                      max={300}
                      className="flex-1 input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className="input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">
                    Height
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(parseFloat(e.target.value))}
                      min={1}
                      max={300}
                      className="flex-1 input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    <select
                      value={heightUnit}
                      onChange={(e) => setHeightUnit(e.target.value)}
                      className="input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Health Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sections.length + 1) * 0.1 }}
        >
          <Card hover>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Heart className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">Health Metrics</h2>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">
                    Blood Pressure (e.g., 120/80)
                  </label>
                  <input
                    type="text"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    placeholder="120/80"
                    className="w-full input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: parseInt(e.target.value) })}
                    min={30}
                    max={200}
                    className="w-full input-surface rounded-lg px-4 py-3 text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Sleep Quality Questionnaire Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sections.length + 2) * 0.1 }}
        >
          <Card hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Moon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">Sleep Quality Questionnaire</h2>
                    <p className="text-sm text-secondary mt-1">
                      Answer the following 10 questions about your sleep quality
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              <div className="space-y-6">
                {sleepQualityQuestions.map((question, index) => (
                  <div key={question.id} className="p-4 surface-secondary rounded-lg border border-app">
                    <p className="text-primary font-medium mb-4">{index + 1}. {question.text}</p>

                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-gray-700/30 transition-colors">
                          <input
                            type="radio"
                            name={`sleep_quality_${question.id}`}
                            value={option.value}
                            checked={sleepQualityAnswers[question.id] === option.value}
                            onChange={() => setSleepQualityAnswers({ ...sleepQualityAnswers, [question.id]: option.value })}
                            className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-secondary flex-1">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Stress Questionnaire Section - HIDDEN SCORE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sections.length + 3) * 0.1 }}
        >
          <Card hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Brain className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">Stress Level Questionnaire</h2>
                    <p className="text-sm text-secondary mt-1">
                      Answer the following 10 questions about your stress level
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
                          onChange={() => setStressAnswers({ ...stressAnswers, [question.id]: 0 })}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-secondary">Never</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={1}
                          checked={stressAnswers[question.id] === 1}
                          onChange={() => setStressAnswers({ ...stressAnswers, [question.id]: 1 })}
                          className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-secondary">Sometimes</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={2}
                          checked={stressAnswers[question.id] === 2}
                          onChange={() => setStressAnswers({ ...stressAnswers, [question.id]: 2 })}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-secondary">Often</span>
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
                  onChange={(e) => setFormData({ ...formData, log_to_neo4j: e.target.checked })}
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

      {/* Guest Limit Modal */}
      <GuestLimitModal
        isOpen={showGuestLimitModal}
        onClose={() => setShowGuestLimitModal(false)}
      />
    </div>
  );
};

export default ScreeningForm;