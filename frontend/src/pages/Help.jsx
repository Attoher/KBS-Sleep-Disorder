import React, { useState } from 'react';
import { ChevronDown, MessageCircle, Zap, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Help = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      q: 'How do I start a new screening?',
      a: 'Click on "New Screening" in the sidebar or dashboard. Fill out the sleep health questionnaire with your medical information. The system will analyze your responses using 40+ medical rules and provide an instant diagnosis with confidence scores.'
    },
    {
      q: 'What does each diagnosis mean?',
      a: 'Our system can identify Insomnia (difficulty sleeping), Sleep Apnea (breathing interruptions), or Mixed Sleep Disorders. Each result includes a confidence score and recommended factors to consider. Always consult a medical professional for clinical diagnosis.'
    },
    {
      q: 'How are my results calculated?',
      a: 'Results are generated using forward-chaining inference with 40+ medical rules analyzing factors like sleep duration, quality, stress level, BMI, and blood pressure. The system logs all fired rules for transparency.'
    },
    {
      q: 'Can I view my screening history?',
      a: 'Yes! Click "History" to see all your past screenings with timestamps and results. You can also search by date range and export data for personal records.'
    },
    {
      q: 'Is guest mode available?',
      a: 'Yes. Guest mode lets you run screenings without creating an account. However, results are not saved. Create an account to store history and access analytics.'
    },
    {
      q: 'Why did I get logged out?',
      a: 'Sessions expire after 7 days or due to browser cache clearing. Simply log back in. Your screening data is safely stored in our encrypted database.'
    },
    {
      q: 'How do I understand the confidence scores?',
      a: 'Confidence scores (0-100%) indicate how certain the system is about the diagnosis. Higher scores mean more matching factors. Scores are based on rule firing and medical factor alignment.'
    },
    {
      q: 'Can I export my data?',
      a: 'Currently available in History view. More export options (PDF, CSV) coming soon. Your data remains your property and can be accessed anytime.'
    }
  ];

  const resources = [
    { icon: BookOpen, title: 'Documentation', desc: 'Learn how to use all features', link: '#' },
    { icon: Zap, title: 'Quick Tips', desc: 'Get started in 2 minutes', link: '#' },
    { icon: AlertCircle, title: 'Troubleshooting', desc: 'Fix common issues', link: '#' },
    { icon: MessageCircle, title: 'Contact Support', desc: 'Reach our team', link: 'mailto:ryanmarvsirait@gmail.com' }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
          <p className="text-gray-400">Find answers to common questions and learn how to get the most from the KBS Sleep Health System.</p>
        </div>
      </motion.div>

      {/* Quick Resources */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <a
                key={idx}
                href={resource.link}
                className="block p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0 group-hover:text-blue-300 transition-colors" />
                  <div>
                    <p className="font-medium text-white group-hover:text-blue-300 transition-colors">{resource.title}</p>
                    <p className="text-sm text-gray-400">{resource.desc}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </motion.div>

      {/* FAQs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white group-hover:text-blue-300 transition-colors">{item.q}</p>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedFaq === idx ? 'rotate-180' : ''
                      }`}
                  />
                </div>
                {expandedFaq === idx && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-gray-400 text-sm mt-3 leading-relaxed"
                  >
                    {item.a}
                  </motion.p>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Support Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
          <div className="flex items-start space-x-4">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Still need help?</h3>
              <p className="text-gray-300 mb-4">Our support team is here to assist you. We typically respond within 24 hours.</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:ryanmarvsirait@gmail.com"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Email Support
                </a>
                <a
                  href="https://forms.gle/YZ1c4WSzC9eGMahW8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Support Form
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-white mb-4">System Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Medical Rules</p>
              <p className="text-2xl font-bold text-blue-400">40+</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Diagnoses</p>
              <p className="text-2xl font-bold text-purple-400">3</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Processing</p>
              <p className="text-2xl font-bold text-green-400">&lt;1s</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Help;
