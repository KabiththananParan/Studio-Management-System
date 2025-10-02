import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate, useLocation } from 'react-router-dom';

import ProfileView from '../User/ProfileView';
import ReviewForm from './Reviews/ReviewForm';
import ReviewDisplay from './Reviews/ReviewDisplay';
import ComplaintForm from './Complaints/ComplaintForm';
import ComplaintDisplay from './Complaints/ComplaintDisplay';
import UserInventoryBrowsing from '../User/UserInventoryBrowsing';
import UserInventoryDashboard from '../User/UserInventoryDashboard';

// Icons using lucide-react. The user must include the script tag for lucide-react in their HTML.
// This is a mock component since we're in a single file.
const Icon = ({ name, className = "" }) => {
  const icons = {
    Dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
    ),
    Home: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
    ),
    BookOpen: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    ),
    Calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ),
    Wallet: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M20 7v2a1 1 0 0 0 1 1h1"/><path d="M10 12h2a2 2 0 0 0 0-4H10v4Z"/><path d="M12 16h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2v4Z"/></svg>
    ),
    BarChart: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    ),
    User: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    Star: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    ),
    Menu: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
    ),
    Bell: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18.8 11.2a1 1 0 0 0-.8-.2H5.2c-.4 0-.8.2-1 .5l-2.4 2.1c-.8.7-.2 2.1.8 2.1h18c1 0 1.6-1.4.8-2.1L19 11.5c-.2-.3-.6-.5-.8-.3Z"/><path d="M13.2 21a2 2 0 0 1-2.4 0"/><path d="M12 2c-.1 0-.3.1-.3.2-.2.3-.2.8-.2 1.3V5c0 1.1-.9 2-2 2h-1c-.1 0-.2.1-.2.2V9a1 1 0 0 0 1 1h4c.6 0 1.2-.2 1.6-.7"/></svg>
    ),
    Search: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    ),
    Sun: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    ),
    Moon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    ),
    CheckCircle: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
    ),
    Package: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.78 0l-8-4A2 2 0 0 1 2 16.76V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/><path d="M2.32 6.16l10 5 10-5"/><path d="M12 22.76V11.24"/></svg>
    )
  };
  return icons[name] || null;
};



const DashboardView = ({ isDarkMode = false, setActiveTab }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const bookings = data.bookings || data; // Handle both formats
        
        // Calculate stats
        const now = new Date();
        const upcoming = bookings.filter(booking => 
          booking.bookingStatus === 'confirmed' && 
          new Date(booking.slot?.date) > now
        );
        const completed = bookings.filter(booking => booking.bookingStatus === 'completed');
        const totalSpent = bookings
          .filter(booking => booking.bookingStatus !== 'cancelled')
          .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

        setStats({
          totalBookings: bookings.length,
          upcomingBookings: upcoming.length,
          completedBookings: completed.length,
          totalSpent
        });

        // Get recent bookings (last 3)
        const recent = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setRecentBookings(recent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <Icon name="Calendar" className="w-6 h-6" />,
      iconBg: 'bg-blue-100 text-blue-600',
      change: 'All time'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingBookings,
      icon: <Icon name="BookOpen" className="w-6 h-6" />,
      iconBg: 'bg-green-100 text-green-600',
      change: 'Confirmed bookings'
    },
    {
      title: 'Completed',
      value: stats.completedBookings,
      icon: <Icon name="Star" className="w-6 h-6" />,
      iconBg: 'bg-purple-100 text-purple-600',
      change: 'Sessions finished'
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent}`,
      icon: <Icon name="Wallet" className="w-6 h-6" />,
      iconBg: 'bg-orange-100 text-orange-600',
      change: 'All bookings'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-sm border transition-colors duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings Section */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-sm border transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Recent Bookings</h2>
          <button 
            onClick={() => setActiveTab('My Bookings')}
            className="text-blue-500 hover:underline text-sm font-medium"
          >
            View All Bookings
          </button>
        </div>
        
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Calendar" className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No bookings yet</p>
            <button
              onClick={() => window.location.href = '/booking'}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Make Your First Booking
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Package</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {recentBookings.map((booking) => (
                  <tr key={booking._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.package?.name || 'Package not found'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.duration || 'N/A'} hours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.slot?.date ? formatDate(booking.slot.date) : 'TBD'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.slot?.time || 'Time TBD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${booking.totalAmount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const BookingsView = ({ isDarkMode = false }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBooking, setDeletingBooking] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundingBooking, setRefundingBooking] = useState(null);
  const [refundEligibility, setRefundEligibility] = useState(null);
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);

  // Fetch user bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view bookings');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || data); // Handle both response formats
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

  const handleMakePayment = (bookingId) => {
    // Navigate to payment page with booking ID
    window.location.href = `/payment?bookingId=${bookingId}`;
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/user/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh bookings list
        fetchBookings();
        alert('Booking cancelled successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('An error occurred while cancelling the booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking({
      ...booking,
      newDate: booking.slot?.date ? new Date(booking.slot.date).toISOString().split('T')[0] : '',
      newTime: booking.slot?.time || '',
      newCustomerName: booking.customerInfo?.name || '',
      newCustomerEmail: booking.customerInfo?.email || '',
      newCustomerPhone: booking.customerInfo?.phone || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const updates = {
        customerInfo: {
          name: editingBooking.newCustomerName,
          email: editingBooking.newCustomerEmail,
          phone: editingBooking.newCustomerPhone
        },
        slot: {
          date: editingBooking.newDate,
          time: editingBooking.newTime
        }
      };

      const response = await fetch(`http://localhost:5000/api/user/bookings/${editingBooking._id}`, {
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
        alert('Booking updated successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('An error occurred while updating the booking');
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
      
      const response = await fetch(`http://localhost:5000/api/user/bookings/${deletingBooking._id}`, {
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
        alert('Booking deleted successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('An error occurred while deleting the booking');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPDF = (booking) => {
    const pdfContent = generateBookingPDFContent(booking);
    const pdfWindow = window.open('', '_blank');
    pdfWindow.document.write(pdfContent);
    pdfWindow.document.close();
    pdfWindow.document.title = `Booking_${booking._id.slice(-8)}`;
    pdfWindow.focus();
    setTimeout(() => {
      pdfWindow.print();
    }, 1000);
  };

  const generateBookingPDFContent = (booking) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Booking Details - ${booking._id.slice(-8)}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          @page { 
            size: A4; 
            margin: 0.5in; 
          }
          body { 
            font-size: 11px; 
            line-height: 1.3; 
          }
          .no-print { display: none !important; }
        }
        
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333; 
          background: white;
        }
        
        .booking-container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white;
          padding: 30px;
        }
        
        .header-section { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          border-bottom: 3px solid #4f46e5; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        
        .booking-title { 
          font-size: 36px; 
          font-weight: bold; 
          color: #4f46e5; 
          margin: 0;
        }
        
        .booking-id { 
          font-size: 14px; 
          color: #6b7280; 
          margin-top: 8px; 
        }
        
        .company-info { 
          text-align: right; 
          font-size: 12px;
          line-height: 1.5;
        }
        
        .company-name { 
          font-size: 20px; 
          font-weight: bold; 
          color: #1f2937; 
          margin-bottom: 8px; 
        }
        
        .booking-info { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
          gap: 40px;
        }
        
        .customer-info, .booking-meta { 
          flex: 1; 
        }
        
        .section-title { 
          font-size: 14px; 
          font-weight: bold; 
          color: #1f2937; 
          margin-bottom: 10px; 
          border-bottom: 1px solid #e5e7eb; 
          padding-bottom: 3px; 
        }
        
        .info-content { 
          line-height: 1.5; 
          font-size: 12px;
        }
        
        .customer-name { 
          font-weight: bold; 
          font-size: 13px; 
          margin-bottom: 3px; 
        }
        
        .details-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 25px; 
          font-size: 11px;
        }
        
        .details-table th { 
          background-color: #f8fafc; 
          color: #374151; 
          font-weight: bold; 
          padding: 10px 8px; 
          border: 1px solid #e5e7eb; 
          text-align: left; 
        }
        
        .details-table td { 
          padding: 10px 8px; 
          border: 1px solid #e5e7eb; 
          vertical-align: top; 
        }
        
        .status-badge { 
          display: inline-block; 
          padding: 2px 8px; 
          border-radius: 12px; 
          font-size: 10px; 
          font-weight: bold; 
          text-transform: uppercase; 
        }
        
        .status-confirmed { background-color: #d1fae5; color: #065f46; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .status-completed { background-color: #dbeafe; color: #1e40af; }
        
        .footer-section { 
          border-top: 1px solid #e5e7eb; 
          padding-top: 20px; 
          margin-top: 30px; 
          font-size: 10px;
        }
        
        .generation-info { 
          font-size: 9px; 
          color: #9ca3af; 
          text-align: center; 
          border-top: 1px solid #f3f4f6; 
          padding-top: 10px; 
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="booking-container">
        <div class="header-section">
          <div>
            <h1 class="booking-title">BOOKING DETAILS</h1>
            <div class="booking-id">ID: ${booking._id}</div>
          </div>
          <div class="company-info">
            <div class="company-name">Studio Management System</div>
            <div>
              Professional Photography Studio<br>
              Email: info@studiomanagement.com<br>
              Phone: +94 11 234 5678
            </div>
          </div>
        </div>

        <div class="booking-info">
          <div class="customer-info">
            <h3 class="section-title">Customer Information</h3>
            <div class="info-content">
              <div class="customer-name">${booking.customerInfo?.name || 'N/A'}</div>
              <div>${booking.customerInfo?.email || 'N/A'}</div>
              <div>${booking.customerInfo?.phone || 'N/A'}</div>
            </div>
          </div>
          
          <div class="booking-meta">
            <h3 class="section-title">Booking Information</h3>
            <div class="info-content">
              <div><strong>Date:</strong> ${booking.slot?.date ? formatDate(booking.slot.date) : 'N/A'}</div>
              <div><strong>Time:</strong> ${booking.slot?.time || 'N/A'}</div>
              <div><strong>Status:</strong> <span class="status-badge status-${booking.bookingStatus}">${booking.bookingStatus}</span></div>
              <div><strong>Payment Status:</strong> ${booking.paymentStatus}</div>
            </div>
          </div>
        </div>

        <table class="details-table">
          <thead>
            <tr>
              <th>Package Details</th>
              <th>Duration</th>
              <th>Amount</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 500;">${booking.package?.name || 'Package not found'}</div>
                <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">
                  ${booking.package?.description || ''}
                </div>
              </td>
              <td>${booking.duration || 'N/A'} hours</td>
              <td><strong>$${booking.totalAmount}</strong></td>
              <td>${booking.paymentMethod || 'N/A'}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer-section">
          <div class="generation-info">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • Studio Management System
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const handleRequestRefund = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      
      // First check refund eligibility
      const eligibilityResponse = await fetch(`http://localhost:5000/api/refunds/eligibility/${booking._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (eligibilityResponse.ok) {
        const eligibilityData = await eligibilityResponse.json();
        setRefundEligibility(eligibilityData.eligibility);
        setRefundingBooking({
          ...booking,
          selectedReason: 'cancelled_by_customer',
          reasonDescription: '',
          requestedAmount: eligibilityData.eligibility.maxRefundAmount
        });
        setShowRefundModal(true);
      } else {
        const errorData = await eligibilityResponse.json();
        alert(errorData.message || 'Failed to check refund eligibility');
      }
    } catch (error) {
      console.error('Error checking refund eligibility:', error);
      alert('An error occurred while checking refund eligibility');
    }
  };

  const handleSubmitRefundRequest = async () => {
    try {
      setIsRequestingRefund(true);
      const token = localStorage.getItem('token');

      const refundData = {
        bookingId: refundingBooking._id,
        reason: refundingBooking.selectedReason,
        reasonDescription: refundingBooking.reasonDescription,
        requestedAmount: refundingBooking.requestedAmount
      };

      const response = await fetch('http://localhost:5000/api/refunds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`🎭 DEMO MODE: Refund request submitted successfully!\n\nRefund number: ${data.refund.refundNumber}\n\nNote: This is a demonstration. Admin will now review your request.`);
        fetchBookings(); // Refresh bookings to show refund status
        setShowRefundModal(false);
        setRefundingBooking(null);
        setRefundEligibility(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit refund request');
      }
    } catch (error) {
      console.error('Error submitting refund request:', error);
      alert('An error occurred while submitting refund request');
    } finally {
      setIsRequestingRefund(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>My Bookings</h2>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your studio bookings and track their status
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 text-center`}>
          <Icon name="Calendar" className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            No Bookings Found
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            You haven't made any bookings yet. Start by booking a studio session!
          </p>
          <button
            onClick={() => window.location.href = '/booking'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Book Studio
          </button>
        </div>
      ) : (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Booking Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Package
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Date & Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Amount
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
                {bookings.map((booking) => (
                  <tr key={booking._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.customerInfo.name}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {booking.customerInfo.email}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ID: {booking._id.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.package?.name || 'Package not found'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Duration: {booking.duration || 'N/A'} hours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.slot?.date ? formatDate(booking.slot.date) : 'Date not available'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.slot?.time || 'Time not available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${booking.totalAmount}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-1">
                        {/* Payment and Cancel buttons */}
                        {booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'pending' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleMakePayment(booking._id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors duration-200"
                            >
                              Pay
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancellingId === booking._id}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          </div>
                        )}
                        
                        {/* Edit, Delete, PDF buttons - available for all non-cancelled bookings */}
                        {booking.bookingStatus !== 'cancelled' && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => handleEditBooking(booking)}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors duration-200"
                              title="Edit Booking"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking)}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors duration-200"
                              title="Delete Booking"
                            >
                              🗑️ Delete
                            </button>
                            {/* Refund button - only for paid bookings */}
                            {booking.paymentStatus === 'completed' && booking.paymentStatus !== 'refunded' && (
                              <button
                                onClick={() => handleRequestRefund(booking)}
                                className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 transition-colors duration-200"
                                title="Request Refund"
                              >
                                💰 Refund
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadPDF(booking)}
                              className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors duration-200"
                              title="Download PDF"
                            >
                              📄 PDF
                            </button>
                          </div>
                        )}

                        {/* PDF download for cancelled bookings */}
                        {booking.bookingStatus === 'cancelled' && (
                          <button
                            onClick={() => handleDownloadPDF(booking)}
                            className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors duration-200"
                            title="Download PDF"
                          >
                            📄 Download PDF
                          </button>
                        )}

                        {/* Status indicators */}
                        {booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'completed' && (
                          <span className={`text-green-600 font-medium text-xs`}>
                            ✅ Paid
                          </span>
                        )}
                        {booking.bookingStatus === 'completed' && (
                          <span className={`text-blue-600 font-medium text-xs`}>
                            ✅ Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Booking
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editingBooking.newCustomerName}
                    onChange={(e) => setEditingBooking({...editingBooking, newCustomerName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingBooking.newCustomerEmail}
                    onChange={(e) => setEditingBooking({...editingBooking, newCustomerEmail: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingBooking.newCustomerPhone}
                    onChange={(e) => setEditingBooking({...editingBooking, newCustomerPhone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={editingBooking.newDate}
                    onChange={(e) => setEditingBooking({...editingBooking, newDate: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={editingBooking.newTime}
                    onChange={(e) => setEditingBooking({...editingBooking, newTime: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
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
              
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete this booking? This action cannot be undone.
              </p>
              
              <div className={`p-3 rounded-md mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Customer:</strong> {deletingBooking.customerInfo?.name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Date:</strong> {deletingBooking.slot?.date ? formatDate(deletingBooking.slot.date) : 'N/A'}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Package:</strong> {deletingBooking.package?.name || 'N/A'}
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
                  {isDeleting ? 'Deleting...' : 'Delete Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Modal */}
      {showRefundModal && refundingBooking && refundEligibility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Request Refund
              </h3>
              
              {refundEligibility.eligible ? (
                <>
                  <div className={`p-3 rounded-md mb-4 ${isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                      ✅ {refundEligibility.reason}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Refund Amount: ${refundEligibility.maxRefundAmount.toFixed(2)} ({refundEligibility.refundPercentage}%)
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Reason for Refund
                      </label>
                      <select
                        value={refundingBooking.selectedReason}
                        onChange={(e) => setRefundingBooking({...refundingBooking, selectedReason: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="cancelled_by_customer">Cancelled by Customer</option>
                        <option value="service_not_provided">Service Not Provided</option>
                        <option value="quality_issues">Quality Issues</option>
                        <option value="scheduling_conflict">Scheduling Conflict</option>
                        <option value="emergency">Emergency</option>
                        <option value="duplicate_booking">Duplicate Booking</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Additional Details (Optional)
                      </label>
                      <textarea
                        value={refundingBooking.reasonDescription}
                        onChange={(e) => setRefundingBooking({...refundingBooking, reasonDescription: e.target.value})}
                        rows={3}
                        maxLength={500}
                        placeholder="Please provide additional details about your refund request..."
                        className={`w-full px-3 py-2 border rounded-md resize-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
                      />
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {refundingBooking.reasonDescription.length}/500 characters
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong>Booking Details:</strong>
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Customer: {refundingBooking.customerInfo?.name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Date: {refundingBooking.slot?.date ? formatDate(refundingBooking.slot.date) : 'N/A'}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Package: {refundingBooking.package?.name || 'N/A'}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total Paid: ${refundingBooking.totalAmount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowRefundModal(false);
                        setRefundingBooking(null);
                        setRefundEligibility(null);
                      }}
                      className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors duration-200`}
                      disabled={isRequestingRefund}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitRefundRequest}
                      disabled={isRequestingRefund}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRequestingRefund ? 'Submitting...' : 'Submit Refund Request'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={`p-3 rounded-md mb-4 ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                      ❌ Not Eligible for Refund
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {refundEligibility.reason}
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowRefundModal(false);
                        setRefundingBooking(null);
                        setRefundEligibility(null);
                      }}
                      className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors duration-200`}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};






const ReviewsView = ({ isDarkMode = false }) => {
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('myReviews');
  const [reviewStats, setReviewStats] = useState(null);
  
  // Complaint states
  const [complaints, setComplaints] = useState([]);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [complaintStats, setComplaintStats] = useState(null);

  useEffect(() => {
    loadUserReviews();
    loadEligibleBookings();
    loadUserComplaints();
  }, []);

  const loadUserReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setReviewStats(data.stats);
      } else {
        console.error('Failed to load reviews:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter bookings that are eligible for reviews (completed payment or completed booking)
        const eligibleBookings = data.bookings?.filter(booking => 
          (booking.paymentStatus === 'completed' || booking.bookingStatus === 'completed') && 
          !booking.hasReview
        ) || [];
        setBookings(eligibleBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingReview 
        ? `http://localhost:5000/api/user/reviews/${editingReview._id}`
        : 'http://localhost:5000/api/user/reviews';
      
      const method = editingReview ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        const data = await response.json();
        setShowReviewForm(false);
        setSelectedBooking(null);
        setEditingReview(null);
        loadUserReviews();
        loadEligibleBookings();
        
        // Show success message
        alert(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadUserReviews();
        loadEligibleBookings();
        alert('Review deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  const handleAddReview = (booking) => {
    setSelectedBooking(booking);
    setEditingReview(null);
    setShowReviewForm(true);
  };

  // Complaint functions
  const loadUserComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
        setComplaintStats(data.stats);
      } else {
        console.error('Failed to load complaints:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  const handleSubmitComplaint = async (complaintData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingComplaint 
        ? `http://localhost:5000/api/user/complaints/${editingComplaint._id}`
        : 'http://localhost:5000/api/user/complaints';
      
      const method = editingComplaint ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(complaintData)
      });

      if (response.ok) {
        const data = await response.json();
        setShowComplaintForm(false);
        setEditingComplaint(null);
        loadUserComplaints();
        
        alert(editingComplaint ? 'Complaint updated successfully!' : 'Complaint submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Error submitting complaint. Please try again.');
    }
  };

  const handleEditComplaint = (complaint) => {
    setEditingComplaint(complaint);
    setShowComplaintForm(true);
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/complaints/${complaintId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadUserComplaints();
        alert('Complaint deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Error deleting complaint. Please try again.');
    }
  };

  const handleAddComplaint = () => {
    setEditingComplaint(null);
    setShowComplaintForm(true);
  };

  if (showReviewForm) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <button 
            onClick={() => {
              setShowReviewForm(false);
              setSelectedBooking(null);
              setEditingReview(null);
            }}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reviews
          </button>
        </div>
        
        <ReviewForm
          bookingId={selectedBooking?._id || editingReview?.bookingId}
          bookingInfo={{
            packageName: selectedBooking?.packageName || editingReview?.bookingInfo?.packageName,
            bookingDate: selectedBooking?.bookingDate || editingReview?.bookingInfo?.bookingDate,
            totalAmount: selectedBooking?.totalAmount || editingReview?.bookingInfo?.totalAmount
          }}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowReviewForm(false);
            setSelectedBooking(null);
            setEditingReview(null);
          }}
          initialData={editingReview}
          isEditing={!!editingReview}
        />
      </div>
    );
  }

  if (showComplaintForm) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <button 
            onClick={() => {
              setShowComplaintForm(false);
              setEditingComplaint(null);
            }}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reviews & Complaints
          </button>
        </div>
        
        <ComplaintForm
          existingComplaint={editingComplaint}
          onSubmit={handleSubmitComplaint}
          onCancel={() => {
            setShowComplaintForm(false);
            setEditingComplaint(null);
          }}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Reviews & Ratings
        </h2>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your reviews and share your experience with our studio services.
        </p>
      </div>

      {/* Statistics Overview */}
      {(reviewStats || complaintStats) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Reviews Stats */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Reviews
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reviewStats?.totalReviews || 0}
                </p>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Average Rating
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reviewStats?.averageRating > 0 ? reviewStats.averageRating.toFixed(1) : 'N/A'}
                  {reviewStats?.averageRating > 0 && <span className="text-lg text-yellow-500 ml-1">★</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Complaints Stats */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Complaints
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {complaintStats?.totalComplaints || 0}
                </p>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-sm border`}>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Resolved
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {complaintStats?.resolvedComplaints || 0}
                </p>
                {complaintStats?.totalComplaints > 0 && (
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Math.round((complaintStats.resolvedComplaints / complaintStats.totalComplaints) * 100)}% resolution rate
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6">
        <button
          onClick={() => setActiveSubTab('myReviews')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'myReviews'
              ? 'bg-blue-600 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          My Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveSubTab('writeReview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'writeReview'
              ? 'bg-blue-600 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Write Review ({bookings.length} eligible)
        </button>
        <button
          onClick={() => setActiveSubTab('myComplaints')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'myComplaints'
              ? 'bg-red-600 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          My Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveSubTab('writeComplaint')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeSubTab === 'writeComplaint'
              ? 'bg-red-600 text-white'
              : isDarkMode 
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Submit Complaint
        </button>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'myReviews' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Reviews
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border`}>
              <div className={`text-gray-400 mb-4`}>
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Reviews Yet</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                You haven't written any reviews yet.
              </p>
              <button
                onClick={() => setActiveSubTab('writeReview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write Your First Review
              </button>
            </div>
          ) : (
            <div className="ReviewDisplay-placeholder space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border p-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {review.rating}/5
                        </span>
                      </div>
                      {review.reviewTitle && (
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                          {review.reviewTitle}
                        </h4>
                      )}
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                        {review.comment}
                      </p>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p>Package: {review.bookingInfo?.packageName}</p>
                        <p>Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {review.canEdit && (
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      )}
                      {review.canDelete && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {review.wouldRecommend !== undefined && (
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                        review.wouldRecommend 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {review.wouldRecommend ? '👍 Recommends' : '👎 Does not recommend'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'writeReview' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Bookings Eligible for Review
            </h3>
          </div>

          {bookings.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border`}>
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                No Bookings to Review
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Complete a booking to be able to write a review.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking._id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border p-6`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {booking.packageName}
                      </h4>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                        <p>Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                        <p>Amount: LKR {booking.totalAmount?.toLocaleString()}</p>
                        <p>Status: {booking.bookingStatus} | Payment: {booking.paymentStatus}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAddReview(booking)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Write Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'myComplaints' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Your Complaints
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border`}>
              <div className={`text-gray-400 mb-4`}>
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Complaints Yet</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                You haven't submitted any complaints yet.
              </p>
              <button
                onClick={() => setActiveSubTab('writeComplaint')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <ComplaintDisplay
                  key={complaint._id}
                  complaint={complaint}
                  onEdit={handleEditComplaint}
                  onDelete={handleDeleteComplaint}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'writeComplaint' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Submit a Complaint
            </h3>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border p-6 text-center`}>
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Have a Concern?
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              We take all feedback seriously and strive to resolve any issues you may have experienced.
            </p>
            <button
              onClick={handleAddComplaint}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit New Complaint
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // ✅ Added user state
  const [loadingUser, setLoadingUser] = useState(true); // Optional: for loading state
  const [successMessage, setSuccessMessage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('dashboardTheme');
    return savedTheme === 'dark';
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle theme and save preference
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('dashboardTheme', newTheme ? 'dark' : 'light');
  };

  // Check for success message from navigation
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location.state]);

   // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data); // ✅ Save user data
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token"); // Remove auth token
    sessionStorage.removeItem("activeSession"); // Clear session flag
    navigate("/"); // Redirect to home page
  };

  const handleNavigation = (path) => {
    navigate(path);
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView isDarkMode={isDarkMode} setActiveTab={setActiveTab} />;
      case 'My Bookings':
        return <BookingsView isDarkMode={isDarkMode} />;
      case 'Profile':
        return <ProfileView isDarkMode={isDarkMode} />;
      case 'Reviews & Complaints':
        return <ReviewsView isDarkMode={isDarkMode} />;
      case 'Browse Equipment':
        return <UserInventoryBrowsing isDarkMode={isDarkMode} />;
      case 'My Equipment Rentals':
        return <UserInventoryDashboard isDarkMode={isDarkMode} />;
      default:
        return <DashboardView isDarkMode={isDarkMode} />;
    }
  };

  const navItems = [
    { name: "Dashboard", icon: <Icon name="Dashboard" className="w-5 h-5" />, type: "tab" },
    { name: "My Bookings", icon: <Icon name="Calendar" className="w-5 h-5" />, type: "tab" },
    { name: "Browse Equipment", icon: <Icon name="Package" className="w-5 h-5" />, type: "tab" },
    { name: "My Equipment Rentals", icon: <Icon name="BarChart" className="w-5 h-5" />, type: "tab" },
    { name: "Profile", icon: <Icon name="User" className="w-5 h-5" />, type: "tab" },
    { name: "Reviews & Complaints", icon: <Icon name="Star" className="w-5 h-5" />, type: "tab" },
  ];

  const navbarItems = [
    { name: "Home", icon: <Icon name="Home" className="w-5 h-5" />, path: "/" },
    { name: "Book Studio", icon: <Icon name="BookOpen" className="w-5 h-5" />, path: "/booking" },
  ];

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen font-sans transition-colors duration-300`}>
      <div className="relative lg:flex">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 ${isDarkMode ? 'bg-gray-800' : 'bg-[#283149]'} text-white w-64 p-6 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-200 ease-in-out z-40`}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">StudioPro</h1>
            <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav>
            <ul>
              {navItems.map((item) => (
                <li key={item.name} className="mb-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.type === "navigate") {
                        handleNavigation(item.path);
                      } else {
                        setActiveTab(item.name);
                      }
                      setIsSidebarOpen(false); // Close sidebar on selection
                    }}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 ${
                      item.type === "tab" && activeTab === item.name 
                        ? (isDarkMode ? 'bg-gray-600 text-white' : 'bg-[#3C4A6B] text-white')
                        : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-300 hover:bg-[#3C4A6B]')
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className={`flex items-center justify-between p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm transition-colors duration-300`}>
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-md"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Icon name="Menu" className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                {navbarItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="hidden sm:inline font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'} transition-colors duration-200`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <Icon name={isDarkMode ? 'Sun' : 'Moon'} className="w-5 h-5" />
              </button>
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-10 pr-4 py-2 rounded-full border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-colors duration-200`}
                />
                <Icon name="Search" />
              </div>
              <button className={`relative p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} transition-colors duration-200`}>
                <Icon name="Bell" className="w-6 h-6" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center space-x-2 p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors duration-200`}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">U</div>
                  <span className="hidden md:inline">{loadingUser ? "Loading..." : user?.email}</span> 

                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>


               {isProfileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg shadow-xl z-50 py-2`}>
          
                    <a href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSignOut(); // ✅ Call signOut function
                        }}
                        className={`block px-4 py-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}>
                        Sign Out
                    </a>


                  </div>
                )}



              </div>
            </div>
          </header>

          <main className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen transition-colors duration-300`}>
            {/* Success Message */}
            {successMessage && (
              <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
                <div className="flex items-center">
                  <Icon name="CheckCircle" className="w-5 h-5 mr-2" />
                  {successMessage}
                </div>
              </div>
            )}
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};


export default UserDashboard;