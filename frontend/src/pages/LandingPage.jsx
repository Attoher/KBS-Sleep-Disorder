import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Moon, Eye, LogIn, UserPlus, ArrowRight, Palette, Zap, Shield, Brain,
  Activity, TrendingUp, BarChart3, CheckCircle, AlertCircle, Clock, Database
} from 'lucide-react';
import ThemeToggle from '../components/Common/ThemeToggle';
import Button from '../components/Common/Button';

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: 'Intelligent Rule Engine',
      description: '40+ medical rules for accurate sleep disorder diagnosis',
      color: 'blue'
    },
    {
      icon: Database,
      title: 'Dual Database',
      description: 'PostgreSQL for data, Neo4j for rule inference tracking',
      color: 'purple'
    },
    {
      icon: Activity,
      title: 'Real-time Analysis',
      description: 'Instant diagnosis with comprehensive risk assessment',
      color: 'green'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track trends, patterns, and screening history',
      color: 'cyan'
    }
  ];

  const sampleResults = [
    {
      diagnosis: 'No Sleep Disorder Detected',
      insomniaRisk: 'low',
      apneaRisk: 'low',
      color: 'green'
    },
    {
      diagnosis: 'Potential Insomnia',
      insomniaRisk: 'high',
      apneaRisk: 'low',
      color: 'orange'
    },
    {
      diagnosis: 'Sleep Apnea Risk',
      insomniaRisk: 'low',
      apneaRisk: 'high',
      color: 'red'
    }
  ];

  return (
    <div className="min-h-screen app-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="absolute top-8 right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Main Content Container with proper padding */}
      <div className="relative z-10 px-6 sm:px-8 md:px-12 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-12">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-24 h-24 mb-8 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30"
              >
                <Moon className="w-12 h-12 text-white" />
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Sleep Health KBS
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-secondary/90 mb-10 max-w-3xl mx-auto leading-relaxed px-4">
                Advanced Knowledge-Based System for Intelligent Sleep Disorder Diagnosis
              </p>
            </div>

            {/* Stats Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-5 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">40+ Medical Rules</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Dual Database</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Real-time Diagnosis</span>
                </div>
              </div>
              
              <p className="text-secondary/80 max-w-2xl mx-auto text-lg leading-relaxed px-4">
                Diagnose insomnia and sleep apnea risks using an advanced rule-based inference engine
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center mb-8"
            >
              <Link to="/login">
                <Button 
                  variant="primary" 
                  size="large"
                  className="px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  Get Started
                </Button>
              </Link>
              <Link to="/showcase">
                <Button 
                  variant="outline" 
                  size="large"
                  className="px-8 py-4 rounded-xl border-2 hover:border-purple-500/50"
                >
                  <Eye className="w-5 h-5 mr-3" />
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
              Key Features
            </h2>
            <p className="text-center text-secondary/80 mb-12 max-w-2xl mx-auto px-4">
              Powered by advanced medical algorithms and modern technology stack
            </p>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="surface p-6 rounded-2xl border border-app hover:border-app/60 transition-all duration-300 hover:shadow-xl"
                >
                  <div className={`w-12 h-12 mb-4 bg-gradient-to-br from-${feature.color}-500/10 to-${feature.color}-500/5 rounded-xl flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-secondary/70 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sample Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
              Sample Diagnosis Results
            </h2>
            <p className="text-center text-secondary/80 mb-12 max-w-2xl mx-auto px-4">
              See what kind of insights you'll receive from our intelligent screening system
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {sampleResults.map((result, index) => (
                <motion.div
                  key={result.diagnosis}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="surface p-6 rounded-2xl border border-app"
                >
                  <div className="flex items-start gap-3 mb-4">
                    {result.color === 'green' && <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />}
                    {result.color === 'orange' && <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0" />}
                    {result.color === 'red' && <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />}
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-1">
                        {result.diagnosis}
                      </h3>
                      <p className="text-xs text-secondary/60">Sample diagnosis</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-app/30 rounded-lg">
                      <span className="text-sm text-secondary/80">Insomnia Risk</span>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        result.insomniaRisk === 'high' 
                          ? 'bg-red-500/10 text-red-400' 
                          : 'bg-green-500/10 text-green-400'
                      }`}>
                        {result.insomniaRisk.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-app/30 rounded-lg">
                      <span className="text-sm text-secondary/80">Sleep Apnea Risk</span>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        result.apneaRisk === 'high' 
                          ? 'bg-red-500/10 text-red-400' 
                          : 'bg-green-500/10 text-green-400'
                      }`}>
                        {result.apneaRisk.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-app/30">
                    <p className="text-xs text-secondary/60 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Results in seconds
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-4">
              How It Works
            </h2>
            <p className="text-center text-secondary/80 mb-12 max-w-2xl mx-auto px-4">
              Simple 3-step process to get your sleep health diagnosis
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { step: '1', title: 'Fill Screening Form', desc: 'Answer questions about your sleep patterns and health' },
                { step: '2', title: 'AI Analysis', desc: 'Our rule engine processes your data through 40+ medical rules' },
                { step: '3', title: 'Get Results', desc: 'Receive detailed diagnosis with risk assessment and recommendations' }
              ].map((item, index) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-secondary/70 text-sm px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
          >
            <Link to="/showcase" className="group">
              <div className="surface p-6 rounded-2xl border-2 border-app hover:border-blue-500/50 transition-all duration-300 h-full">
                <Eye className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-primary mb-2">UI Showcase</h3>
                <p className="text-sm text-secondary/70 mb-3">Preview all pages and features</p>
                <span className="text-sm text-blue-400 group-hover:text-blue-300 flex items-center gap-2">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link to="/register" className="group">
              <div className="surface p-6 rounded-2xl border-2 border-app hover:border-purple-500/50 transition-all duration-300 h-full">
                <UserPlus className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-primary mb-2">Create Account</h3>
                <p className="text-sm text-secondary/70 mb-3">Sign up to save your screening history</p>
                <span className="text-sm text-purple-400 group-hover:text-purple-300 flex items-center gap-2">
                  Register <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link to="/components" className="group">
              <div className="surface p-6 rounded-2xl border-2 border-app hover:border-cyan-500/50 transition-all duration-300 h-full">
                <Palette className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-primary mb-2">Components</h3>
                <p className="text-sm text-secondary/70 mb-3">View our design system library</p>
                <span className="text-sm text-cyan-400 group-hover:text-cyan-300 flex items-center gap-2">
                  View Library <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mb-16 text-center"
          >
            <p className="text-secondary/70 text-sm mb-6 font-medium">BUILT WITH MODERN TECHNOLOGIES</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['React 18', 'Vite 5', 'PostgreSQL', 'Neo4j', 'Express.js', 'Tailwind CSS', 'Framer Motion', 'Chart.js'].map((tech) => (
                <span 
                  key={tech}
                  className="px-5 py-2.5 surface border border-app rounded-xl text-sm text-secondary/80 hover:text-primary hover:border-app/60 transition-all"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="pt-12 border-t border-app/30 text-center"
          >
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <a 
                href="https://github.com/Attoher/KBS-Sleep-Disorder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary/70 hover:text-primary transition-colors text-sm"
              >
                GitHub Repository
              </a>
              <Link to="/api-docs" className="text-secondary/70 hover:text-primary transition-colors text-sm">
                API Documentation
              </Link>
              <Link to="/help" className="text-secondary/70 hover:text-primary transition-colors text-sm">
                Help & Support
              </Link>
            </div>
            <p className="text-secondary/60 text-sm">© {new Date().getFullYear()} RSBP Sleep Health System. All rights reserved.</p>
            <p className="text-secondary/60 text-sm mt-2">Medical-grade sleep disorder diagnosis platform</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
