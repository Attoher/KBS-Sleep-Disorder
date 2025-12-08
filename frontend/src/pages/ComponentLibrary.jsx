import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Code,
  Palette
} from 'lucide-react';
import Button from '../components/Common/Button';
import Card, { CardHeader, CardBody } from '../components/Common/Card';
import ThemeToggle from '../components/Common/ThemeToggle';

const ComponentLibrary = () => {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const components = [
    {
      name: 'Button',
      path: '../components/Common/Button.jsx',
      variants: ['primary', 'secondary', 'outline'],
      description: 'Main action button with multiple variants and loading states',
      example: '<Button type="submit">Submit</Button>',
      props: ['variant', 'size', 'loading', 'disabled', 'title', 'aria-label']
    },
    {
      name: 'Card',
      path: '../components/Common/Card.jsx',
      description: 'Container component with header and body sections',
      example: '<Card><CardBody>Content</CardBody></Card>',
      props: ['hover', 'className']
    },
    {
      name: 'ThemeToggle',
      path: '../components/Common/ThemeToggle.jsx',
      description: 'Theme switcher for light/dark mode',
      example: '<ThemeToggle />',
      props: []
    },
    {
      name: 'Loader',
      path: '../components/Common/Loader.jsx',
      description: 'Loading spinner animation',
      example: '<Loader />',
      props: ['size', 'color']
    },
    {
      name: 'Header',
      path: '../components/Layout/Header.jsx',
      description: 'Top navigation with user menu and theme toggle',
      example: '<Header />',
      props: []
    },
    {
      name: 'Sidebar',
      path: '../components/Layout/Sidebar.jsx',
      description: 'Left sidebar navigation for main app',
      example: '<Sidebar />',
      props: []
    },
    {
      name: 'Layout',
      path: '../components/Layout/Layout.jsx',
      description: 'Main app layout wrapper with header and sidebar',
      example: '<Layout><Outlet /></Layout>',
      props: []
    },
    {
      name: 'PrivateRoute',
      path: '../components/PrivateRoute.jsx',
      description: 'Route protection component with guest mode support',
      example: '<PrivateRoute allowGuest><Dashboard /></PrivateRoute>',
      props: ['allowGuest', 'children']
    }
  ];

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
                <h1 className="text-xl font-bold text-primary">Component Library</h1>
                <p className="text-xs text-secondary">Reusable UI Components</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-purple-400" />
              <ThemeToggle />
            </div>
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
            Component Documentation
          </h2>
          <p className="text-secondary">
            Explore all available components and their usage patterns
          </p>
        </motion.div>

        {/* Components Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {components.map((comp, index) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-primary">{comp.name}</h3>
                      <code className="text-xs text-secondary mt-1">{comp.path}</code>
                    </div>
                    <Code className="w-5 h-5 text-blue-400" />
                  </div>
                </CardHeader>

                <CardBody>
                  <p className="text-secondary text-sm mb-4">{comp.description}</p>

                  {/* Example */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-secondary mb-2">Example:</p>
                    <div className="p-3 surface-secondary rounded-lg border border-app">
                      <code className="text-xs text-primary font-mono break-words">
                        {comp.example}
                      </code>
                      <button
                        onClick={() => copyToClipboard(comp.example, index)}
                        className="float-right mt-1"
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-secondary hover:text-primary transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Props */}
                  {comp.props.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-secondary mb-2">Props:</p>
                      <div className="flex flex-wrap gap-2">
                        {comp.props.map((prop) => (
                          <span
                            key={prop}
                            className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-mono"
                          >
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Styling System Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h3 className="font-bold text-primary">Styling System</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary mb-2">Theme Variables</h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 surface-secondary rounded-lg">
                      <p className="text-xs text-secondary">Primary Text</p>
                      <p className="text-primary font-semibold">var(--text-primary)</p>
                    </div>
                    <div className="p-3 surface-secondary rounded-lg">
                      <p className="text-xs text-secondary">Secondary Text</p>
                      <p className="text-secondary font-semibold">var(--text-secondary)</p>
                    </div>
                    <div className="p-3 surface-secondary rounded-lg">
                      <p className="text-xs text-secondary">Background</p>
                      <p className="text-primary font-semibold">var(--bg-primary)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-primary mb-2">Surface Classes</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li><code className="text-blue-400">.surface</code> - Main container background</li>
                    <li><code className="text-blue-400">.surface-secondary</code> - Secondary container</li>
                    <li><code className="text-blue-400">.surface-muted</code> - Muted/subtle background</li>
                    <li><code className="text-blue-400">.input-surface</code> - Input field styling</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-primary mb-2">Utility Classes</h4>
                  <ul className="text-sm text-secondary space-y-1">
                    <li><code className="text-blue-400">.app-bg</code> - Full page background</li>
                    <li><code className="text-blue-400">.text-primary</code> - Primary text color</li>
                    <li><code className="text-blue-400">.text-secondary</code> - Secondary text color</li>
                    <li><code className="text-blue-400">.border-app</code> - App-wide border color</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/showcase')}
            title="Back to showcase"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Showcase
          </Button>
          <Button
            onClick={() => navigate('/api-docs')}
            title="View API documentation"
          >
            API Docs
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

export default ComponentLibrary;
