import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  Lock,
  Globe,
  CheckCircle,
  AlertCircle,
  Code
} from 'lucide-react';
import Button from '../components/Common/Button';
import Card, { CardHeader, CardBody } from '../components/Common/Card';
import ThemeToggle from '../components/Common/ThemeToggle';

const APIDocumentation = () => {
  const navigate = useNavigate();
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);

  const endpoints = [
    {
      group: 'Authentication',
      color: 'blue',
      routes: [
        {
          method: 'POST',
          path: '/auth/register',
          description: 'Register new user account',
          body: {
            name: 'string',
            email: 'string',
            password: 'string',
            age: 'number (optional)',
            gender: 'string (optional)'
          },
          response: {
            success: 'boolean',
            data: {
              id: 'number',
              name: 'string',
              email: 'string'
            }
          }
        },
        {
          method: 'POST',
          path: '/auth/login',
          description: 'Authenticate user and get JWT token',
          body: {
            email: 'string',
            password: 'string'
          },
          response: {
            success: 'boolean',
            data: {
              token: 'string',
              user: { id: 'number', name: 'string' }
            }
          }
        }
      ]
    },
    {
      group: 'Screening',
      color: 'green',
      routes: [
        {
          method: 'POST',
          path: '/screening/process',
          description: 'Process screening and get diagnosis',
          auth: true,
          body: {
            age: 'number',
            gender: 'string',
            sleepDuration: 'number',
            sleepQuality: 'number',
            stressLevel: 'number',
            physicalActivity: 'number',
            dailySteps: 'number',
            heartRate: 'number',
            bmiCategory: 'string',
            bloodPressure: 'string',
            log_to_neo4j: 'boolean'
          },
          response: {
            success: 'boolean',
            data: {
              diagnosis: 'string',
              insomnia_risk: 'string',
              apnea_risk: 'string',
              firedRules: 'array',
              recommendations: 'array'
            }
          }
        }
      ]
    },
    {
      group: 'History',
      color: 'purple',
      routes: [
        {
          method: 'GET',
          path: '/history/all',
          description: 'Get all screening history for authenticated user',
          auth: true,
          response: {
            success: 'boolean',
            data: 'array of screenings'
          }
        },
        {
          method: 'GET',
          path: '/history/:id',
          description: 'Get specific screening record details',
          auth: true,
          response: {
            success: 'boolean',
            data: {
              id: 'number',
              diagnosis: 'string',
              date: 'timestamp'
            }
          }
        }
      ]
    },
    {
      group: 'Analytics',
      color: 'orange',
      routes: [
        {
          method: 'GET',
          path: '/analytics/summary',
          description: 'Get analytics summary for authenticated user',
          auth: true,
          response: {
            success: 'boolean',
            data: {
              totalScreenings: 'number',
              insomnia_cases: 'number',
              apnea_cases: 'number'
            }
          }
        },
        {
          method: 'GET',
          path: '/analytics/graph',
          description: 'Get Neo4j graph analytics data',
          auth: true,
          response: {
            success: 'boolean',
            data: {
              cases: 'array',
              rules: 'array',
              patterns: 'array'
            }
          }
        }
      ]
    }
  ];

  const methodColors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'yellow',
    DELETE: 'red',
    PATCH: 'purple'
  };

  const allRoutes = endpoints.flatMap(group => 
    group.routes.map(route => ({ ...route, group: group.group, color: group.color }))
  );

  const currentEndpoint = allRoutes[selectedEndpoint];

  return (
    <div className="min-h-screen app-bg">
      {/* Header */}
      <div className="surface border-b border-app sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/showcase')}
                className="p-2 rounded-lg surface hover:bg-slate-200 transition-colors"
                title="Back to showcase"
              >
                <ArrowLeft className="w-5 h-5 text-secondary" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-primary">API Documentation</h1>
                <p className="text-xs text-secondary">Backend Endpoints Reference</p>
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
            REST API Reference
          </h2>
          <p className="text-secondary">
            Complete documentation of all available API endpoints
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardBody>
                <div className="space-y-2">
                  {endpoints.map((group) => (
                    <div key={group.group}>
                      <p className="text-xs font-semibold text-secondary px-3 py-2">
                        {group.group}
                      </p>
                      <div className="space-y-1">
                        {group.routes.map((route, idx) => {
                          const globalIdx = allRoutes.indexOf(
                            allRoutes.find(r => r.path === route.path && r.method === route.method)
                          );
                          return (
                            <button
                              key={`${group.group}-${idx}`}
                              onClick={() => setSelectedEndpoint(globalIdx)}
                              className={`w-full text-left px-3 py-2 rounded transition-colors text-xs ${
                                selectedEndpoint === globalIdx
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'text-secondary hover:bg-surface-secondary'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className={`text-${methodColors[route.method]}-400 font-bold text-xs`}>
                                  {route.method}
                                </span>
                                <span className="truncate text-xs">{route.path}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentEndpoint && (
              <motion.div
                key={selectedEndpoint}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Endpoint Header */}
                <Card>
                  <CardBody>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 bg-${methodColors[currentEndpoint.method]}-500/20 text-${methodColors[currentEndpoint.method]}-400 rounded text-sm font-bold`}>
                          {currentEndpoint.method}
                        </span>
                        <code className="block text-lg font-mono text-primary mt-2">
                          {currentEndpoint.path}
                        </code>
                      </div>
                      <div>
                        {currentEndpoint.auth && (
                          <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/10 rounded-lg">
                            <Lock className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-yellow-400">Auth Required</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-secondary">{currentEndpoint.description}</p>
                  </CardBody>
                </Card>

                {/* Request Body */}
                {currentEndpoint.body && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-primary flex items-center space-x-2">
                        <Code className="w-5 h-5" />
                        <span>Request Body</span>
                      </h3>
                    </CardHeader>
                    <CardBody>
                      <div className="bg-surface-secondary rounded-lg p-4 overflow-auto">
                        <code className="text-sm text-secondary font-mono whitespace-pre">
                          {JSON.stringify(currentEndpoint.body, null, 2)}
                        </code>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Response */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-primary flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Response (200 OK)</span>
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="bg-surface-secondary rounded-lg p-4 overflow-auto">
                      <code className="text-sm text-secondary font-mono whitespace-pre">
                        {JSON.stringify(currentEndpoint.response, null, 2)}
                      </code>
                    </div>
                  </CardBody>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-primary flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>Implementation Notes</span>
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <ul className="text-sm text-secondary space-y-2">
                      <li>• Base URL: <code className="text-blue-400">http://localhost:5000/api</code></li>
                      <li>• Authentication: JWT token in Authorization header</li>
                      <li>• Content-Type: application/json</li>
                      <li>• All responses follow standard format with success/data/error</li>
                    </ul>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/showcase')}
            title="Back to showcase"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => navigate('/components')}
            title="View components"
          >
            Components
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/welcome')}
            title="Go to welcome page"
          >
            Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default APIDocumentation;
