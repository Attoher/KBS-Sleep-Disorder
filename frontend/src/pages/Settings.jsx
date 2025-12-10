import React, { useState } from 'react';
import { Bell, Lock, User, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    soundAlerts: true,
    darkMode: true,
    dataCollection: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your preferences, notifications, and account security.</p>
        </div>
      </motion.div>

      {/* Account Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Account Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Email Verification</p>
                <p className="text-sm text-gray-400">Your account is verified</p>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">Verified</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Add extra security to your account</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                Enable
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications for screening results' },
              { key: 'soundAlerts', label: 'Sound Alerts', desc: 'Play sound when results are ready' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    settings[item.key] ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings[item.key] ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="w-6 h-6 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Dark Mode</p>
                <p className="text-sm text-gray-400">Always on for optimal viewing</p>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">Enabled</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Privacy & Data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Privacy & Data</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Analytics Collection</p>
                <p className="text-sm text-gray-400">Help improve the app with usage data</p>
              </div>
              <button
                onClick={() => handleToggle('dataCollection')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.dataCollection ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.dataCollection ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <p className="font-medium text-white mb-2">Data & Privacy</p>
              <p className="text-sm text-gray-400 mb-4">Your screening data is encrypted and stored securely. We never share your data with third parties.</p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Read our Privacy Policy →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
