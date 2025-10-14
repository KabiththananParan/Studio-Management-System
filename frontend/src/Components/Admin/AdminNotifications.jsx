import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AdminNotifications = ({ isDarkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCounts, setNotificationCounts] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/admin/notifications", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      setNotifications(response.data.notifications);
      setNotificationCounts(response.data.counts);
      setError("");
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");
    
    try {
      await axios.put(`http://localhost:5000/api/admin/notifications/${notificationId}/read`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      // Update local state - mark as read instead of removing
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
      
      // Update counts to reflect the change
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length === 0) return;
    
    try {
      await axios.put("http://localhost:5000/api/admin/notifications/mark-all-read", {
        notificationIds: unreadNotifications.map(n => n.id)
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setNotificationCounts(prev => ({ ...prev, total: 0 }));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    fetchNotifications(); // Initial load
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get notification color based on type
  const getNotificationColor = (type, color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colors[color] || colors.blue;
  };

  // Get time ago string
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get priority indicator
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 animate-pulse';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
          isDarkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        } ${notificationCounts.total > 0 ? 'animate-pulse' : ''}`}
        title="View Notifications"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        
        {/* Notification Badge */}
        {notificationCounts.total > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-bounce">
            {notificationCounts.total > 99 ? '99+' : notificationCounts.total}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 rounded-2xl shadow-2xl z-50 border-2 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        } max-h-96 overflow-hidden`}>
          {/* Header */}
          <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Notifications
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Refresh"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    title="Mark All as Read"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            {notificationCounts.total > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {notificationCounts.high_priority > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    🚨 {notificationCounts.high_priority} urgent
                  </span>
                )}
                {notificationCounts.payments > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    💳 {notificationCounts.payments} payments
                  </span>
                )}
                {notificationCounts.complaints > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                    ⚠️ {notificationCounts.complaints} complaints
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">🔔</div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-opacity-50 transition-colors group ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${notification.isRead ? 'opacity-60' : ''} ${!notification.isRead ? 'border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${getNotificationColor(notification.type, notification.color)} flex items-center justify-center text-white font-medium relative`}>
                        <span className="text-lg">{notification.icon}</span>
                        {/* Priority Indicator */}
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityStyle(notification.priority)}`}></div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {getTimeAgo(notification.timestamp)}
                            </p>
                            {!notification.isRead ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className={`opacity-0 group-hover:opacity-100 p-1 rounded-full transition-all ${
                                  isDarkMode 
                                    ? 'hover:bg-gray-600 text-gray-400' 
                                    : 'hover:bg-gray-200 text-gray-600'
                                }`}
                                title="Mark as read"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            ) : (
                              <div className="p-1">
                                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        
                        {/* Details */}
                        {notification.details && (
                          <div className="mt-2 text-xs space-y-1">
                            {notification.details.amount && (
                              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Amount: <span className="font-medium">LKR {notification.details.amount.toLocaleString()}</span>
                              </div>
                            )}
                            {notification.details.bookingId && (
                              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Booking: <span className="font-medium">{notification.details.bookingId}</span>
                              </div>
                            )}
                            {notification.details.rating && (
                              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Rating: <span className="font-medium">{'⭐'.repeat(notification.details.rating)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`p-3 border-t text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                } transition-colors`}
              >
                Close Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;