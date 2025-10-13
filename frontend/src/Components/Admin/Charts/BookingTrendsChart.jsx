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
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        📈 Booking Trends (Last 6 Months)
      </h3>
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
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
              Total Bookings: <strong>{trendsData.reduce((sum, item) => sum + item.bookings, 0)}</strong>
            </span>
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-green-700'}`}>
              Total Revenue: <strong>LKR {trendsData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTrendsChart;