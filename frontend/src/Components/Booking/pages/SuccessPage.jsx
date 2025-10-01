import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { booking, payment, message } = location.state || {};

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Information Missing</h2>
            <p className="text-gray-600 mb-6">Unable to display booking confirmation.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {payment?.status === 'completed' ? 'Payment Successful!' : 'Booking Confirmed!'}
          </h1>
          <p className="text-lg text-gray-600">
            {message || 'Your photography session has been booked successfully.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              Booking Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Booking Reference</p>
                <p className="text-lg font-mono text-purple-600">{booking.bookingReference}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Package</p>
                <p className="text-gray-900">{booking.packageName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Date & Time</p>
                <p className="text-gray-900">
                  {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-600">
                  {booking.bookingTime} - {booking.slotId?.endTime || 'TBD'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Customer</p>
                <p className="text-gray-900">{booking.customerInfo.name}</p>
                <p className="text-gray-600">{booking.customerInfo.email}</p>
                <p className="text-gray-600">{booking.customerInfo.phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {booking.bookingStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💳</span>
              Payment Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Status</p>
                <div className="flex items-center mt-1">
                  <span className="mr-2">{getPaymentStatusIcon(payment?.status || booking.paymentStatus)}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getPaymentStatusColor(payment?.status || booking.paymentStatus)
                  }`}>
                    {(payment?.status || booking.paymentStatus).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">${booking.totalAmount}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Method</p>
                <p className="text-gray-900 capitalize">{payment?.method || booking.paymentMethod}</p>
              </div>
              
              {payment?.transactionId && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-600">{payment.transactionId}</p>
                </div>
              )}
              
              {payment?.instructions && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Payment Instructions</p>
                  <p className="text-sm text-yellow-700 mt-1">{payment.instructions}</p>
                </div>
              )}
              
              {payment?.timestamp && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Date</p>
                  <p className="text-gray-600">
                    {new Date(payment.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            What's Next?
          </h3>
          
          <div className="space-y-3">
            {payment?.status === 'completed' ? (
              <>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                  <p className="text-gray-700">
                    <strong>Confirmation Email:</strong> You'll receive a confirmation email with all booking details shortly.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                  <p className="text-gray-700">
                    <strong>Preparation:</strong> We'll contact you 24 hours before your session with any preparation details.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                  <p className="text-gray-700">
                    <strong>Your Session:</strong> Arrive 15 minutes early at our studio on your scheduled date.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                  <p className="text-gray-700">
                    <strong>Complete Payment:</strong> Your booking is confirmed, but payment is still pending.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                  <p className="text-gray-700">
                    <strong>Payment Instructions:</strong> Follow the payment instructions provided above.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                  <p className="text-gray-700">
                    <strong>Confirmation:</strong> You'll receive final confirmation once payment is verified.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Review Prompt for Completed Payments */}
        {payment?.status === 'completed' && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Help Others Discover Great Photography!
              </h3>
              <p className="text-gray-600 mb-6">
                Share your experience with our studio. Your review helps other customers and helps us improve our services.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate('/userDashboard', { state: { showReviewModal: true, bookingId: booking._id } })}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center font-medium"
                >
                  <span className="mr-2">⭐</span>
                  Write a Review
                </button>
                
                <p className="text-sm text-gray-500">
                  Or add a review later from your dashboard
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/userDashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center"
          >
            <span className="mr-2">🏠</span>
            Go to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
          >
            <span className="mr-2">🏡</span>
            Back to Home
          </button>
          
          <button
            onClick={() => navigate('/booking')}
            className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center justify-center"
          >
            <span className="mr-2">➕</span>
            New Booking
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Questions about your booking? Contact us at{' '}
            <a href="mailto:support@studiomanagement.com" className="text-purple-600 hover:underline">
              support@studiomanagement.com
            </a>
            {' '}or{' '}
            <a href="tel:+1234567890" className="text-purple-600 hover:underline">
              (123) 456-7890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;