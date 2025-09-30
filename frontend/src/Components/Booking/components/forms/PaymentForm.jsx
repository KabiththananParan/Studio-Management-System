import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, CreditCard, Smartphone, Building2, Shield, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { validators, formatters, businessRules } from '../../utils/validation';

const PaymentForm = ({ bookingDetails, onBack, onPaymentSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    walletType: '',
    bankAccount: '',
    routingNumber: '',
    savePaymentInfo: false,
    billingAddressSame: true
  });
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation rules for different payment methods
  const getValidationRules = () => {
    const baseRules = {
      amount: [
        { validator: validators.required, message: 'Amount is required' },
        { validator: (value) => businessRules.validPaymentAmount(value), message: 'Invalid payment amount' }
      ]
    };

    if (paymentMethod === 'card') {
      return {
        ...baseRules,
        cardNumber: [
          { validator: validators.required, message: 'Card number is required' },
          { validator: validators.cardNumber, message: 'Please enter a valid card number' }
        ],
        expiryDate: [
          { validator: validators.required, message: 'Expiry date is required' },
          { validator: validators.expiryDate, message: 'Please enter a valid expiry date (MM/YY)' }
        ],
        cvv: [
          { validator: validators.required, message: 'CVV is required' },
          { validator: validators.cvv, message: 'Please enter a valid 3-4 digit CVV' }
        ],
        cardholderName: [
          { validator: validators.required, message: 'Cardholder name is required' },
          { validator: validators.name, message: 'Please enter a valid cardholder name' }
        ]
      };
    } else if (paymentMethod === 'wallet') {
      return {
        ...baseRules,
        walletType: [
          { validator: validators.required, message: 'Please select a wallet type' }
        ]
      };
    } else if (paymentMethod === 'bank') {
      return {
        ...baseRules,
        bankAccount: [
          { validator: validators.required, message: 'Bank account number is required' },
          { validator: validators.bankAccount, message: 'Please enter a valid account number (8-17 digits)' }
        ],
        routingNumber: [
          { validator: validators.required, message: 'Routing number is required' },
          { validator: validators.routingNumber, message: 'Please enter a valid 9-digit routing number' }
        ]
      };
    }

    return baseRules;
  };

  // Real-time field validation
  const validateSingleField = (name, value) => {
    const rules = getValidationRules()[name];
    if (!rules) return null;

    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  };

  // Handle input changes with formatting and validation
  const handleInputChange = (name, value) => {
    let formattedValue = value;

    // Apply formatting based on field type
    switch (name) {
      case 'cardNumber':
        formattedValue = formatters.cardNumber(value);
        break;
      case 'expiryDate':
        formattedValue = formatters.expiryDate(value);
        break;
      case 'cvv':
        formattedValue = value.replace(/\D/g, '').substring(0, 4);
        break;
      case 'bankAccount':
        formattedValue = value.replace(/\D/g, '').substring(0, 17);
        break;
      case 'routingNumber':
        formattedValue = value.replace(/\D/g, '').substring(0, 9);
        break;
      default:
        break;
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    // Real-time validation for touched fields
    if (fieldTouched[name]) {
      const error = validateSingleField(name, formattedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle field blur
  const handleFieldBlur = (name) => {
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    const error = validateSingleField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Comprehensive form validation
  const validateForm = () => {
    const rules = getValidationRules();
    const newErrors = {};
    let isValid = true;

    // Validate all relevant fields
    Object.keys(rules).forEach(field => {
      if (formData.hasOwnProperty(field) || field === 'amount') {
        const value = field === 'amount' ? bookingDetails.totalAmount : formData[field];
        const error = validateSingleField(field, value);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    // Additional security checks
    if (paymentMethod === 'card') {
      // Check for suspicious card patterns
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      if (cardNumber && /^(\d)\1+$/.test(cardNumber)) {
        newErrors.cardNumber = 'Please enter a valid card number';
        isValid = false;
      }

      // Validate expiry date is not too far in future (10 years max)
      if (formData.expiryDate && validators.expiryDate(formData.expiryDate)) {
        const [month, year] = formData.expiryDate.split('/');
        const expYear = 2000 + parseInt(year, 10);
        const currentYear = new Date().getFullYear();
        if (expYear > currentYear + 10) {
          newErrors.expiryDate = 'Expiry date seems too far in the future';
          isValid = false;
        }
      }
    }

    // Mark all relevant fields as touched
    const relevantFields = Object.keys(rules);
    const touched = relevantFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setFieldTouched(touched);

    setErrors(newErrors);
    return isValid;
  };

  // Get field status for styling
  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (fieldTouched[fieldName] && formData[fieldName] && !errors[fieldName]) return 'success';
    return 'default';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.focus();
        }
      }
      return;
    }

    try {
      setIsProcessing(true);
      
      // Additional validation before processing
      const sanitizedData = {
        ...formData,
        cardholderName: formData.cardholderName?.trim(),
        cardNumber: formData.cardNumber?.replace(/\s/g, '')
      };

      // Simulate payment processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentSuccess({
        ...bookingDetails,
        paymentMethod,
        paymentData: {
          ...sanitizedData,
          // Mask sensitive data for storage
          cardNumber: paymentMethod === 'card' ? 
            '**** **** **** ' + sanitizedData.cardNumber?.slice(-4) : undefined,
          cvv: undefined // Never store CVV
        },
        transactionId: 'TXN' + Date.now(),
        processedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Payment error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Payment processing failed. Please try again.'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Payment method selection handler
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Reset form data when changing payment methods
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      walletType: '',
      bankAccount: '',
      routingNumber: ''
    });
    setErrors({});
    setFieldTouched({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="mr-4 p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <p className="text-purple-100">Secure checkout with multiple payment options</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center text-white">
              <span className="text-lg">Total Amount:</span>
              <span className="text-3xl font-bold">${bookingDetails.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Payment Method Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
                { id: 'wallet', label: 'Digital Wallet', icon: Smartphone, desc: 'PayPal, Apple Pay, Google Pay' },
                { id: 'bank', label: 'Bank Transfer', icon: Building2, desc: 'Direct bank transfer' }
              ].map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => handlePaymentMethodChange(id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    paymentMethod === id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Icon className={`w-5 h-5 mr-2 ${paymentMethod === id ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      onBlur={() => handleFieldBlur('cardNumber')}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        getFieldStatus('cardNumber') === 'error' ? 'border-red-500 bg-red-50' :
                        getFieldStatus('cardNumber') === 'success' ? 'border-green-500 bg-green-50' :
                        'border-gray-300'
                      }`}
                      maxLength={19}
                    />
                    {getFieldStatus('cardNumber') === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                    )}
                    {getFieldStatus('cardNumber') === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                    )}
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        onBlur={() => handleFieldBlur('expiryDate')}
                        placeholder="MM/YY"
                        className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                          getFieldStatus('expiryDate') === 'error' ? 'border-red-500 bg-red-50' :
                          getFieldStatus('expiryDate') === 'success' ? 'border-green-500 bg-green-50' :
                          'border-gray-300'
                        }`}
                        maxLength={5}
                      />
                      {getFieldStatus('expiryDate') === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                      )}
                      {getFieldStatus('expiryDate') === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                      )}
                    </div>
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        onBlur={() => handleFieldBlur('cvv')}
                        placeholder="123"
                        className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                          getFieldStatus('cvv') === 'error' ? 'border-red-500 bg-red-50' :
                          getFieldStatus('cvv') === 'success' ? 'border-green-500 bg-green-50' :
                          'border-gray-300'
                        }`}
                        maxLength={4}
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                    </div>
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      onBlur={() => handleFieldBlur('cardholderName')}
                      placeholder="John Doe"
                      className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        getFieldStatus('cardholderName') === 'error' ? 'border-red-500 bg-red-50' :
                        getFieldStatus('cardholderName') === 'success' ? 'border-green-500 bg-green-50' :
                        'border-gray-300'
                      }`}
                    />
                    {getFieldStatus('cardholderName') === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                    )}
                    {getFieldStatus('cardholderName') === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                    )}
                  </div>
                  {errors.cardholderName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cardholderName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Wallet
                </label>
                <div className="relative">
                  <select
                    name="walletType"
                    value={formData.walletType}
                    onChange={(e) => handleInputChange('walletType', e.target.value)}
                    onBlur={() => handleFieldBlur('walletType')}
                    className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      getFieldStatus('walletType') === 'error' ? 'border-red-500 bg-red-50' :
                      getFieldStatus('walletType') === 'success' ? 'border-green-500 bg-green-50' :
                      'border-gray-300'
                    }`}
                  >
                    <option value="">Choose a wallet</option>
                    <option value="paypal">PayPal</option>
                    <option value="apple">Apple Pay</option>
                    <option value="google">Google Pay</option>
                    <option value="samsung">Samsung Pay</option>
                  </select>
                  {getFieldStatus('walletType') === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                  )}
                  {getFieldStatus('walletType') === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                  )}
                </div>
                {errors.walletType && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.walletType}
                  </p>
                )}
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                      onBlur={() => handleFieldBlur('bankAccount')}
                      placeholder="1234567890"
                      className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        getFieldStatus('bankAccount') === 'error' ? 'border-red-500 bg-red-50' :
                        getFieldStatus('bankAccount') === 'success' ? 'border-green-500 bg-green-50' :
                        'border-gray-300'
                      }`}
                    />
                    {getFieldStatus('bankAccount') === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                    )}
                    {getFieldStatus('bankAccount') === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                    )}
                  </div>
                  {errors.bankAccount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.bankAccount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                      onBlur={() => handleFieldBlur('routingNumber')}
                      placeholder="021000021"
                      className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        getFieldStatus('routingNumber') === 'error' ? 'border-red-500 bg-red-50' :
                        getFieldStatus('routingNumber') === 'success' ? 'border-green-500 bg-green-50' :
                        'border-gray-300'
                      }`}
                      maxLength={9}
                    />
                    {getFieldStatus('routingNumber') === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                    )}
                    {getFieldStatus('routingNumber') === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                    )}
                  </div>
                  {errors.routingNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.routingNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Secure Payment</p>
                  <p className="text-sm text-green-600">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || Object.keys(errors).some(key => key !== 'submit' && errors[key])}
              className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                isProcessing || Object.keys(errors).some(key => key !== 'submit' && errors[key])
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Complete Payment - ${bookingDetails.totalAmount}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation
PaymentForm.propTypes = {
  bookingDetails: PropTypes.shape({
    totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    package: PropTypes.object,
    slots: PropTypes.array,
    customerInfo: PropTypes.object
  }).isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};

export default PaymentForm;