import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookingForm } from '../components';

const CustomerDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedPackage, selectedSlot } = location.state || {};

  if (!selectedPackage || !selectedSlot) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Information Missing</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Start New Booking
        </button>
      </div>
    );
  }

  const handleBookingNext = (bookingDetails) => {
    navigate('/payment', {
      state: {
        selectedPackage,
        selectedSlot,
        bookingDetails,
        newBookingId: bookingDetails.newBookingId
      }
    });
  };

  return (
    <BookingForm
      selectedPackage={selectedPackage}
      selectedSlot={selectedSlot}
      onBack={() => navigate('/booking')}
      onNext={handleBookingNext}
    />
  );
};

export default CustomerDetailsPage;
