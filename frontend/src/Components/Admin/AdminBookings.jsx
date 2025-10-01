import React, { useState, useEffect } from 'react';

const AdminBookings = ({ isDarkMode }) => {
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'view'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    packageId: 'all',
    search: '',
    page: 1
  });

  const [formData, setFormData] = useState({
    packageId: '',
    slotId: '',
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    paymentMethod: 'card',
    paymentStatus: 'pending',
    specialRequests: '',
    userId: ''
  });

  // Fetch all required data
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      // Fetch bookings with current filters
      const bookingParams = new URLSearchParams({
        page: filters.page,
        limit: 10,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.packageId !== 'all' && { packageId: filters.packageId }),
        ...(filters.search && { search: filters.search })
      });

      const [bookingsRes, packagesRes, usersRes, slotsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/admin/bookings?${bookingParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/packages', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/slots', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!bookingsRes.ok || !packagesRes.ok || !usersRes.ok || !slotsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const bookingsData = await bookingsRes.json();
      const packagesData = await packagesRes.json();
      const usersData = await usersRes.json();
      const slotsData = await slotsRes.json();

      setBookings(bookingsData.bookings);
      setPagination(bookingsData.pagination);
      setPackages(packagesData.packages || packagesData);
      setUsers(usersData.users || usersData);
      setSlots(slotsData.slots || slotsData);
      setError('');
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const url = modalType === 'create' 
        ? 'http://localhost:5000/api/admin/bookings'
        : `http://localhost:5000/api/admin/bookings/${selectedBooking._id}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchData();
        alert(modalType === 'create' ? 'Booking created successfully!' : 'Booking updated successfully!');
      }
    } catch (err) {
      setError('Failed to save booking: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle booking deletion
  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      const result = await response.json();
      if (result.success) {
        fetchData();
        alert('Booking deleted successfully!');
      }
    } catch (err) {
      setError('Failed to delete booking: ' + err.message);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      packageId: '',
      slotId: '',
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        address: ''
      },
      paymentMethod: 'card',
      paymentStatus: 'pending',
      specialRequests: '',
      userId: ''
    });
    setSelectedBooking(null);
  };

  // Open modal for create/edit
  const openModal = (type, booking = null) => {
    setModalType(type);
    setSelectedBooking(booking);
    
    if (type === 'edit' && booking) {
      setFormData({
        packageId: booking.packageId._id || booking.packageId,
        slotId: booking.slotId._id || booking.slotId,
        customerInfo: booking.customerInfo,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        specialRequests: booking.specialRequests || '',
        userId: booking.userId?._id || ''
      });
    } else if (type === 'create') {
      resetForm();
    }
    
    setShowModal(true);
  };

  // Filter available slots based on selected package
  const availableSlots = slots.filter(slot => 
    slot.isAvailable || (modalType === 'edit' && slot._id === selectedBooking?.slotId?._id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          Bookings Management
        </h2>
        <button
          onClick={() => openModal('create')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center"
        >
          <span className="mr-2">+</span>
          Create New Booking
        </button>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg border`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Search by name, email, or reference"
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Package
            </label>
            <select
              value={filters.packageId}
              onChange={(e) => setFilters({ ...filters, packageId: e.target.value, page: 1 })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Packages</option>
              {packages.map(pkg => (
                <option key={pkg._id} value={pkg._id}>{pkg.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ status: 'all', packageId: 'all', search: '', page: 1 });
                fetchData();
              }}
              className={`px-4 py-2 rounded-md border ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition`}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading bookings...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Booking Details
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Customer
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Package & Slot
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Payment
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200`}>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        <div>
                          <p className="font-semibold">{booking.bookingReference}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(booking.createdAt).toLocaleDateString()}
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
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        <div>
                          <p className="font-medium">{booking.packageName}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {booking.slotId?.date && new Date(booking.slotId.date).toLocaleDateString()}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {booking.slotId?.startTime} - {booking.slotId?.endTime}
                          </p>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        <div>
                          <p className="font-semibold">${booking.totalAmount}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {booking.paymentMethod}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.bookingStatus === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.bookingStatus === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.bookingStatus}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openModal('view', booking)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openModal('edit', booking)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} px-6 py-3 border-t`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Showing page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalBookings} total bookings)
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                      disabled={!pagination.hasPrev}
                      className={`px-3 py-1 rounded ${
                        pagination.hasPrev
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={!pagination.hasNext}
                      className={`px-3 py-1 rounded ${
                        pagination.hasNext
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {modalType === 'create' ? 'Create New Booking' : 
               modalType === 'edit' ? 'Edit Booking' : 'Booking Details'}
            </h3>

            {modalType === 'view' ? (
              <div className="space-y-4">
                <div>
                  <strong>Booking Reference:</strong> {selectedBooking?.bookingReference}
                </div>
                <div>
                  <strong>Customer:</strong> {selectedBooking?.customerInfo.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedBooking?.customerInfo.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedBooking?.customerInfo.phone}
                </div>
                <div>
                  <strong>Address:</strong> {selectedBooking?.customerInfo.address}
                </div>
                <div>
                  <strong>Package:</strong> {selectedBooking?.packageName}
                </div>
                <div>
                  <strong>Date:</strong> {selectedBooking?.slotId?.date && new Date(selectedBooking.slotId.date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Time:</strong> {selectedBooking?.slotId?.startTime} - {selectedBooking?.slotId?.endTime}
                </div>
                <div>
                  <strong>Total Amount:</strong> ${selectedBooking?.totalAmount}
                </div>
                <div>
                  <strong>Payment Status:</strong> {selectedBooking?.paymentStatus}
                </div>
                <div>
                  <strong>Booking Status:</strong> {selectedBooking?.bookingStatus}
                </div>
                {selectedBooking?.specialRequests && (
                  <div>
                    <strong>Special Requests:</strong> {selectedBooking.specialRequests}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Package *
                    </label>
                    <select
                      value={formData.packageId}
                      onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select Package</option>
                      {packages.filter(pkg => pkg.isActive).map(pkg => (
                        <option key={pkg._id} value={pkg._id}>{pkg.name} - ${pkg.price}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Time Slot *
                    </label>
                    <select
                      value={formData.slotId}
                      onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select Time Slot</option>
                      {availableSlots.map(slot => (
                        <option key={slot._id} value={slot._id}>
                          {new Date(slot.date).toLocaleDateString()} - {slot.startTime} to {slot.endTime} (${slot.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={formData.customerInfo.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, name: e.target.value }
                      })}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.customerInfo.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, email: e.target.value }
                      })}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.customerInfo.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, phone: e.target.value }
                      })}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="card">Card</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Status
                    </label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Registered User (Optional)
                    </label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">No linked user</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Address *
                  </label>
                  <textarea
                    value={formData.customerInfo.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      customerInfo: { ...formData.customerInfo, address: e.target.value }
                    })}
                    required
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Special Requests
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`px-4 py-2 rounded-md border ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } transition`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (modalType === 'create' ? 'Create Booking' : 'Update Booking')}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'view' && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-md border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition`}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;