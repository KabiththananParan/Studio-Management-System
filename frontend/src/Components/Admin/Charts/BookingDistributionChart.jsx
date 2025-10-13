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
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className={`ml-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          🥧 Distribution Charts
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveChart('bookingTypes')}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              activeChart === 'bookingTypes'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Types
          </button>
          <button
            onClick={() => setActiveChart('bookingStatus')}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              activeChart === 'bookingStatus'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setActiveChart('packages')}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              activeChart === 'packages'
                ? 'bg-blue-500 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Packages
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
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
              Studio Revenue: <strong>LKR {Math.round(dashboardStats.revenue?.studio || 0).toLocaleString()}</strong>
            </span>
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-green-700'}`}>
              Rental Revenue: <strong>LKR {Math.round(dashboardStats.revenue?.inventory || 0).toLocaleString()}</strong>
            </span>
          </div>
        </div>
      )}

      {activeChart === 'packages' && packagePopularityData.length > 0 && (
        <div className="mt-4">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-purple-700'}`}>
              Most Popular: <strong>{packagePopularityData[0]?.name}</strong> ({packagePopularityData[0]?.value} bookings)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDistributionChart;