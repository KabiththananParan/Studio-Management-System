import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const BookingTrendsChart = ({ isDarkMode }) => {
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrendsData();
  }, []);

  const fetchTrendsData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/admin/dashboard/trends", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      // Format data for the chart
      const formattedData = response.data.map(item => ({
        month: `${getMonthName(item._id.month)} ${item._id.year}`,
        bookings: item.count,
        revenue: Math.round(item.revenue),
        avgRevenue: Math.round(item.revenue / item.count) || 0
      }));
      
      setTrendsData(formattedData);
      setError("");
    } catch (err) {
      console.error("Error fetching trends data:", err);
      setError(err.response?.data?.message || "Failed to fetch trends data");
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1];
  };

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className={`ml-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Loading chart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          📈 Booking Trends (Last 6 Months)
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-gray-600' 
        : 'bg-gradient-to-br from-white via-blue-50 to-white border-blue-200'
    } border-2`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} flex items-center space-x-3`}>
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-green-500">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span>Booking Trends (Last 6 Months)</span>
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-800'
          }`}>
            📊 Analytics
          </div>
        </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
            />
            <XAxis 
              dataKey="month" 
              tick={{ fill: isDarkMode ? '#d1d5db' : '#374151', fontSize: 12 }}
              stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
            />
            <YAxis 
              yAxisId="bookings"
              tick={{ fill: isDarkMode ? '#d1d5db' : '#374151', fontSize: 12 }}
              stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="right"
              tick={{ fill: isDarkMode ? '#d1d5db' : '#374151', fontSize: 12 }}
              stroke={isDarkMode ? '#6b7280' : '#9ca3af'}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#f3f4f6' : '#111827'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `LKR ${value.toLocaleString()}` : value,
                name === 'bookings' ? 'Bookings' : 'Revenue (LKR)'
              ]}
            />
            <Legend 
              wrapperStyle={{ color: isDarkMode ? '#d1d5db' : '#374151' }}
            />
            <Line 
              yAxisId="bookings"
              type="monotone" 
              dataKey="bookings" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
              name="Bookings"
            />
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
        {trendsData.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50/70'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-600' : 'border-blue-200'}`}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-700'} flex items-center space-x-2`}>
                <span className="text-blue-500">📊</span>
                <span>Total Bookings: <strong className="text-lg">{trendsData.reduce((sum, item) => sum + item.bookings, 0)}</strong></span>
              </span>
            </div>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-green-50/70'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-600' : 'border-green-200'}`}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-green-700'} flex items-center space-x-2`}>
                <span className="text-green-500">💰</span>
                <span>Total Revenue: <strong className="text-lg">LKR {trendsData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}</strong></span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTrendsChart;