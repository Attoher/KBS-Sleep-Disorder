import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Eye, LogIn, UserPlus, ArrowRight, Palette, Zap, Shield, Brain } from 'lucide-react';
import ThemeToggle from '../components/Common/ThemeToggle';
import Button from '../components/Common/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen app-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-24 h-24 mb-8 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30"
              >
                <Moon className="w-12 h-12 text-white" />
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-primary mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Sleep Health KBS
              </h1>
              <p className="text-xl md:text-2xl text-secondary/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Advanced Knowledge-Based System for Intelligent Sleep Disorder Diagnosis
              </p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">40+ Medical Rules</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400 font-medium">Dual Database Architecture</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Real-time Diagnosis</span>
                </div>
              </div>
              
              <p className="text-secondary/80 max-w-2xl mx-auto text-lg leading-relaxed">
                Diagnose insomnia and sleep apnea risks using an advanced rule-based inference engine with PostgreSQL and Neo4j integration
              </p>
            </motion.div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              {/* Showcase Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link to="/showcase">
                  <div className="h-full surface p-8 rounded-3xl border-2 border-app hover:border-blue-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/10">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Eye className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-4">UI Showcase</h3>
                    <p className="text-secondary text-base mb-6 leading-relaxed">
                      Explore all interfaces and features without backend connection
                    </p>
                    <div className="flex items-center justify-center text-blue-400 text-base font-medium group-hover:text-blue-300 transition-colors">
                      View Preview
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Login Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/login">
                  <div className="h-full surface p-8 rounded-3xl border-2 border-app hover:border-purple-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <LogIn className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-4">Get Started</h3>
                    <p className="text-secondary text-base mb-6 leading-relaxed">
                      Login or continue as guest to start your sleep health screening
                    </p>
                    <div className="flex items-center justify-center text-purple-400 text-base font-medium group-hover:text-purple-300 transition-colors">
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Additional Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 justify-center mb-16"
            >
              <Link to="/register">
                <Button 
                  variant="outline" 
                  size="large"
                  className="px-8 py-4 rounded-xl border-2 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                  title="Create new account"
                >
                  <UserPlus className="w-5 h-5 mr-3" />
                  Create Account
                </Button>
              </Link>
              <Link to="/components" title="View component library">
                <Button 
                  variant="secondary" 
                  size="large"
                  className="px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <Palette className="w-5 h-5 mr-3" />
                  Components
                </Button>
              </Link>
              <a 
                href="https://github.com/Attoher/KBS-Sleep-Disorder" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  variant="secondary" 
                  size="large"
                  className="px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-gray-500/10"
                  title="View documentation on GitHub"
                >
                  <Zap className="w-5 h-5 mr-3" />
                  View Documentation
                </Button>
              </a>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-12"
            >
              <p className="text-secondary/70 text-sm mb-4">Built With</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['React + Vite', 'PostgreSQL', 'Neo4j', 'Express.js', 'Tailwind CSS', 'Framer Motion'].map((tech) => (
                  <span 
                    key={tech}
                    className="px-4 py-2 bg-surface border border-app rounded-xl text-sm text-secondary/80 hover:text-primary transition-colors"
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
              transition={{ delay: 1 }}
              className="pt-8 border-t border-app/30"
            >
              <p className="text-secondary/60 text-sm">© {new Date().getFullYear()} RSBP Sleep Health System. All rights reserved.</p>
              <p className="text-secondary/60 text-sm mt-2">Medical-grade sleep disorder diagnosis platform</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
