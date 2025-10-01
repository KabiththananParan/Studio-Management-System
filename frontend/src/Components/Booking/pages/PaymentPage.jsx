import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PaymentForm } from '../components';

const PaymentPage = ({ onPaymentSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if coming from dashboard with bookingId
  const bookingId = searchParams.get('bookingId');
  const { selectedPackage, selectedSlot, bookingDetails } = location.state || {};

  useEffect(() => {
    if (bookingId) {
      // Fetch booking details from API
      fetchBookingDetails(bookingId);
    }
  }, [bookingId]);

  const fetchBookingDetails = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookingData(data);
      } else {
        setError('Failed to fetch booking details');
      }
    } catch (err) {
      setError('Error loading booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl text-gray-900">Loading booking details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
        <button 
          onClick={() => navigate('/user-dashboard')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Check if we have booking data from either source
  const hasBookingData = bookingData || (selectedPackage && selectedSlot && bookingDetails);
  
  if (!hasBookingData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Information Missing</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Start New Booking
        </button>
      </div>
    );
  }

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // If paying for existing booking, update payment status
      if (bookingId && bookingData) {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/user/bookings/${bookingId}/payment`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentStatus: 'completed',
            paymentId: paymentData.transactionId || paymentData.id
          })
        });

        // Navigate back to dashboard with success message
        navigate('/userDashboard', {
          state: { 
            message: 'Payment completed successfully!' 
          }
        });
        return;
      }

      // Original flow for new bookings
      if (onPaymentSuccess) {
        onPaymentSuccess({
          selectedPackage,
          selectedSlot,
          bookingDetails,
          paymentData
        });
      }
      
      // Navigate to user dashboard after successful payment
      navigate('/userDashboard', {
        state: {
          message: 'Payment completed successfully!',
          selectedPackage,
          selectedSlot,
          bookingDetails,
          paymentData
        }
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Payment successful but failed to update status. Please contact support.');
    }
  };

  // Determine what data to pass to PaymentForm
  const paymentFormProps = bookingData 
    ? {
        bookingDetails: {
          customerInfo: bookingData.customerInfo,
          totalAmount: bookingData.totalAmount,
          packageName: bookingData.package?.name || bookingData.packageName,
          slotDate: bookingData.slot?.date || bookingData.bookingDate,
          slotTime: bookingData.slot?.time || bookingData.bookingTime,
          bookingId: bookingData._id
        },
        onBack: () => navigate('/user-dashboard'),
        onPaymentSuccess: handlePaymentSuccess,
        existingBooking: true
      }
    : {
        bookingDetails,
        onBack: () => navigate('/customer-details', { 
          state: { selectedPackage, selectedSlot } 
        }),
        onPaymentSuccess: handlePaymentSuccess,
        existingBooking: false
      };

  return <PaymentForm {...paymentFormProps} />;
};

// PropTypes validation
PaymentPage.propTypes = {
  onPaymentSuccess: PropTypes.func.isRequired
};

export default PaymentPage;