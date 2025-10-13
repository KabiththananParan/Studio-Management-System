import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const BookingDistributionChart = ({ isDarkMode, dashboardStats }) => {
  const [packageStats, setPackageStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('bookingTypes'); // 'bookingTypes' or 'packages'

  useEffect(() => {
    fetchPackageStats();
  }, []);

  const fetchPackageStats = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/admin/dashboard/package-stats", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      setPackageStats(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching package stats:", err);
      setError(err.response?.data?.message || "Failed to fetch package statistics");
    } finally {
      setLoading(false);
    }
  };

  // Colors for the pie chart
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

  // Prepare booking types data
  const bookingTypesData = dashboardStats ? [
    { 
      name: 'Studio Bookings', 
      value: dashboardStats.bookings?.studio?.total || 0,
      color: '#3b82f6'
    },
    { 
      name: 'Equipment Rentals', 
      value: dashboardStats.bookings?.inventory?.total || 0,
      color: '#10b981'
    }
  ].filter(item => item.value > 0) : [];

  // Prepare booking status data
  const bookingStatusData = dashboardStats ? [
    { 
      name: 'Completed', 
      value: dashboardStats.bookings?.completed || 0,
      color: '#10b981'
    },
    { 
      name: 'Pending', 
      value: dashboardStats.bookings?.pending || 0,
      color: '#f59e0b'
    },
    { 
      name: 'Cancelled', 
      value: dashboardStats.bookings?.cancelled || 0,
      color: '#ef4444'
    }
  ].filter(item => item.value > 0) : [];

  // Prepare package popularity data
  const packagePopularityData = packageStats.slice(0, 6).map((pkg, index) => ({
    name: pkg.packageName || `Package ${index + 1}`,
    value: pkg.bookingCount,
    revenue: pkg.totalRevenue,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border`}>
          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data.name}
          </p>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Bookings: <strong>{data.value}</strong>
          </p>
          {data.revenue && (
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Revenue: <strong>LKR {Math.round(data.revenue).toLocaleString()}</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    let data = [];
    let title = '';

    switch (activeChart) {
      case 'bookingTypes':
        data = bookingTypesData;
        title = 'Booking Types Distribution';
        break;
      case 'bookingStatus':
        data = bookingStatusData;
        title = 'Booking Status Distribution';
        break;
      case 'packages':
        data = packagePopularityData;
        title = 'Popular Packages';
        break;
      default:
        data = bookingTypesData;
        title = 'Booking Types Distribution';
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No data available for {title.toLowerCase()}
          </p>
        </div>
      );
    }

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading && activeChart === 'packages') {
    return (
      <div className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-600' 
          : 'bg-gradient-to-br from-white via-purple-50 to-white border-purple-200'
      } border-2`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className={`ml-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-600' 
        : 'bg-gradient-to-br from-white via-purple-50 to-white border-purple-200'
    } border-2`}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center space-x-3`}>
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Distribution Charts</span>
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveChart('bookingTypes')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                activeChart === 'bookingTypes'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              📊 Types
            </button>
            <button
              onClick={() => setActiveChart('bookingStatus')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                activeChart === 'bookingStatus'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              ⚡ Status
            </button>
            <button
              onClick={() => setActiveChart('packages')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                activeChart === 'packages'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              📦 Packages
            </button>
          </div>
        </div>

        {error && activeChart === 'packages' ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          renderChart()
        )}

        {/* Summary stats */}
        {activeChart === 'bookingTypes' && bookingTypesData.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50/70'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-600' : 'border-blue-200'}`}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-700'} flex items-center space-x-2`}>
                <span className="text-blue-500">🏢</span>
                <span>Studio Revenue: <strong className="text-lg">LKR {Math.round(dashboardStats.revenue?.studio || 0).toLocaleString()}</strong></span>
              </span>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-green-50/70'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-600' : 'border-green-200'}`}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-green-700'} flex items-center space-x-2`}>
                <span className="text-green-500">📦</span>
                <span>Rental Revenue: <strong className="text-lg">LKR {Math.round(dashboardStats.revenue?.inventory || 0).toLocaleString()}</strong></span>
              </span>
            </div>
          </div>
        )}

        {activeChart === 'packages' && packagePopularityData.length > 0 && (
          <div className="mt-6">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-purple-50/70'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-600' : 'border-purple-200'}`}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-purple-700'} flex items-center space-x-2`}>
                <span className="text-purple-500">🏆</span>
                <span>Most Popular: <strong className="text-lg">{packagePopularityData[0]?.name}</strong> ({packagePopularityData[0]?.value} bookings)</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDistributionChart;