import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Bell, User, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleBell = () => {
    toast('Notifications will appear here soon.', {
      icon: '🔔',
      duration: 2500,
    });
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
              onClick={handleBell}
              className="p-2 rounded-lg surface border border-app transition-colors relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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