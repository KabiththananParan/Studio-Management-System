import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';

const PaymentPage = ({ onPaymentSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Check if coming from dashboard with bookingId or from booking flow
  const bookingId = searchParams.get('bookingId');
  const { selectedPackage, selectedSlot, bookingDetails, newBookingId } = location.state || {};

  useEffect(() => {
    fetchPaymentMethods();
    
    const targetBookingId = bookingId || newBookingId;
    if (targetBookingId) {
      fetchBookingDetails(targetBookingId);
    }
  }, [bookingId, newBookingId]);
  
  // Initialize validation when payment methods are loaded
  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethod && paymentMethods[0]) {
      setSelectedMethod(paymentMethods[0].id);
    }
  }, [paymentMethods]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments/methods');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods);
        if (data.paymentMethods.length > 0) {
          setSelectedMethod(data.paymentMethods[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

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
        setBookingData(data.booking || data);
      } else {
        setError('Failed to fetch booking details');
      }
    } catch (err) {
      setError('Error loading booking details');
    } finally {
      setLoading(false);
    }
  };

  // Get current booking data for payment
  // Validation functions
  const validateField = (fieldName, value, fieldConfig) => {
    const errors = [];
    
    // Required field validation
    if (fieldConfig.required && (!value || value.trim() === '')) {
      errors.push(`${fieldConfig.label} is required`);
      return errors;
    }
    
    if (!value || value.trim() === '') {
      return []; // If not required and empty, no further validation needed
    }
    
    // Field-specific validations
    switch (fieldName) {
      case 'cardNumber':
        const cleanCardNumber = value.replace(/\s+/g, '');
        if (!/^\d{13,19}$/.test(cleanCardNumber)) {
          errors.push('Card number must be 13-19 digits');
        }
        // Basic Luhn algorithm check
        if (!isValidCardNumber(cleanCardNumber)) {
          errors.push('Invalid card number');
        }
        break;
        
      case 'expiryDate':
        if (!/^\d{2}\/\d{2}$/.test(value)) {
          errors.push('Expiry date must be in MM/YY format');
        } else {
          const [month, year] = value.split('/').map(Number);
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          
          if (month < 1 || month > 12) {
            errors.push('Invalid month (01-12)');
          } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
            errors.push('Card has expired');
          }
        }
        break;
        
      case 'cvv':
        if (!/^\d{3,4}$/.test(value)) {
          errors.push('CVV must be 3-4 digits');
        }
        break;
        
      case 'cardholderName':
        if (value.length < 2) {
          errors.push('Name must be at least 2 characters');
        }
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors.push('Name must contain only letters and spaces');
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Please enter a valid email address');
        }
        break;
        
      case 'phone':
      case 'phoneNumber':
        // Sri Lankan phone number validation
        // Supports: +94771234567, 0771234567, +94 77 123 4567, 077 123 4567
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
        const sriLankanPhoneRegex = /^(\+94|0)?[1-9]\d{8}$/;
        
        if (!sriLankanPhoneRegex.test(cleanPhone)) {
          errors.push('Please enter a valid Sri Lankan phone number (e.g., +94 77 123 4567 or 0771234567)');
        }
        break;
        
      case 'accountNumber':
        if (!/^\d{8,20}$/.test(value)) {
          errors.push('Account number must be 8-20 digits');
        }
        break;
        
      case 'routingNumber':
        if (!/^\d{9}$/.test(value)) {
          errors.push('Routing number must be 9 digits');
        }
        break;
        
      case 'amount':
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
          errors.push('Amount must be a positive number');
        }
        break;
        
      default:
        // Generic validations for other fields
        if (fieldConfig.minLength && value.length < fieldConfig.minLength) {
          errors.push(`Minimum length is ${fieldConfig.minLength} characters`);
        }
        if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
          errors.push(`Maximum length is ${fieldConfig.maxLength} characters`);
        }
        break;
    }
    
    return errors;
  };
  
  // Luhn algorithm for credit card validation
  const isValidCardNumber = (cardNumber) => {
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return (sum % 10) === 0;
  };
  
  // Simplified form validation - allow all payments
  const validateForm = () => {
    const currentSelectedMethod = paymentMethods.find(method => method.id === selectedMethod);
    if (!currentSelectedMethod) return false;
    
    // Only check if required fields have some value (not empty)
    if (currentSelectedMethod.fields && currentSelectedMethod.fields.length > 0) {
      const requiredFields = currentSelectedMethod.fields.filter(field => field.required);
      const hasAllRequiredFields = requiredFields.every(field => {
        const value = paymentDetails[field.name];
        return value && value.trim() !== '';
      });
      return hasAllRequiredFields;
    }
    
    return true; // For payment methods without fields (like cash)
  };
  
  // Update form validity when payment details or selected method changes
  useEffect(() => {
    // Only validate if paymentMethods are loaded and selectedMethod is set
    if (paymentMethods.length > 0 && selectedMethod) {
      const isValid = validateForm();
      setIsFormValid(isValid);
    } else {
      setIsFormValid(false);
    }
  }, [paymentDetails, selectedMethod, paymentMethods]);

  const getCurrentBookingData = () => {
    if (bookingData) return bookingData;
    
    // If coming from booking flow, construct booking data
    if (selectedPackage && selectedSlot && bookingDetails) {
      return {
        _id: newBookingId,
        packageName: selectedPackage.name,
        totalAmount: selectedPackage.price + selectedSlot.price,
        customerInfo: bookingDetails,
        bookingDate: selectedSlot.date,
        bookingTime: selectedSlot.startTime,
        packageId: { name: selectedPackage.name, price: selectedPackage.price },
        slotId: { date: selectedSlot.date, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, price: selectedSlot.price }
      };
    }
    
    return null;
  };

  const currentBooking = getCurrentBookingData();

  // Handle input changes for payment details (simplified)
  const handlePaymentDetailChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any existing validation errors
    setValidationErrors({});
  };

  // Format card number input
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Process payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentBooking) {
      setError('No booking data available');
      return;
    }
    
    // Simple validation - just check payment method is selected
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }
    
    // For payment methods with required fields, check they have some value
    const currentSelectedMethod = paymentMethods.find(method => method.id === selectedMethod);
    if (currentSelectedMethod && currentSelectedMethod.fields) {
      const requiredFields = currentSelectedMethod.fields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => {
        const value = paymentDetails[field.name];
        return !value || value.trim() === '';
      });
      
      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
        return;
      }
    }

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const targetBookingId = bookingId || newBookingId || currentBooking._id;
      
      const paymentPayload = {
        bookingId: targetBookingId,
        paymentMethod: selectedMethod,
        paymentDetails,
        currency: 'USD'
      };

      console.log('Processing payment:', paymentPayload);

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
        // Navigate to success page with payment details
        navigate('/success', {
          state: {
            booking: result.booking,
            payment: result.payment,
            message: result.message
          }
        });

        // Call onPaymentSuccess if provided
        if (onPaymentSuccess) {
          onPaymentSuccess(result);
        }
      } else {
        setError(result.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Home-style Navbar */}
        <nav className="bg-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-blue-600">StudioPro</span>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
            <Link to="/userDashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">Book Now</Link>
          </div>
        </nav>
        
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl text-gray-900">Loading payment details...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error && !currentBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Home-style Navbar */}
        <nav className="bg-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-blue-600">StudioPro</span>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
            <Link to="/userDashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">Book Now</Link>
          </div>
        </nav>
        
        <div className="pt-20 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
            <button 
              onClick={() => navigate('/userDashboard')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Home-style Navbar */}
        <nav className="bg-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-blue-600">StudioPro</span>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
            <Link to="/userDashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">Book Now</Link>
          </div>
        </nav>
        
        <div className="pt-20 max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Information Missing</h2>
            <p className="text-gray-600 mb-6">Unable to load booking details for payment.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Start New Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);

  // Early return if payment methods not loaded yet
  if (paymentMethods.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Home-style Navbar */}
        <nav className="bg-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-blue-600">StudioPro</span>
          </div>
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
            <Link to="/userDashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">Book Now</Link>
          </div>
        </nav>
        
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl text-gray-900">Loading payment options...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Home-style Navbar */}
      <nav className="bg-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl text-blue-600">StudioPro</span>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
          <Link to="/userDashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
          <Link to="/booking" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">Book Now</Link>
        </div>
      </nav>
      
      {/* Add padding-top to account for fixed navbar */}
      <div className="pt-20 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure your booking with payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Package</p>
                  <p className="text-gray-900">{currentBooking.packageName}</p>
                  <p className="text-sm text-gray-500">LKR {(currentBooking.packageId?.price || 0).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Date & Time</p>
                  <p className="text-gray-900">
                    {new Date(currentBooking.bookingDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentBooking.bookingTime} - {currentBooking.slotId?.endTime}
                  </p>
                  <p className="text-sm text-gray-500">Slot fee: LKR {(currentBooking.slotId?.price || 0).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Customer</p>
                  <p className="text-gray-900">{currentBooking.customerInfo.name}</p>
                  <p className="text-sm text-gray-500">{currentBooking.customerInfo.email}</p>
                </div>
                
                <hr />
                
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-900">Total Amount</p>
                  <p className="text-xl font-bold text-purple-600">LKR {currentBooking.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Details</h3>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
              
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                          selectedMethod === method.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={() => setSelectedMethod(method.id)}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{method.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900">{method.name}</p>
                                <p className="text-sm text-gray-500">{method.description}</p>
                                {method.processingTime && (
                                  <p className={`text-xs mt-1 ${method.instantConfirmation ? 'text-green-600' : 'text-orange-600'}`}>
                                    ⏱️ {method.processingTime}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`w-4 h-4 border-2 rounded-full ${
                            selectedMethod === method.id
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedMethod === method.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method Specific Fields */}
                {selectedPaymentMethod && selectedPaymentMethod.fields.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      {selectedPaymentMethod.name} Details
                    </h4>
                    
                    {selectedPaymentMethod.fields.map((field) => {
                      return (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <input
                            type={field.type}
                            required={field.required}
                            maxLength={field.maxLength}
                            value={paymentDetails[field.name] || ''}
                            onChange={(e) => {
                              let value = e.target.value;
                              
                              // Apply basic formatting for specific fields
                              if (field.name === 'cardNumber') {
                                value = formatCardNumber(value);
                              } else if (field.name === 'expiryDate') {
                                value = formatExpiryDate(value);
                              } else if (field.name === 'cvv') {
                                value = value.replace(/[^0-9]/g, '');
                              }
                              
                              handlePaymentDetailChange(field.name, value);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors"
                            placeholder={field.placeholder || field.label}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Payment Instructions */}
                {selectedPaymentMethod && selectedPaymentMethod.instructions && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-blue-600">ℹ️</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-lg font-medium text-blue-800 mb-3">
                          {selectedPaymentMethod.instructions.title}
                        </h4>
                        <ul className="space-y-2">
                          {selectedPaymentMethod.instructions.details.map((detail, index) => (
                            <li key={index} className="text-sm text-blue-700 flex items-start">
                              <span className="mr-2 mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {selectedPaymentMethod.id === 'bank_transfer' && (
                          <div className="mt-4 p-3 bg-white border border-blue-300 rounded">
                            <p className="text-sm font-medium text-blue-800 mb-1">Important:</p>
                            <p className="text-sm text-blue-700">
                              Your booking will be confirmed immediately. Use your booking reference as the payment reference when making the transfer.
                            </p>
                          </div>
                        )}
                        
                        {selectedPaymentMethod.id === 'cash' && (
                          <div className="mt-4 p-3 bg-white border border-blue-300 rounded">
                            <p className="text-sm font-medium text-blue-800 mb-1">Note:</p>
                            <p className="text-sm text-blue-700">
                              Your session slot is reserved immediately. Please arrive with the exact amount to avoid delays.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Development Mode Notice */}
                {selectedPaymentMethod && (selectedPaymentMethod.id === 'bank_transfer' || selectedPaymentMethod.id === 'cash') && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-green-600">✅</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">
                          Development Mode - Instant Confirmation
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          In development mode, your booking will be confirmed immediately regardless of payment method. 
                          You will receive a confirmation email right away.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate(bookingId ? '/userDashboard' : '/customer-details', {
                      state: bookingId ? {} : { selectedPackage, selectedSlot }
                    })}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={processing || !selectedMethod}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      selectedPaymentMethod?.id === 'card' ? `Pay LKR ${currentBooking.totalAmount.toLocaleString()}` :
                      selectedPaymentMethod?.id === 'bank_transfer' ? `Confirm Booking - LKR ${currentBooking.totalAmount.toLocaleString()}` :
                      selectedPaymentMethod?.id === 'cash' ? `Reserve Slot - LKR ${currentBooking.totalAmount.toLocaleString()}` :
                      `Process Payment - LKR ${currentBooking.totalAmount.toLocaleString()}`
                    )}
                  </button>

                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation
PaymentPage.propTypes = {
  onPaymentSuccess: PropTypes.func.isRequired
};

export default PaymentPage;