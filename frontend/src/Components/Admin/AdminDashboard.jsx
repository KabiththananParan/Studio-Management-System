import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UsersTable from './UsersTable';
import PackagesTable from './PackagesTable';
import SlotsTable from './SlotsTable';
import AdminBookings from './AdminBookings';
import AdminRefunds from './AdminRefunds';
import AdminReviews from './AdminReviews';
import AdminComplaints from './AdminComplaints';
import AdminInventory from './AdminInventory';
import AdminInventoryBookings from './AdminInventoryBookings';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    users: { total: 0, verified: 0, unverified: 0 },
    packages: { total: 0, active: 0, inactive: 0 },
    bookings: { total: 0, completed: 0, cancelled: 0, pending: 0 },
    revenue: { total: 0, averageBookingValue: 0 },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard/stats", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      setDashboardStats(res.data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch dashboard statistics.");
      }
      setLoading(false);
    }
  };

  // Load theme preference from localStorage and fetch stats on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    fetchDashboardStats();
  }, []);

  // Save theme preference to localStorage when changed
  useEffect(() => {
    localStorage.setItem('adminTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/admin-login';
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'users':
        return <UsersTable />;
      case 'packages':
        return <PackagesTable />;
      case 'slots':
        return <SlotsTable />;
      case 'refunds':
        return <AdminRefunds />;
      case 'reviews':
        return <AdminReviews />;
      case 'complaints':
        return <AdminComplaints />;
      case 'inventory':
        return <AdminInventory />;
      case 'inventory-bookings':
        return <AdminInventoryBookings isDarkMode={isDarkMode} />;
      case 'dashboard':
        if (loading) {
          return (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className={`ml-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Loading dashboard...</span>
            </div>
          );
        }

        if (error) {
          return (
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
              <p className="text-red-500">{error}</p>
              {error.includes("log in again") && (
                <button 
                  onClick={() => window.location.href = "/admin-login"}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Go to Login
                </button>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{dashboardStats.users.total}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dashboardStats.users.verified} verified • {dashboardStats.users.unverified} unverified
                    </p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Packages</h3>
                    <p className="text-3xl font-bold text-green-600">{dashboardStats.packages.total}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {dashboardStats.packages.active} active • {dashboardStats.packages.inactive} inactive
                    </p>
                  </div>
                  <div className="text-4xl">📦</div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>All Bookings</h3>
                    <p className="text-3xl font-bold text-purple-600">{dashboardStats.bookings.total}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Studio: {dashboardStats.bookings.studio?.total || 0} • Rentals: {dashboardStats.bookings.inventory?.total || 0}
                    </p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">${dashboardStats.revenue.total}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Studio: ${dashboardStats.revenue.studio || 0} • Rentals: ${dashboardStats.revenue.inventory || 0}
                    </p>
                  </div>
                  <div className="text-4xl">�</div>
                </div>
              </div>
            </div>

            {/* Revenue and Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Booking Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Studio Bookings:</span>
                    <span className="font-bold text-purple-600">{dashboardStats.bookings.studio?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Equipment Rentals:</span>
                    <span className="font-bold text-indigo-600">{dashboardStats.bookings.inventory?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed:</span>
                    <span className="font-bold text-green-600">{dashboardStats.bookings.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cancelled:</span>
                    <span className="font-bold text-red-600">{dashboardStats.bookings.cancelled}</span>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition"
                  >
                    Manage Users →
                  </button>
                  <button 
                    onClick={() => setActiveTab('packages')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-800 transition"
                  >
                    Manage Packages →
                  </button>
                  <button 
                    onClick={() => setActiveTab('slots')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition"
                  >
                    Manage Slots →
                  </button>
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 transition"
                  >
                    View Bookings →
                  </button>
                  <button 
                    onClick={() => setActiveTab('refunds')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 transition"
                  >
                    Manage Refunds →
                  </button>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-800 transition"
                  >
                    Manage Reviews →
                  </button>
                  <button 
                    onClick={() => setActiveTab('complaints')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 transition"
                  >
                    Handle Complaints →
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 transition"
                  >
                    Manage Inventory →
                  </button>
                  <button 
                    onClick={() => setActiveTab('inventory-bookings')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 transition"
                  >
                    Inventory Bookings →
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 transition"
                  >
                    ⚙️ System Settings →
                  </button>
                  <button 
                    onClick={fetchDashboardStats}
                    className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
                  >
                    🔄 Refresh Stats
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'bookings':
        return <AdminBookings isDarkMode={isDarkMode} />;
      case 'settings':
        return <AdminSettings isDarkMode={isDarkMode} />;
      default:
        return (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-900'} p-6 rounded-2xl shadow-md border`}>
            <h2 className="text-xl font-bold mb-4">Welcome to Admin Dashboard</h2>
            <p>Select a menu item to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Welcome, Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm min-h-screen`}>
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'users'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👥 Users
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('packages')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'packages'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📦 Packages
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('slots')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'slots'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🕒 Slots
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'bookings'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📅 Bookings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('refunds')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'refunds'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💳 Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'reviews'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⭐ Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'complaints'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📋 Complaints
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'inventory'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏭 Inventory
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('inventory-bookings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'inventory-bookings'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📦 Equipment Rentals
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${
                    activeTab === 'settings'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Settings
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
