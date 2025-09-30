import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Camera, History, CreditCard } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PhotoStudio Pro</h1>
              <p className="text-sm text-gray-600">Professional Photography Studios & Equipment</p>
            </div>
          </Link>
          
          <nav className="flex space-x-1">
            {[
              { path: '/', label: 'Studio Packages', icon: Camera },
              { path: '/history', label: 'Payment History', icon: History },
              { path: '/refunds', label: 'Refunds', icon: CreditCard }
            ].map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActiveRoute(path)
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

// PropTypes validation
Header.propTypes = {
  // No props needed with React Router
};

export default Header;