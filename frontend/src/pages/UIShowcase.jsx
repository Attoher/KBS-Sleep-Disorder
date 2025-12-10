import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  History, 
  FileText,
  LogIn,
  UserPlus,
  Moon,
  ChevronRight,
  Palette,
  Zap,
  Settings,
  HelpCircle,
  Activity,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/Common/Card';
import Button from '../components/Common/Button';
import ThemeToggle from '../components/Common/ThemeToggle';

const UIShowcase = () => {
  const pages = [
    {
      name: 'Login',
      path: '/login',
      icon: LogIn,
      color: 'blue',
      description: 'User authentication with JWT tokens and guest mode',
      status: 'complete'
    },
    {
      name: 'Register',
      path: '/register',
      icon: UserPlus,
      color: 'green',
      description: 'New user registration with form validation',
      status: 'complete'
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      color: 'purple',
      description: 'Main dashboard with real-time system status and statistics',
      status: 'complete'
    },
    {
      name: 'Screening Form',
      path: '/screening',
      icon: ClipboardList,
      color: 'orange',
      description: 'Sleep health screening with 40+ inference rules',
      status: 'complete'
    },
    {
      name: 'Results',
      path: '/showcase/results',
      icon: FileText,
      color: 'red',
      description: 'Diagnosis results with lifestyle recommendations',
      status: 'complete'
    },
    {
      name: 'History',
      path: '/history',
      icon: History,
      color: 'cyan',
      description: 'Past screening records with filtering and export',
      status: 'complete'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      color: 'pink',
      description: 'Data visualization with Neo4j graph analytics',
      status: 'complete'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      color: 'indigo',
      description: 'Account, notifications, appearance, and privacy settings',
      status: 'complete'
    },
    {
      name: 'Help & Support',
      path: '/help',
      icon: HelpCircle,
      color: 'yellow',
      description: 'FAQs, resources, and system information',
      status: 'complete'
    },
    {
      name: 'Components',
      path: '/components',
      icon: Palette,
      color: 'violet',
      description: 'Reusable component library with Tailwind CSS',
      status: 'complete'
    },
    {
      name: 'API Docs',
      path: '/api-docs',
      icon: Zap,
      color: 'amber',
      description: 'REST API endpoints documentation',
      status: 'complete'
    }
  ];

  return (
    <div className="min-h-screen app-bg">
      {/* Header */}
      <div className="surface border-b border-app sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">UI Showcase</h1>
                <p className="text-xs text-secondary">Preview All Interfaces</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-primary mb-2">
            Interface Preview Gallery
          </h2>
          <p className="text-secondary">
            Explore all available pages and interfaces in the RSBP Sleep Health System
          </p>
        </motion.div>

        {/* Page Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <motion.div
              key={page.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={page.path}>
                <Card hover className="h-full transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <CardBody>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br from-${page.color}-400/20 to-${page.color}-600/20 flex-shrink-0 relative`}>
                        <page.icon className={`w-8 h-8 text-${page.color}-500`} />
                        {page.status === 'complete' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-primary mb-2 flex items-center justify-between">
                          {page.name}
                          <ChevronRight className="w-5 h-5 text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-secondary leading-relaxed">
                          {page.description}
                        </p>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <code className="text-xs px-2 py-1 surface-secondary rounded text-secondary font-mono">
                            {page.path}
                          </code>
                          <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                            ✓ Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* System Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid md:grid-cols-2 gap-6"
        >
          {/* About Card */}
          <Card>
            <CardBody>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-600/20">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-primary mb-2">About This System</h3>
                  <p className="text-sm text-secondary mb-4">
                    RSBP Sleep Health KBS is a full-stack knowledge-based system for sleep disorder screening 
                    with dual-database architecture (PostgreSQL + Neo4j) and 40+ inference rules.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full font-medium">
                      React 18
                    </span>
                    <span className="text-xs px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full font-medium">
                      Node.js + Express
                    </span>
                    <span className="text-xs px-3 py-1 bg-green-500/10 text-green-500 rounded-full font-medium">
                      Neo4j Graph DB
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Features Card */}
          <Card>
            <CardBody>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-600/20">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-primary mb-2">Key Features</h3>
                  <ul className="space-y-2 text-sm text-secondary">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Forward-chaining rule inference engine</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Real-time system health monitoring</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Responsive mobile-first design</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Dark/Light theme support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card>
            <CardBody>
              <div className="text-center py-6">
                <h3 className="text-2xl font-bold text-primary mb-6">System Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-4xl font-bold text-blue-500 mb-2">11</div>
                    <div className="text-sm text-secondary">Pages Available</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-purple-500 mb-2">40+</div>
                    <div className="text-sm text-secondary">Inference Rules</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
                    <div className="text-sm text-secondary">Mobile Responsive</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-orange-500 mb-2">2</div>
                    <div className="text-sm text-secondary">Theme Modes</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            title="Return to home page"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            title="Go to main dashboard"
          >
            Open Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://github.com/Attoher/KBS-Sleep-Disorder', '_blank')}
            title="View project on GitHub"
          >
            View on GitHub
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UIShowcase;
