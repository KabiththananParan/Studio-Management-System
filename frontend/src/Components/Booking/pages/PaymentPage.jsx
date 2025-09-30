import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentForm } from '../components';

const PaymentPage = ({ onPaymentSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedPackage, selectedSlot, bookingDetails } = location.state || {};

  if (!selectedPackage || !selectedSlot || !bookingDetails) {
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

  const handlePaymentSuccess = (paymentData) => {
    // Call the parent handler to update payment history
    onPaymentSuccess({
      selectedPackage,
      selectedSlot,
      bookingDetails,
      paymentData
    });
    
    // Navigate to success page
    navigate('/success', {
      state: {
        selectedPackage,
        selectedSlot,
        bookingDetails,
        paymentData
      }
    });
  };

  return (
    <PaymentForm
      bookingDetails={bookingDetails}
      onBack={() => navigate('/customer-details', { 
        state: { selectedPackage, selectedSlot } 
      })}
      onPaymentSuccess={handlePaymentSuccess}
    />
  );
};

// PropTypes validation
PaymentPage.propTypes = {
  onPaymentSuccess: PropTypes.func.isRequired
};

export default PaymentPage;