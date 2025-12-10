import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/screening', icon: Stethoscope, label: 'New Screening' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'pill text-white border-l-0'
        : 'text-secondary hover:bg-slate-100 hover:text-primary'
    }`;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 surface border-r border-app text-primary">
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.label}
                className={getNavLinkClass(item.path)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-app">
            <NavLink
              to="/settings"
              title="Settings"
              className={getNavLinkClass('/settings')}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </NavLink>
            
            <NavLink
              to="/help"
              title="Help & Support"
              className={getNavLinkClass('/help')}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help & Support</span>
            </NavLink>
          </div>
        </div>

        <div className="p-4 border-t border-app">
          <button
            onClick={logout}
            title="Logout"
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 surface border-t border-app flex justify-around px-2 py-2 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-secondary hover:text-primary'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium hidden xs:inline">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          title="Logout"
          className="flex flex-col items-center space-y-1 px-3 py-2 text-red-500 hover:text-red-600 transition-colors rounded-lg"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium hidden xs:inline">Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;