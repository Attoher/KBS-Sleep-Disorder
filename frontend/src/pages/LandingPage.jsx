import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Eye, LogIn, UserPlus, ArrowRight, Palette } from 'lucide-react';
import ThemeToggle from '../components/Common/ThemeToggle';
import Button from '../components/Common/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen app-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Moon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
              Sleep Health KBS
            </h1>
            <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
              Knowledge-Based System for Sleep Disorder Diagnosis
            </p>

            {/* Description */}
            <div className="mb-12">
              <p className="text-secondary mb-4">
                Diagnose insomnia and sleep apnea risks using advanced rule-based inference engine
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                  40+ Medical Rules
                </span>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                  Dual Database Architecture
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
                  Real-time Diagnosis
                </span>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Showcase Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link to="/showcase">
                  <div className="surface p-6 rounded-2xl border border-app hover:border-blue-500 transition-all duration-300 hover:scale-105 group">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Eye className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">UI Showcase</h3>
                    <p className="text-secondary text-sm mb-4">
                      Explore all interfaces without backend connection
                    </p>
                    <div className="flex items-center justify-center text-blue-400 text-sm font-medium">
                      View Preview
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Login Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/login">
                  <div className="surface p-6 rounded-2xl border border-app hover:border-purple-500 transition-all duration-300 hover:scale-105 group">
                    <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <LogIn className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">Get Started</h3>
                    <p className="text-secondary text-sm mb-4">
                      Login or continue as guest to start screening
                    </p>
                    <div className="flex items-center justify-center text-purple-400 text-sm font-medium">
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Additional Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <Button variant="outline" size="large" title="Create new account">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </Link>
              <Link to="/components" title="View component library">
                <Button variant="secondary" size="large">
                  <Palette className="w-4 h-4 mr-2" />
                  Components
                </Button>
              </Link>
              <a 
                href="https://github.com/Attoher/KBS-Sleep-Disorder" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="large" title="View documentation on GitHub">
                  View Documentation
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-secondary text-sm"
          >
            <p>© {new Date().getFullYear()} RSBP Sleep Health System. All rights reserved.</p>
            <p className="mt-2">Developed with React + Vite | PostgreSQL + Neo4j</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
