import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserInventoryDashboard = ({ isDarkMode = false }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalSpent: 0
  });
  const [cancellingId, setCancellingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingBooking, setEditingBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your rentals');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/user/inventory-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const bookingList = data.data?.bookings || data.bookings || [];
        setBookings(bookingList);
        
        // Calculate stats
        const activeStatuses = ['Confirmed', 'Payment Due', 'Paid', 'Equipment Ready', 'Checked Out', 'In Use'];
        const completedStatuses = ['Returned', 'Completed'];
        
        setStats({
          totalBookings: bookingList.length,
          activeRentals: bookingList.filter(b => activeStatuses.includes(b.status)).length,
          completedRentals: bookingList.filter(b => completedStatuses.includes(b.status)).length,
          totalSpent: bookingList
            .filter(b => b.paymentStatus === 'Paid')
            .reduce((sum, b) => sum + (b.totalCost || 0), 0)
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('An error occurred while fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = (booking) => {
    // Navigate to dedicated rental payment page
    navigate('/rental-payment', {
      state: { bookingId: booking._id }
    });
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/user/inventory-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
        alert('✅ Booking cancelled successfully');
      } else {
        const errorData = await response.json();
        alert(`❌ ${errorData.message || 'Failed to cancel booking'}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleEditBooking = (booking) => {
    // Pre-populate the form with current booking data
    const startDate = booking.bookingDates?.startDate || booking.startDate;
    const endDate = booking.bookingDates?.endDate || booking.endDate;
    
    setEditingBooking({
      ...booking,
      newStartDate: startDate ? new Date(startDate).toISOString().split('T')[0] : '',
      newEndDate: endDate ? new Date(endDate).toISOString().split('T')[0] : '',
      newNotes: booking.notes?.userNotes || booking.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const updates = {
        startDate: editingBooking.newStartDate,
        endDate: editingBooking.newEndDate,
        notes: {
          userNotes: editingBooking.newNotes,
          specialRequirements: ''
        }
      };

      const response = await fetch(`http://localhost:5000/api/user/inventory-bookings/${editingBooking._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchBookings();
        setShowEditModal(false);
        setEditingBooking(null);
        alert('✅ Booking updated successfully');
      } else {
        const errorData = await response.json();
        alert(`❌ ${errorData.message || 'Failed to update booking'}`);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking. Please try again.');
    }
  };

  const handleDeleteBooking = (booking) => {
    setDeletingBooking(booking);
    setShowDeleteModal(true);
  };

  const confirmDeleteBooking = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/user/inventory-bookings/${deletingBooking._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchBookings();
        setShowDeleteModal(false);
        setDeletingBooking(null);
        alert('✅ Booking deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`❌ ${errorData.message || 'Failed to delete booking'}`);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready_for_pickup':
        return 'bg-indigo-100 text-indigo-800';
      case 'picked_up':
      case 'in_use':
        return 'bg-green-100 text-green-800';
      case 'returned':
      case 'inspected':
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') {
      // Show bookings with pending payments (not cancelled)
      return booking.paymentStatus === 'Pending' && booking.status !== 'Cancelled';
    }
    if (statusFilter === 'active') {
      return ['Confirmed', 'Payment Due', 'Paid', 'Equipment Ready', 'Checked Out', 'In Use'].includes(booking.status);
    }
    if (statusFilter === 'completed') {
      return ['Returned', 'Completed'].includes(booking.status);
    }
    if (statusFilter === 'cancelled') {
      return booking.status === 'Cancelled';
    }
    return booking.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            My Equipment Rentals
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your equipment bookings and rental history
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l5-5v5.5m0 0V14m0 0l5-2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Rentals
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Active Rentals
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeRentals}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Completed
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.completedRentals}
              </p>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Spent
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                LKR {stats.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Bookings' },
          { key: 'pending', label: 'Pending Payment' },
          { key: 'active', label: 'Active Rentals' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === filter.key
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l5-5v5.5m0 0V14m0 0l5-2" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              No Equipment Rentals
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              You haven't rented any equipment yet. Browse our catalog to get started!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Equipment Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Booking Info
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Rental Period
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Cost & Payment
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    {/* Equipment Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {booking.items?.[0]?.inventory?.images?.[0] && (
                          <img 
                            src={booking.items[0].inventory.images[0]} 
                            alt={booking.items[0].inventory.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1">
                          <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {booking.items?.map(item => item.inventory?.name).join(', ') || 'Equipment not found'}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.items?.[0]?.inventory?.brand} {booking.items?.[0]?.inventory?.model}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Category: {booking.items?.[0]?.inventory?.category}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Qty: {booking.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Booking Info */}
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.bookingId || booking.bookingNumber || 'N/A'}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Created: {formatDate(booking.createdAt)}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Customer: {booking.customerInfo?.name}
                        </div>
                        {booking.notes?.userNotes && (
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            📝 {booking.notes.userNotes}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Rental Period */}
                    <td className="px-6 py-4">
                      <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📅 {formatDate(booking.bookingDates?.startDate || booking.startDate)} 
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📅 {formatDate(booking.bookingDates?.endDate || booking.endDate)}
                      </div>
                      <div className={`text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        🕒 {booking.bookingDates?.duration || booking.rentalDays || 1} days
                      </div>
                    </td>

                    {/* Cost & Payment */}
                    <td className="px-6 py-4">
                      <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        💰 LKR {(booking.pricing?.total || booking.totalCost || 0).toLocaleString()}
                      </div>
                      {booking.pricing?.subtotal && (
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Subtotal: LKR {booking.pricing.subtotal.toLocaleString()}
                        </div>
                      )}
                      {booking.pricing?.tax > 0 && (
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Tax: LKR {booking.pricing.tax.toLocaleString()}
                        </div>
                      )}
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          💳 {booking.paymentStatus || 'pending'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status ? booking.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col space-y-2">
                        {/* Payment Button */}
                        {booking.paymentStatus === 'Pending' && booking.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleMakePayment(booking)}
                            className="bg-green-600 text-white px-3 py-2 rounded-md text-xs hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            💳 Pay Now
                          </button>
                        )}
                        
                        {/* Edit Button */}
                        {['Pending', 'Confirmed'].includes(booking.status) && booking.paymentStatus === 'Pending' && (
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-md text-xs hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            ✏️ Edit
                          </button>
                        )}

                        {/* Cancel Button */}
                        {['Pending', 'Confirmed', 'Payment Due', 'Paid'].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="bg-orange-600 text-white px-3 py-2 rounded-md text-xs hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {cancellingId === booking._id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Cancelling...
                              </div>
                            ) : (
                              '❌ Cancel'
                            )}
                          </button>
                        )}

                        {/* Delete Button */}
                        {['Cancelled', 'Completed'].includes(booking.status) && (
                          <button
                            onClick={() => handleDeleteBooking(booking)}
                            className="bg-red-600 text-white px-3 py-2 rounded-md text-xs hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            🗑️ Delete
                          </button>
                        )}

                        {/* Status Messages */}
                        {booking.status === 'ready_for_pickup' && (
                          <div className="text-blue-600 font-medium text-xs text-center py-1 bg-blue-50 rounded">
                            📦 Ready for pickup
                          </div>
                        )}
                        {booking.status === 'in_use' && (
                          <div className="text-green-600 font-medium text-xs text-center py-1 bg-green-50 rounded">
                            ✅ Currently rented
                          </div>
                        )}
                        {booking.status === 'completed' && (
                          <div className="text-gray-600 font-medium text-xs text-center py-1 bg-gray-50 rounded">
                            ✅ Completed
                          </div>
                        )}
                        {booking.paymentStatus === 'completed' && booking.status !== 'cancelled' && (
                          <div className="text-green-600 font-medium text-xs text-center py-1 bg-green-50 rounded">
                            💳 Paid
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Booking Modal */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Equipment Booking
              </h3>
              
              {/* Equipment Info */}
              <div className={`p-3 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Equipment:</strong> {editingBooking.items?.map(item => item.inventory?.name).join(', ')}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Current Cost:</strong> LKR {(editingBooking.pricing?.total || editingBooking.totalCost || 0).toLocaleString()}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Booking ID:</strong> {editingBooking.bookingId}
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingBooking.newStartDate}
                    onChange={(e) => setEditingBooking({...editingBooking, newStartDate: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editingBooking.newEndDate}
                    onChange={(e) => setEditingBooking({...editingBooking, newEndDate: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    min={editingBooking.newStartDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={editingBooking.newNotes}
                    onChange={(e) => setEditingBooking({...editingBooking, newNotes: e.target.value})}
                    rows={3}
                    placeholder="Add any special requirements or notes..."
                    className={`w-full px-3 py-2 border rounded-md resize-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBooking(null);
                  }}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors duration-200`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBooking}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Update Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Confirm Delete
              </h3>
              
              <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                      Warning: This action cannot be undone!
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      This will permanently delete the booking record.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-3 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Equipment:</strong> {deletingBooking.items?.map(item => item.inventory?.name).join(', ')}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Booking ID:</strong> {deletingBooking.bookingId}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Status:</strong> {deletingBooking.status}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Amount:</strong> LKR {(deletingBooking.pricing?.total || deletingBooking.totalCost || 0).toLocaleString()}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingBooking(null);
                  }}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors duration-200`}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBooking}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInventoryDashboard;