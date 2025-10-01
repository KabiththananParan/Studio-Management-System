import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import UserSlotsSelector from '../components/UserSlotsSelector';
import { Clock, Star, ArrowRight } from 'lucide-react';

const BookingPage = ({ onSlotSelect }) => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/user/packages");
        
        if (!response.ok) {
          throw new Error("Failed to fetch packages");
        }
        
        const data = await response.json();
        setPackages(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // If packageId is provided, show slot selection
  if (packageId) {
    const selectedPackage = packages.find(p => p._id === packageId);

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package...</p>
        </div>
      );
    }

    if (!selectedPackage) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h2>
          <button 
            onClick={() => navigate('/booking')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Back to Packages
          </button>
        </div>
      );
    }

    return (
      <UserSlotsSelector 
        selectedPackage={selectedPackage}
        onBack={() => navigate('/booking')}
        onSlotSelect={(slot) => onSlotSelect(selectedPackage, slot)}
      />
    );
  }

  // Show all packages as cards
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Packages</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Studio Package
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select from our premium studio packages designed for photographers, videographers, and creative professionals.
          </p>
        </div>

        {/* Package Cards Grid */}
        {packages.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Packages Available</h3>
            <p className="text-gray-600">Check back later for new studio packages.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div 
                key={pkg._id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img 
                    src={pkg.image || '/src/assets/studio.jpg'} 
                    alt={pkg.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${pkg.price}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  
                  <div className="flex items-center mb-4 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{pkg.duration} hours</span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {pkg.features && pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/booking/${pkg._id}`)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 group"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes validation
BookingPage.propTypes = {
  onSlotSelect: PropTypes.func.isRequired
};

export default BookingPage;