import React, { useState, useEffect } from 'react';

const UserInventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 10
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Payment Due': 'bg-orange-100 text-orange-800',
    'Paid': 'bg-green-100 text-green-800',
    'Equipment Ready': 'bg-purple-100 text-purple-800',
    'Checked Out': 'bg-indigo-100 text-indigo-800',
    'In Use': 'bg-cyan-100 text-cyan-800',
    'Returned': 'bg-teal-100 text-teal-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Overdue': 'bg-red-100 text-red-800'
  };

  const paymentStatusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Partial': 'bg-orange-100 text-orange-800',
    'Paid': 'bg-green-100 text-green-800',
    'Refunded': 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, filters, pagination.current]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`http://localhost:5000/api/user/inventory-bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data.bookings);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination.total,
        totalBookings: data.data.pagination.totalBookings
      }));
    } catch (error) {
      setError('Failed to fetch inventory bookings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/user/inventory-bookings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      setError('Failed to fetch statistics');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePayment = async (bookingId) => {
    // Redirect to payment page or show payment modal
    // For now, we'll just show a message
    setSuccess(`Redirecting to payment for booking ${bookingId}`);
    
    // In a real implementation, you would integrate with the payment system
    // window.location.href = `/payment?bookingId=${bookingId}&type=inventory`;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Cancellation fees may apply.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const reason = prompt('Please provide a reason for cancellation (optional):');
      
      const response = await fetch(`http://localhost:5000/api/user/inventory-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const data = await response.json();
      setSuccess(`Booking cancelled successfully. Refund amount: ${formatCurrency(data.data.refundAmount)}`);
      fetchBookings(); // Refresh the list
    } catch (error) {
      setError(error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canPayNow = (booking) => {
    return ['Payment Due', 'Confirmed'].includes(booking.status) && 
           booking.paymentStatus !== 'Paid';
  };

  const canCancel = (booking) => {
    return ['Pending', 'Confirmed', 'Payment Due'].includes(booking.status) &&
           new Date(booking.bookingDates.startDate) > new Date(Date.now() + 24 * 60 * 60 * 1000);
  };

  if (loading && (bookings.length === 0 || !stats)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Equipment Rentals</h1>
              <p className="text-gray-600 mt-1">Manage your inventory bookings and payments</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/inventory-browse'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Equipment
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError('')} className="float-right ml-2">×</button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            <button onClick={() => setSuccess('')} className="float-right ml-2">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'bookings', name: 'My Bookings', icon: '📋' },
                { id: 'stats', name: 'Statistics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'bookings' && (
              <>
                {/* Filters */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Payment Due">Payment Due</option>
                        <option value="Paid">Paid</option>
                        <option value="In Use">In Use</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                      <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                          const [sortBy, sortOrder] = e.target.value.split('-');
                          setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="bookingDates.startDate-desc">Start Date (Latest)</option>
                        <option value="bookingDates.startDate-asc">Start Date (Earliest)</option>
                        <option value="pricing.total-desc">Amount (High-Low)</option>
                        <option value="pricing.total-asc">Amount (Low-High)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Booking #{booking.bookingId}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                              {booking.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                              {booking.paymentStatus}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Created: {formatDateTime(booking.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(booking.pricing.total)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Paid: {formatCurrency(booking.paymentInfo.paidAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Rental Period */}
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Rental Period</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Start Date:</span>
                            <p className="font-medium">{formatDate(booking.bookingDates.startDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">End Date:</span>
                            <p className="font-medium">{formatDate(booking.bookingDates.endDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p className="font-medium">{booking.bookingDates.duration} days</p>
                          </div>
                        </div>
                      </div>

                      {/* Equipment Items */}
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Equipment ({booking.items.length} items)</h4>
                        <div className="space-y-2">
                          {booking.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div>
                                <p className="font-medium text-gray-900">{item.inventory.name}</p>
                                <p className="text-sm text-gray-600">
                                  {item.inventory.brand} {item.inventory.model} × {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                                <p className="text-sm text-gray-600">
                                  {formatCurrency(item.dailyRate)}/day
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Pricing</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>{formatCurrency(booking.pricing.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span>{formatCurrency(booking.pricing.tax)}</span>
                          </div>
                          {booking.pricing.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Discount:</span>
                              <span className="text-green-600">-{formatCurrency(booking.pricing.discount)}</span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between font-medium">
                              <span>Total:</span>
                              <span>{formatCurrency(booking.pricing.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {canPayNow(booking) && (
                          <button
                            onClick={() => handlePayment(booking._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Pay Now ({formatCurrency(booking.paymentInfo.remainingAmount)})
                          </button>
                        )}
                        
                        {canCancel(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Cancel Booking
                          </button>
                        )}

                        <button
                          onClick={() => {/* View details */}}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Details
                        </button>

                        {booking.status === 'Completed' && (
                          <button
                            onClick={() => {/* Download invoice */}}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            Download Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {bookings.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600 mb-4">You haven't made any equipment rental bookings yet.</p>
                    <button
                      onClick={() => window.location.href = '/inventory-browse'}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Equipment
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.current * pagination.limit, pagination.totalBookings)} of{' '}
                      {pagination.totalBookings} bookings
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                        disabled={pagination.current === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium">
                        {pagination.current} / {pagination.total}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                        disabled={pagination.current === pagination.total}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📋</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.stats.totalBookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✅</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.stats.activeBookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">💰</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Spent</p>
                        <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.stats.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📊</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Avg. Booking Value</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(stats.stats.averageBookingValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                {stats.recentBookings && stats.recentBookings.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Booking ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rental Period
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stats.recentBookings.map((booking) => (
                            <tr key={booking._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {booking.bookingId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(booking.bookingDates.startDate)} - {formatDate(booking.bookingDates.endDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(booking.pricing.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(booking.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInventoryDashboard;