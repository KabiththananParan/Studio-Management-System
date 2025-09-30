import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentSuccess } from '../components';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedPackage, selectedSlot, bookingDetails, paymentData } = location.state || {};

  if (!bookingDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Information Missing</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <PaymentSuccess
      bookingDetails={bookingDetails}
      onNewBooking={() => navigate('/')}
    />
  );
};

export default SuccessPage;