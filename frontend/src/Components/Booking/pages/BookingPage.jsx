import React from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { SlotSelection } from '../components';

const BookingPage = ({ packages, onSlotSelect }) => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  
  const selectedPackage = packages.find(p => p.id === packageId);

  if (!selectedPackage) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  return (
    <SlotSelection 
      selectedPackage={selectedPackage}
      onBack={() => navigate('/')}
      onSlotSelect={(slot) => onSlotSelect(selectedPackage, slot)}
    />
  );
};

// PropTypes validation
BookingPage.propTypes = {
  packages: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSlotSelect: PropTypes.func.isRequired
};

export default BookingPage;