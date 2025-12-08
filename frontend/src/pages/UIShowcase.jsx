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
  Zap
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
      description: 'User authentication page with guest mode option'
    },
    {
      name: 'Register',
      path: '/register',
      icon: UserPlus,
      color: 'green',
      description: 'New user registration form with validation'
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      color: 'purple',
      description: 'Main dashboard with statistics and recent screenings'
    },
    {
      name: 'Screening Form',
      path: '/screening',
      icon: ClipboardList,
      color: 'orange',
      description: 'Sleep health screening questionnaire with stress assessment'
    },
    {
      name: 'Results',
      path: '/showcase/results',
      icon: FileText,
      color: 'red',
      description: 'Diagnosis results display with recommendations'
    },
    {
      name: 'History',
      path: '/history',
      icon: History,
      color: 'cyan',
      description: 'Past screening records and history tracking'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      color: 'pink',
      description: 'Data visualization and insights dashboard'
    },
    {
      name: 'Components',
      path: '/components',
      icon: Palette,
      color: 'indigo',
      description: 'Reusable component library and documentation'
    },
    {
      name: 'API Docs',
      path: '/api-docs',
      icon: Zap,
      color: 'yellow',
      description: 'REST API endpoints and documentation'
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
              transition={{ delay: index * 0.1 }}
            >
              <Link to={page.path}>
                <Card hover className="h-full transition-all duration-300 hover:scale-105">
                  <CardBody>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-${page.color}-500/10 flex-shrink-0`}>
                        <page.icon className={`w-8 h-8 text-${page.color}-400`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-primary mb-2 flex items-center justify-between">
                          {page.name}
                          <ChevronRight className="w-5 h-5 text-secondary" />
                        </h3>
                        <p className="text-sm text-secondary leading-relaxed">
                          {page.description}
                        </p>
                        
                        <div className="mt-4">
                          <code className="text-xs px-2 py-1 surface-secondary rounded text-secondary">
                            {page.path}
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <CardBody>
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Moon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-2">About This Showcase</h3>
                  <p className="text-sm text-secondary mb-4">
                    This is a preview mode for viewing all UI interfaces without backend connections. 
                    Perfect for design review, UI/UX testing, and documentation purposes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                      No Backend Required
                    </span>
                    <span className="text-xs px-3 py-1 bg-green-500/10 text-green-400 rounded-full">
                      Theme Support
                    </span>
                    <span className="text-xs px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full">
                      Full Navigation
                    </span>
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
          transition={{ delay: 0.9 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            title="Return to home page"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => window.open('https://github.com/Attoher/KBS-Sleep-Disorder', '_blank')}
            title="View project on GitHub"
          >
            View Documentation
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UIShowcase;
