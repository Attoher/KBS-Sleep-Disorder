import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Moon, Eye, LogIn, UserPlus, ArrowRight, Zap, Shield, Brain,
  Activity, TrendingUp, BarChart3, CheckCircle, AlertCircle, Clock, Database,
  Sparkles, Heart, Star, ChevronDown
} from 'lucide-react';
import ThemeToggle from '../components/Common/ThemeToggle';
import Button from '../components/Common/Button';
import ScrollReveal from '../components/Animations/ScrollReveal';
import TouristCard from '../components/Common/TouristCard';
import SocialIcons from '../components/Common/SocialIcons';

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Easter egg: Show when scrolled near bottom
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = windowHeight + window.scrollY >= documentHeight - 100;

      if (scrolledToBottom && !showEasterEgg) {
        setShowEasterEgg(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showEasterEgg]);

  const features = [
    {
      icon: Brain,
      title: 'Intelligent Rule Engine',
      description: 'Advanced medical algorithms with 40+ diagnostic rules for accurate sleep disorder detection.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Database,
      title: 'Dual Database Architecture',
      description: 'PostgreSQL for reliable data storage combined with Neo4j graph database for sophisticated rule tracking.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Activity,
      title: 'Real-time Analysis',
      description: 'Instant diagnosis with comprehensive risk assessment, providing immediate feedback on your sleep health.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track trends, patterns, and screening history with beautiful visualizations and actionable insights.',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const sampleResults = [
    {
      diagnosis: 'Healthy Sleep Pattern',
      insomniaRisk: 'low',
      apneaRisk: 'low',
      color: 'green',
      icon: CheckCircle
    },
    {
      diagnosis: 'Potential Insomnia',
      insomniaRisk: 'high',
      apneaRisk: 'low',
      color: 'orange',
      icon: AlertCircle
    },
    {
      diagnosis: 'Sleep Apnea Risk',
      insomniaRisk: 'low',
      apneaRisk: 'high',
      color: 'red',
      icon: AlertCircle
    }
  ];

  return (
    <div className="min-h-screen app-bg relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Sticky Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 100 ? 'glass shadow-lg' : ''
        }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img
                src="/sleeping_cat_icon_1765777114474.png"
                alt="Kumeowturu"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-primary">Kumeowturu</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 py-20 pt-28 pb-32">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <ScrollReveal animation="fade-up">
            <div className="text-center mb-24">
              {/* Logo & Title */}
              <div className="flex flex-col items-center mb-12">
                {/* Logo removed - text only */}

                <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-accent-primary via-purple-400 to-accent-secondary bg-clip-text text-transparent">
                    Kumeowturu
                  </span>
                </h1>

                <p className="text-xl sm:text-2xl md:text-3xl text-secondary/90 mb-6 max-w-3xl mx-auto leading-relaxed px-4">
                  Your Personal Sleep Health Companion
                </p>

                <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed px-4">
                  Advanced AI-powered sleep disorder diagnosis with intelligent rule-based analysis
                </p>
              </div>

              {/* Stats Badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center gap-2 px-6 py-3 glass rounded-2xl border border-accent-primary/20 hover-lift">
                  <Brain className="w-5 h-5 text-accent-primary" />
                  <span className="text-sm font-semibold text-primary">40+ Medical Rules</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 glass rounded-2xl border border-purple-500/20 hover-lift">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-semibold text-primary">Instant Results</span>
                </div>
                <div className="flex items-center gap-2 px-6 py-3 glass rounded-2xl border border-green-500/20 hover-lift">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold text-primary">Privacy First</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <Link to="/login">
                  <Button
                    variant="primary"
                    size="large"
                    className="px-10 py-4 rounded-2xl shadow-lg shadow-accent-primary/20 hover:shadow-xl hover:shadow-accent-primary/40 group"
                  >
                    <LogIn className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/showcase">
                  <Button
                    variant="outline"
                    size="large"
                    className="px-10 py-4 rounded-2xl border-2 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-purple-700/30 view-demo-hover transition-all group"
                  >
                    <Eye className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    View Demo
                  </Button>
                </Link>
              </div>

              {/* Scroll Indicator */}
              <div className="animate-bounce mt-12">
                <ChevronDown className="w-8 h-8 text-muted mx-auto" />
              </div>
            </div>
          </ScrollReveal>

          {/* Features Section with Tourist Cards */}
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="mb-32">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                  Why Choose Kumeowturu?
                </h2>
                <p className="text-secondary/80 max-w-2xl mx-auto px-4 text-lg">
                  Powered by cutting-edge technology and medical expertise
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <ScrollReveal key={feature.title} animation="scale" delay={index * 100}>
                    <TouristCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      gradient={feature.gradient}
                      className="h-80"
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Sample Results Section */}
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="mb-32">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                  Instant, Accurate Diagnosis
                </h2>
                <p className="text-secondary/80 max-w-2xl mx-auto px-4 text-lg">
                  Get comprehensive insights about your sleep health in seconds
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {sampleResults.map((result, index) => {
                  const Icon = result.icon;
                  return (
                    <ScrollReveal key={result.diagnosis} animation="fade-up" delay={index * 100}>
                      <div className="surface p-8 rounded-3xl border border-app hover-lift group">
                        <div className="flex items-start gap-4 mb-6">
                          <div className={`w-14 h-14 rounded-2xl bg-${result.color}-500/10 border border-${result.color}-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-7 h-7 text-${result.color}-400`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-primary mb-1">
                              {result.diagnosis}
                            </h3>
                            <p className="text-xs text-muted">Sample diagnosis</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 surface-muted rounded-xl">
                            <span className="text-sm font-medium text-secondary">Insomnia Risk</span>
                            <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${result.insomniaRisk === 'high'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                              }`}>
                              {result.insomniaRisk.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-4 surface-muted rounded-xl">
                            <span className="text-sm font-medium text-secondary">Sleep Apnea Risk</span>
                            <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${result.apneaRisk === 'high'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                              }`}>
                              {result.apneaRisk.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-app/30 flex items-center gap-2 text-muted">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">Results in seconds</span>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* How It Works */}
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="mb-32">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                  Simple 3-Step Process
                </h2>
                <p className="text-secondary/80 max-w-2xl mx-auto px-4 text-lg">
                  Get your personalized sleep health diagnosis in minutes
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                {[
                  {
                    step: '1',
                    title: 'Fill Screening Form',
                    desc: 'Answer simple questions about your sleep patterns, habits, and health history',
                    icon: Heart
                  },
                  {
                    step: '2',
                    title: 'AI Analysis',
                    desc: 'Our intelligent rule engine processes your data through 40+ medical diagnostic rules',
                    icon: Brain
                  },
                  {
                    step: '3',
                    title: 'Get Results',
                    desc: 'Receive detailed diagnosis with risk assessment, insights, and personalized recommendations',
                    icon: Star
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <ScrollReveal key={item.step} animation="scale" delay={index * 100}>
                      <div className="text-center group">
                        <div className="relative inline-block mb-6">
                          {/* Step number background */}
                          <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-accent-primary/30 group-hover:scale-110 transition-transform">
                            {item.step}
                          </div>
                          {/* Icon overlay */}
                          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-surface border-2 border-accent-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Icon className="w-5 h-5 text-accent-primary" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-primary mb-3">{item.title}</h3>
                        <p className="text-secondary/70 leading-relaxed px-4">{item.desc}</p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Quick Links Section Removed */}

          {/* Tech Stack */}
          <ScrollReveal animation="fade-up" delay={500}>
            <div className="mb-24 text-center">
              <p className="text-muted text-sm mb-8 font-semibold tracking-wider">BUILT WITH MODERN TECHNOLOGIES</p>
              <div className="flex flex-wrap justify-center gap-4">
                {['React 18', 'Vite 5', 'PostgreSQL', 'Neo4j', 'Express.js', 'Tailwind CSS', 'Framer Motion', 'Chart.js'].map((tech, index) => (
                  <ScrollReveal key={tech} animation="scale" delay={index * 50}>
                    <span className="px-6 py-3 surface border border-app rounded-2xl text-sm font-medium text-secondary hover:text-primary hover:border-accent-primary/30 transition-all hover-lift">
                      {tech}
                    </span>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Footer */}
          <ScrollReveal animation="fade-up" delay={600}>
            <div className="pt-16 border-t border-app/30">
              {/* Social Icons */}
              <div className="flex justify-center mb-12">
                <SocialIcons size="lg" />
              </div>

              {/* Links */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <a
                  href="https://github.com/Attoher/KBS-Sleep-Disorder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary/70 hover:text-accent-primary transition-colors text-sm font-medium"
                >
                  GitHub Repository
                </a>
                <Link to="/api-docs" className="text-secondary/70 hover:text-accent-primary transition-colors text-sm font-medium">
                  API Documentation
                </Link>
                <Link to="/help" className="text-secondary/70 hover:text-accent-primary transition-colors text-sm font-medium">
                  Help & Support
                </Link>
              </div>

              {/* Copyright */}
              <div className="text-center">
                <p className="text-secondary/60 text-sm mb-2">
                  © {new Date().getFullYear()} Kumeowturu. All rights reserved.
                </p>
                <p className="text-muted text-xs">
                  Medical-grade sleep disorder diagnosis platform
                </p>
              </div>

              {/* Easter Egg */}
              {showEasterEgg && (
                <div className="mt-12 text-center animate-fade-in-up">
                  {/* Light mode: Purple/Pink Pastel */}
                  <div className="inline-block p-6 rounded-3xl shadow-lg bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 dark:hidden">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <img
                        src="/shushing_cat_icon_1765777158750.png"
                        alt="Shh!"
                        className="w-16 h-16 object-contain animate-float"
                      />
                    </div>
                    <p className="text-sm font-medium text-accent-primary">
                      🐱 Shh... You found the secret! Sweet dreams! 😴
                    </p>
                  </div>
                  {/* Dark mode: Dark Glass Effect */}
                  <div className="hidden dark:inline-block p-6 rounded-3xl bg-gray-800/40 backdrop-filter backdrop-blur-xl easter-egg-border">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <img
                        src="/shushing_cat_icon_1765777158750.png"
                        alt="Shh!"
                        className="w-16 h-16 object-contain animate-float"
                      />
                    </div>
                    <p className="text-sm font-medium text-accent-primary">
                      🐱 Shh... You found the secret! Sweet dreams! 😴
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
