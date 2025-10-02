import React, { useState, useEffect } from 'react';

const AdminInventoryBookings = ({ isDarkMode }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [overdueBookings, setOverdueBookings] = useState([]);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    limit: 10
  });
  
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'cancel'
  const [activeTab, setActiveTab] = useState('bookings');

  // Status options
  const statusOptions = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const paymentStatusOptions = ['Pending', 'Paid', 'Failed'];

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      });

      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key] || filters[key] === 'all') {
          params.delete(key);
        }
      });

      const response = await fetch(`http://localhost:5000/api/admin/inventory-bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();
      setBookings(data.bookings);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch inventory bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/inventory-bookings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch overdue bookings
  const fetchOverdueBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/inventory-bookings/overdue', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOverdueBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching overdue bookings:', err);
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/inventory-bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update booking');

      const data = await response.json();
      setShowModal(false);
      fetchBookings();
      alert('Booking updated successfully!');
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Failed to update booking');
    }
  };

  // Cancel booking
  const cancelBooking = async (bookingId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/inventory-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }

      setShowModal(false);
      fetchBookings();
      alert('Booking cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(`Failed to cancel booking: ${err.message}`);
    }
  };

  // Export bookings
  const exportBookings = async (format = 'json') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ format, ...filters });
      
      Object.keys(filters).forEach(key => {
        if (!filters[key] || filters[key] === 'all') {
          params.delete(key);
        }
      });

      const response = await fetch(`http://localhost:5000/api/admin/inventory-bookings/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to export bookings');

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory-bookings.csv';
        a.click();
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory-bookings.json';
        a.click();
      }

      alert('Bookings exported successfully!');
    } catch (err) {
      console.error('Error exporting bookings:', err);
      alert('Failed to export bookings');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-LK');
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Initialize data
  useEffect(() => {
    fetchBookings();
    fetchStats();
    if (activeTab === 'overdue') {
      fetchOverdueBookings();
    }
  }, [pagination.currentPage, filters, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          Inventory Bookings Management
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => exportBookings('json')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            Export JSON
          </button>
          <button
            onClick={() => exportBookings('csv')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Total Bookings</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.overview.totalBookings}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.overview.pendingBookings}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Completed</h3>
                <p className="text-2xl font-bold text-green-600">{stats.overview.completedBookings}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Revenue</h3>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.overview.totalRevenue)}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border`}>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'bookings', name: 'All Bookings', icon: '📋' },
              { id: 'overdue', name: 'Overdue', icon: '⚠️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
                {tab.id === 'overdue' && overdueBookings.length > 0 && (
                  <span className="ml-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                    {overdueBookings.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'bookings' && (
            <>
              {/* Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Payment Status</option>
                  {paymentStatusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />

                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className={`px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />

                <button
                  onClick={() => {
                    setFilters({
                      status: 'all',
                      paymentStatus: 'all',
                      search: '',
                      startDate: '',
                      endDate: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    });
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className={`px-4 py-2 border rounded-lg transition ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Reset
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Bookings Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading bookings...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Booking Details
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Customer
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Items & Duration
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Status
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Amount
                          </th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                        {bookings.map((booking) => (
                          <tr key={booking._id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                            <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              <div>
                                <p className="font-semibold">{booking.bookingId}</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.createdAt)}
                                </p>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              <div>
                                <p className="font-medium">{booking.customerInfo.name}</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {booking.customerInfo.email}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {booking.customerInfo.phone}
                                </p>
                              </div>
                            </td>
                            <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              <div>
                                <div className="space-y-1">
                                  {booking.items.map((item, index) => (
                                    <p key={index} className="text-sm">
                                      {item.inventory.name} (x{item.quantity})
                                    </p>
                                  ))}
                                </div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {formatDate(booking.bookingDates.startDate)} - {formatDate(booking.bookingDates.endDate)}
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {booking.bookingDates.duration} days
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                                <br />
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                  {booking.paymentStatus}
                                </span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                              <p className="font-semibold">{formatCurrency(booking.pricing.total)}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setModalType('view');
                                  setShowModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setModalType('edit');
                                  setShowModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Edit
                              </button>
                              {!['Cancelled', 'Completed'].includes(booking.status) && (
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setModalType('cancel');
                                    setShowModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Showing page {pagination.currentPage} of {pagination.totalPages} 
                        ({pagination.totalBookings} total bookings)
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
                          disabled={pagination.currentPage === 1}
                          className={`px-3 py-1 rounded ${
                            pagination.currentPage === 1
                              ? isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className={`px-3 py-1 rounded ${
                            pagination.currentPage === pagination.totalPages
                              ? isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === 'overdue' && (
            <div className="space-y-4">
              {overdueBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    No Overdue Bookings
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    All equipment has been returned on time!
                  </p>
                </div>
              ) : (
                overdueBookings.map((booking) => (
                  <div key={booking._id} className={`${isDarkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} p-4 rounded-lg border`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>
                            {booking.bookingId}
                          </h3>
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">OVERDUE</span>
                        </div>
                        <p className={`${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                          Customer: {booking.customerInfo.name} ({booking.customerInfo.email})
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          Expected return: {formatDate(booking.bookingDates.endDate)}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          Items: {booking.items.map(item => `${item.inventory.name} (${item.inventory.serialNumber})`).join(', ')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setModalType('edit');
                          setShowModal(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Contact Customer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing/editing bookings */}
      {showModal && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          type={modalType}
          onClose={() => {
            setShowModal(false);
            setSelectedBooking(null);
          }}
          onUpdate={updateBookingStatus}
          onCancel={cancelBooking}
          isDarkMode={isDarkMode}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ booking, type, onClose, onUpdate, onCancel, isDarkMode, formatCurrency, formatDate }) => {
  const [formData, setFormData] = useState({
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    adminNotes: booking.notes?.adminNotes || ''
  });
  const [cancelReason, setCancelReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'cancel') {
      onCancel(booking._id, cancelReason);
    } else if (type === 'edit') {
      onUpdate(booking._id, formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {type === 'view' ? 'Booking Details' : 
             type === 'edit' ? 'Edit Booking' : 'Cancel Booking'}
          </h3>
          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-gray-800`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {type === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Booking ID:</strong>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{booking.bookingId}</p>
              </div>
              <div>
                <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Status:</strong>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{booking.status}</p>
              </div>
              <div>
                <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Customer:</strong>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{booking.customerInfo.name}</p>
              </div>
              <div>
                <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Email:</strong>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{booking.customerInfo.email}</p>
              </div>
              <div>
                <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Phone:</strong>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{booking.customerInfo.phone}</p>
              </div>
              <div>
                <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Payment Status:</strong>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{booking.paymentStatus}</p>
              </div>
            </div>
            
            <div>
              <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Items:</strong>
              <div className="mt-2 space-y-2">
                {booking.items.map((item, index) => (
                  <div key={index} className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}>
                    <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                      {item.inventory.name} - {item.inventory.brand} {item.inventory.model}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Quantity: {item.quantity} | Rate: {formatCurrency(item.dailyRate)}/day | 
                      Subtotal: {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Rental Period:</strong>
              <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                {formatDate(booking.bookingDates.startDate)} to {formatDate(booking.bookingDates.endDate)}
                ({booking.bookingDates.duration} days)
              </p>
            </div>

            <div>
              <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total Amount:</strong>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {formatCurrency(booking.pricing.total)}
              </p>
            </div>

            {booking.notes?.adminNotes && (
              <div>
                <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Admin Notes:</strong>
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{booking.notes.adminNotes}</p>
              </div>
            )}
          </div>
        ) : type === 'cancel' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
                rows={3}
                placeholder="Please provide a reason for cancellation..."
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Admin Notes
              </label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => setFormData({...formData, adminNotes: e.target.value})}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 border rounded-lg ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Update Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminInventoryBookings;