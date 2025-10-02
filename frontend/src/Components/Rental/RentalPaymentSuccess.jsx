import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RentalPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { booking, payment, message } = location.state || {};

  if (!payment || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Information Not Found</h3>
          <p className="text-gray-600 mb-4">Unable to load payment confirmation details.</p>
          <button
            onClick={() => navigate('/user/inventory-dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-6">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-4">{message}</p>
          <p className="text-gray-600">Your equipment rental has been confirmed and is ready for pickup.</p>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-medium text-gray-900">{payment.transactionId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900 capitalize">{payment.method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="font-medium text-green-600">LKR {payment.amount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {payment.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Rental Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Details</h2>
          
          {/* Equipment List */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Equipment Rented</h3>
            <div className="space-y-2">
              {booking.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {item.inventory?.images?.[0] && (
                      <img
                        src={item.inventory.images[0]}
                        alt={item.inventory.name}
                        className="w-12 h-12 object-cover rounded-lg mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.inventory?.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.inventory?.brand} {item.inventory?.model}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{item.duration} days</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Pickup Date</p>
              <p className="font-medium text-gray-900">
                {new Date(booking.bookingDates?.startDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Return Date</p>
              <p className="font-medium text-gray-900">
                {new Date(booking.bookingDates?.endDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Booking Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">Booking Confirmed</p>
                <p className="text-sm text-blue-800">Your equipment is being prepared for pickup</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Payment Confirmed</p>
                <p className="text-sm text-gray-600">Your payment has been successfully processed</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-1">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Equipment Preparation</p>
                <p className="text-sm text-gray-600">We're preparing your equipment and will notify you when it's ready</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-gray-200 rounded-full p-1 mr-3 mt-1">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Pickup Equipment</p>
                <p className="text-sm text-gray-600">Come to our studio on your pickup date to collect the equipment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pickup Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Studio Location</h3>
              <p className="text-gray-600 text-sm">
                Main Studio<br />
                Ground Floor<br />
                123 Photography Street<br />
                Colombo 03, Sri Lanka
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Pickup Hours</h3>
              <p className="text-gray-600 text-sm">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 4:00 PM<br />
                Sunday: 10:00 AM - 2:00 PM
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please bring a valid ID and this confirmation when picking up your equipment.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/user/inventory-dashboard')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            View My Rentals
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
          >
            Print Confirmation
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
          >
            Book More Equipment
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalPaymentSuccess;