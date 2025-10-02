import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const RentalPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [rentalBooking, setRentalBooking] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Get booking ID from URL params or location state
  const bookingId = searchParams.get('bookingId') || location.state?.bookingId;

  useEffect(() => {
    if (bookingId) {
      fetchRentalBookingDetails();
    } else {
      setError('No booking ID provided');
      setLoading(false);
    }
  }, [bookingId]);

  const fetchRentalBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/inventory-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const booking = data.data?.bookings?.find(b => b._id === bookingId) || 
                       data.bookings?.find(b => b._id === bookingId);
        
        if (booking) {
          setRentalBooking(booking);
        } else {
          setError('Rental booking not found');
        }
      } else {
        setError('Failed to fetch booking details');
      }
    } catch (error) {
      console.error('Error fetching rental booking:', error);
      setError('Error loading booking details');
    } finally {
      setLoading(false);
    }
  };

  const validatePaymentDetails = () => {
    const errors = {};

    if (selectedMethod === 'card') {
      if (!paymentDetails.cardNumber) errors.cardNumber = 'Card number is required';
      if (!paymentDetails.expiryDate) errors.expiryDate = 'Expiry date is required';
      if (!paymentDetails.cvv) errors.cvv = 'CVV is required';
      if (!paymentDetails.cardholderName) errors.cardholderName = 'Cardholder name is required';
    } else if (selectedMethod === 'bank_transfer') {
      if (!paymentDetails.accountNumber) errors.accountNumber = 'Account number is required';
      if (!paymentDetails.bankName) errors.bankName = 'Bank name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentDetailsChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const processPayment = async () => {
    if (!validatePaymentDetails()) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const paymentPayload = {
        bookingId: rentalBooking._id,
        paymentMethod: selectedMethod,
        currency: 'LKR',
        bookingType: 'inventory',
        paymentDetails: {
          customerName: `${rentalBooking.user?.firstName} ${rentalBooking.user?.lastName}`,
          equipmentList: rentalBooking.items?.map(item => item.inventory?.name).join(', '),
          ...paymentDetails
        }
      };

      console.log('Processing rental payment:', paymentPayload);

      const response = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to success page
        navigate('/rental-payment-success', {
          state: {
            booking: result.booking,
            payment: result.payment,
            message: result.message
          }
        });
      } else {
        setError(result.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethodForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                value={paymentDetails.cardNumber || ''}
                onChange={(e) => handlePaymentDetailsChange('cardNumber', e.target.value)}
              />
              {validationErrors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={paymentDetails.expiryDate || ''}
                  onChange={(e) => handlePaymentDetailsChange('expiryDate', e.target.value)}
                />
                {validationErrors.expiryDate && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.expiryDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={paymentDetails.cvv || ''}
                  onChange={(e) => handlePaymentDetailsChange('cvv', e.target.value)}
                />
                {validationErrors.cvv && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.cardholderName ? 'border-red-500' : 'border-gray-300'
                }`}
                value={paymentDetails.cardholderName || ''}
                onChange={(e) => handlePaymentDetailsChange('cardholderName', e.target.value)}
              />
              {validationErrors.cardholderName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.cardholderName}</p>
              )}
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.bankName ? 'border-red-500' : 'border-gray-300'
                }`}
                value={paymentDetails.bankName || ''}
                onChange={(e) => handlePaymentDetailsChange('bankName', e.target.value)}
              >
                <option value="">Select your bank</option>
                <option value="Bank of Ceylon">Bank of Ceylon</option>
                <option value="People's Bank">People's Bank</option>
                <option value="Commercial Bank">Commercial Bank</option>
                <option value="Hatton National Bank">Hatton National Bank</option>
                <option value="Sampath Bank">Sampath Bank</option>
              </select>
              {validationErrors.bankName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.bankName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Your account number"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                value={paymentDetails.accountNumber || ''}
                onChange={(e) => handlePaymentDetailsChange('accountNumber', e.target.value)}
              />
              {validationErrors.accountNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.accountNumber}</p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Transfer Instructions:</h4>
              <p className="text-sm text-blue-800">
                Please transfer the amount to our account and your booking will be confirmed once payment is verified.
              </p>
            </div>
          </div>
        );

      case 'cash':
        return (
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Cash Payment Instructions:</h4>
            <p className="text-sm text-green-800 mb-4">
              You can pay cash when you come to collect the equipment. Your booking is reserved and payment can be made at pickup.
            </p>
            <div className="text-sm text-green-700">
              <p><strong>Pickup Location:</strong> Main Studio, Ground Floor</p>
              <p><strong>Pickup Hours:</strong> 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !rentalBooking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payment</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Rental Payment</h1>
          <p className="text-gray-600">Secure payment for your equipment rental</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            <div className="space-y-3 mb-6">
              {[
                { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
                { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
                { id: 'cash', name: 'Cash Payment', icon: '💵' }
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </label>
              ))}
            </div>

            {renderPaymentMethodForm()}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Summary</h2>
            
            {rentalBooking && (
              <div className="space-y-4">
                {/* Equipment Items */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Equipment</h3>
                  <div className="space-y-2">
                    {rentalBooking.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.inventory?.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.inventory?.brand} {item.inventory?.model}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">LKR {item.pricing?.total?.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{item.duration} days</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rental Period */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Rental Period</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Start Date</p>
                        <p className="font-medium">
                          {new Date(rentalBooking.bookingDates?.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Date</p>
                        <p className="font-medium">
                          {new Date(rentalBooking.bookingDates?.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-green-600">
                      LKR {(rentalBooking.pricing?.total || rentalBooking.totalCost)?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 rounded-full p-2 mr-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-800">Payment Pending</p>
                      <p className="text-sm text-yellow-700">Complete payment to confirm your rental</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={processPayment}
                disabled={processing}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay LKR ${(rentalBooking?.pricing?.total || rentalBooking?.totalCost)?.toLocaleString()}`
                )}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalPaymentPage;