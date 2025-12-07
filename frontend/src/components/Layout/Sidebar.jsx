import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Stethoscope,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/screening', icon: Stethoscope, label: 'New Screening' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800">
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-blue-300 border-l-4 border-blue-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800 text-gray-300'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </NavLink>
          
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800 text-gray-300'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
              }`
            }
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Help & Support</span>
          </NavLink>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;