import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Job Listings', path: '/dashboard/jobs' },
    { name: 'Applications', path: '/dashboard/applications' },
    { name: 'Resume AI', path: '/dashboard/resume' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 min-h-[calc(100vh-4rem)] pt-6">
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary-900/50 text-primary-400 border-l-4 border-primary-500'
                  : 'text-gray-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
