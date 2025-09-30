import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, User, Mail, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { validators, validateField, formatters, sanitizers } from '../../utils/validation';

const BookingForm = ({ selectedPackage, selectedSlot, onBack, onNext }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules for each field
  const validationRules = {
    name: [
      { validator: validators.required, message: 'Full name is required' },
      { validator: validators.name, message: 'Please enter a valid name (2-50 characters, letters only)' }
    ],
    email: [
      { validator: validators.required, message: 'Email address is required' },
      { validator: validators.email, message: 'Please enter a valid email address' }
    ],
    phone: [
      { validator: validators.required, message: 'Phone number is required' },
      { validator: validators.phone, message: 'Please enter a valid Sri Lankan phone number (07X XXX XXXX or 0XX XXX XXXX)' }
    ],
    address: [
      { validator: validators.required, message: 'Address is required' },
      { validator: validators.address, message: 'Address must be between 10-200 characters' }
    ]
  };

  // Real-time field validation
  const validateSingleField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  };

  // Handle input change with real-time validation and formatting
  const handleInputChange = (name, value) => {
    // Sanitize input based on field type
    let sanitizedValue = value;
    switch (name) {
      case 'name':
        sanitizedValue = sanitizers.name(value);
        break;
      case 'email':
        sanitizedValue = sanitizers.email(value);
        break;
      case 'phone':
        sanitizedValue = sanitizers.phone(value);
        break;
      default:
        sanitizedValue = value.trim();
    }

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));

    // Real-time validation for touched fields
    if (fieldTouched[name]) {
      const error = validateSingleField(name, sanitizedValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle field blur (mark as touched and validate)
  const handleFieldBlur = (name) => {
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    const error = validateSingleField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(validationRules).forEach(field => {
      const error = validateSingleField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Additional business logic validations
    if (formData.email && formData.email.length > 100) {
      newErrors.email = 'Email address is too long';
      isValid = false;
    }

    if (formData.name && formData.name.length > 50) {
      newErrors.name = 'Name is too long';
      isValid = false;
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone number is too long';
      isValid = false;
    }

    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setFieldTouched(allTouched);

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (validateForm()) {
        // Additional validation checks
        const totalAmount = selectedPackage.price + selectedSlot.price;
        
        if (totalAmount <= 0) {
          setErrors(prev => ({ 
            ...prev, 
            general: 'Invalid booking amount. Please try again.' 
          }));
          return;
        }

        const bookingDetails = {
          packageId: selectedPackage.id,
          slotId: selectedSlot.id,
          customerInfo: {
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim()
          },
          paymentMethod: 'card',
          totalAmount,
          timestamp: new Date().toISOString()
        };

        // Simulate API validation delay
        await new Promise(resolve => setTimeout(resolve, 500));

        onNext(bookingDetails);
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: 'An unexpected error occurred. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get field status for styling
  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (fieldTouched[fieldName] && formData[fieldName] && !errors[fieldName]) return 'success';
    return 'default';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">Booking Information</h2>
              <p className="text-purple-100">Please provide your contact details</p>
            </div>
          </div>
          
          {/* Booking Summary */}
          <div className="bg-white/10 rounded-lg p-4">
            <div className="grid md:grid-cols-2 gap-4 text-white">
              <div>
                <h4 className="font-semibold">{selectedPackage.name}</h4>
                <p className="text-sm text-purple-100">{selectedPackage.duration}</p>
                <p className="text-lg font-bold">${selectedPackage.price}</p>
              </div>
              <div>
                <h4 className="font-semibold">Time Slot</h4>
                <p className="text-sm text-purple-100">{selectedSlot.date} at {selectedSlot.time}</p>
                <p className="text-lg font-bold">${selectedSlot.price} booking fee</p>
              </div>
            </div>
            <div className="border-t border-white/20 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg">Total Amount:</span>
                <span className="text-2xl font-bold">${selectedPackage.price + selectedSlot.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.general}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-purple-600" />
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name')}
                  placeholder="Enter your full name"
                  maxLength={50}
                  className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                    getFieldStatus('name') === 'error' ? 'border-red-500 bg-red-50' :
                    getFieldStatus('name') === 'success' ? 'border-green-500 bg-green-50' :
                    'border-gray-300'
                  }`}
                />
                {getFieldStatus('name') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/50 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-purple-600" />
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  placeholder="your.email@example.com"
                  maxLength={100}
                  className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                    getFieldStatus('email') === 'error' ? 'border-red-500 bg-red-50' :
                    getFieldStatus('email') === 'success' ? 'border-green-500 bg-green-50' :
                    'border-gray-300'
                  }`}
                />
                {getFieldStatus('email') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                We'll send your booking confirmation here
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-purple-600" />
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleFieldBlur('phone')}
                  placeholder="077 123 4567 or 011 234 5678"
                  maxLength={20}
                  className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${
                    getFieldStatus('phone') === 'error' ? 'border-red-500 bg-red-50' :
                    getFieldStatus('phone') === 'success' ? 'border-green-500 bg-green-50' :
                    'border-gray-300'
                  }`}
                />
                {getFieldStatus('phone') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.phone}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Include country code for international numbers
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                Complete Address *
              </label>
              <div className="relative">
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onBlur={() => handleFieldBlur('address')}
                  placeholder="Street address, city, state/province, postal code, country"
                  rows={3}
                  maxLength={200}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none ${
                    getFieldStatus('address') === 'error' ? 'border-red-500 bg-red-50' :
                    getFieldStatus('address') === 'success' ? 'border-green-500 bg-green-50' :
                    'border-gray-300'
                  }`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.address.length}/200 characters - Include full address for accurate service
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <input type="checkbox" id="terms" className="mt-0.5" required />
                <label htmlFor="terms">
                  I agree to the <a href="#" className="text-purple-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-purple-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).some(key => errors[key])}
                className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSubmitting || Object.keys(errors).some(key => errors[key])
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Continue to Payment</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation
BookingForm.propTypes = {
  selectedPackage: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    duration: PropTypes.string.isRequired,
    description: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  selectedSlot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    available: PropTypes.bool
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired
};

export default BookingForm;