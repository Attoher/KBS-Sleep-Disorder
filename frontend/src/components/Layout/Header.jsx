import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Bell, BellOff, User, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // Get from localStorage
    const saved = localStorage.getItem('notificationsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  const handleBellToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      toast.success('Notifications enabled', {
        icon: <CheckCircle size={20} />,
        duration: 2000,
      });
    } else {
      toast('Notifications disabled', {
        icon: <XCircle size={20} />,
        duration: 2000,
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 surface-muted">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sleep Health KBS
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/showcase"
              className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg surface border border-app hover:border-blue-500 transition-all text-sm"
              title="View UI Showcase"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-secondary">Showcase</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg surface border border-app transition-colors"
              aria-label="Toggle color theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            <button
              onClick={handleBellToggle}
              className={`p-2 rounded-lg border transition-colors relative ${
                notificationsEnabled 
                  ? 'surface border-app hover:border-blue-500' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
              aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              title={notificationsEnabled ? 'Click to disable notifications' : 'Click to enable notifications'}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="w-5 h-5 text-blue-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                </>
              ) : (
                <BellOff className="w-5 h-5 text-gray-500" />
              )}
            </button>

            <div className="relative group">
              <button className="flex items-center space-x-3 p-2 rounded-lg surface border border-app transition-colors">
                <div className="w-8 h-8 pill rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-primary">{user?.name || 'User'}</p>
                  <p className="text-xs text-secondary">{user?.email || 'user@example.com'}</p>
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 surface shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-secondary hover:bg-slate-100 hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/history"
                    className="block px-4 py-2 text-sm text-secondary hover:bg-slate-100 hover:text-primary"
                  >
                    History
                  </Link>
                  <Link
                    to="/showcase"
                    className="block px-4 py-2 text-sm text-secondary hover:bg-slate-100 hover:text-primary md:hidden"
                  >
                    🎨 UI Showcase
                  </Link>
                  <div className="border-t border-app my-1"></div>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;