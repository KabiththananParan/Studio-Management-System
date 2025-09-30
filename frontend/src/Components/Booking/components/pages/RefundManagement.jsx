import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RefreshCcw, FileText, Clock, CheckCircle, AlertCircle, DollarSign, Calendar, Info } from 'lucide-react';
import { validators, businessRules } from '../../utils/validation';

const RefundManagement = ({ transactions = [] }) => {
  const [refundableTransactions] = useState(
    transactions.filter(t => t.canRefund && t.status === 'completed')
  );
  const [refundRequests, setRefundRequests] = useState([
    {
      id: 'REF001',
      transactionId: 'TXN001',
      packageName: 'Premium Studio Package',
      amount: 350,
      reason: 'Schedule conflict - unable to attend',
      status: 'approved',
      requestDate: '2025-01-16',
      processedDate: '2025-01-17'
    }
  ]);
  
  const [formData, setFormData] = useState({
    selectedTransaction: '',
    refundReason: '',
    refundAmount: 0,
    contactEmail: '',
    additionalInfo: ''
  });
  
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedRefund, setCalculatedRefund] = useState({ amount: 0, percentage: 100, fee: 0 });

  // Validation rules for refund request
  const getValidationRules = () => ({
    selectedTransaction: [
      { validator: validators.required, message: 'Please select a transaction to refund' }
    ],
    refundReason: [
      { validator: validators.required, message: 'Please provide a reason for the refund' },
      { validator: (value) => value.length >= 10, message: 'Reason must be at least 10 characters long' },
      { validator: (value) => value.length <= 500, message: 'Reason cannot exceed 500 characters' }
    ],
    contactEmail: [
      { validator: validators.required, message: 'Contact email is required' },
      { validator: validators.email, message: 'Please enter a valid email address' }
    ]
  });

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

  // Handle input changes with validation
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation for touched fields
    if (fieldTouched[name]) {
      const error = validateSingleField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Recalculate refund when transaction changes
    if (name === 'selectedTransaction') {
      calculateRefundAmount(value);
    }
  };

  // Handle field blur
  const handleFieldBlur = (name) => {
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    const error = validateSingleField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Calculate refund amount based on business rules
  const calculateRefundAmount = (transactionId) => {
    if (!transactionId) {
      setCalculatedRefund({ amount: 0, percentage: 100, fee: 0 });
      return;
    }

    const transaction = refundableTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Calculate days until booking
    const bookingDate = new Date(transaction.date);
    const today = new Date();
    const daysUntilBooking = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let processingFee = 0;

    // Apply refund policy
    if (daysUntilBooking >= 2) {
      refundPercentage = 100;
    } else if (daysUntilBooking >= 1) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    // Apply processing fee for partial refunds
    if (refundPercentage > 0 && refundPercentage < 100) {
      processingFee = Math.min(transaction.amount * 0.05, 25); // 5% or $25, whichever is lower
    }

    const refundAmount = Math.max(0, (transaction.amount * refundPercentage / 100) - processingFee);

    setCalculatedRefund({
      amount: refundAmount,
      percentage: refundPercentage,
      fee: processingFee
    });

    setFormData(prev => ({ ...prev, refundAmount: refundAmount }));
  };

  // Comprehensive form validation
  const validateForm = () => {
    const rules = getValidationRules();
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(rules).forEach(field => {
      const error = validateSingleField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Business rule validations
    if (formData.selectedTransaction) {
      const transaction = refundableTransactions.find(t => t.id === formData.selectedTransaction);
      
      if (!transaction) {
        newErrors.selectedTransaction = 'Selected transaction is no longer available';
        isValid = false;
      } else {
        // Check if refund is still possible
        const bookingDate = new Date(transaction.date);
        const today = new Date();
        
        if (bookingDate <= today) {
          newErrors.selectedTransaction = 'Cannot refund past bookings';
          isValid = false;
        }

        // Check if refund amount is valid
        if (calculatedRefund.amount <= 0) {
          newErrors.refundAmount = 'No refund available for this booking based on our refund policy';
          isValid = false;
        }

        // Check for existing refund requests
        const existingRequest = refundRequests.find(r => 
          r.transactionId === transaction.id && 
          ['pending', 'approved'].includes(r.status)
        );
        if (existingRequest) {
          newErrors.selectedTransaction = 'A refund request already exists for this transaction';
          isValid = false;
        }
      }
    }

    // Mark all fields as touched
    const touched = Object.keys(rules).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setFieldTouched(touched);

    setErrors(newErrors);
    return isValid;
  };

  // Enhanced refund request handler
  const handleRefundRequest = async (e) => {
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

    setIsSubmitting(true);

    try {
      const transaction = refundableTransactions.find(t => t.id === formData.selectedTransaction);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newRefundRequest = {
        id: `REF${String(refundRequests.length + 1).padStart(3, '0')}`,
        transactionId: transaction.id,
        packageName: transaction.packageName,
        originalAmount: transaction.amount,
        refundAmount: calculatedRefund.amount,
        processingFee: calculatedRefund.fee,
        refundPercentage: calculatedRefund.percentage,
        reason: formData.refundReason.trim(),
        contactEmail: formData.contactEmail.trim(),
        additionalInfo: formData.additionalInfo?.trim(),
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0],
        expectedProcessingDays: '3-5 business days'
      };

      setRefundRequests([newRefundRequest, ...refundRequests]);
      
      // Reset form
      setFormData({
        selectedTransaction: '',
        refundReason: '',
        refundAmount: 0,
        contactEmail: '',
        additionalInfo: ''
      });
      setErrors({});
      setFieldTouched({});
      setCalculatedRefund({ amount: 0, percentage: 100, fee: 0 });
      setShowForm(false);

      // Success message could be shown here
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit refund request. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when opening/closing
  useEffect(() => {
    if (!showForm) {
      setFormData({
        selectedTransaction: '',
        refundReason: '',
        refundAmount: 0,
        contactEmail: '',
        additionalInfo: ''
      });
      setErrors({});
      setFieldTouched({});
      setCalculatedRefund({ amount: 0, percentage: 100, fee: 0 });
    }
  }, [showForm]);

  // Get field status for styling
  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return 'error';
    if (fieldTouched[fieldName] && formData[fieldName] && !errors[fieldName]) return 'success';
    return 'default';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Refund Management</h2>
          <p className="text-purple-100">Request refunds and track refund status</p>
        </div>

        <div className="p-6">
          {/* Refund Policy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Refund Policy</h3>
                <div className="text-blue-800 space-y-1">
                  <p>• <strong>Full Refund:</strong> Cancellations made 48+ hours before session</p>
                  <p>• <strong>50% Refund:</strong> Cancellations made 24-48 hours before photo session</p>
                  <p>• <strong>No Refund:</strong> Cancellations made less than 24 hours before photo session</p>
                  <p>• <strong>Processing Time:</strong> Refunds typically processed within 3-5 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Request New Refund */}
          {refundableTransactions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Request Refund</h3>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  {showForm ? 'Cancel' : 'New Refund Request'}
                </button>
              </div>

              {showForm && (
                <form onSubmit={handleRefundRequest} className="bg-gray-50 rounded-lg p-6 space-y-6">
                  {/* Transaction Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Transaction to Refund
                    </label>
                    <div className="relative">
                      <select
                        name="selectedTransaction"
                        value={formData.selectedTransaction}
                        onChange={(e) => handleInputChange('selectedTransaction', e.target.value)}
                        onBlur={() => handleFieldBlur('selectedTransaction')}
                        className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                          getFieldStatus('selectedTransaction') === 'error' ? 'border-red-500 bg-red-50' :
                          getFieldStatus('selectedTransaction') === 'success' ? 'border-green-500 bg-green-50' :
                          'border-gray-300'
                        }`}
                      >
                        <option value="">Choose a transaction to refund</option>
                        {refundableTransactions.map(transaction => (
                          <option key={transaction.id} value={transaction.id}>
                            {transaction.packageName} - ${transaction.amount} ({new Date(transaction.date).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      {getFieldStatus('selectedTransaction') === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                      )}
                      {getFieldStatus('selectedTransaction') === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                      )}
                    </div>
                    {errors.selectedTransaction && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.selectedTransaction}
                      </p>
                    )}
                  </div>

                  {/* Refund Calculation Display */}
                  {formData.selectedTransaction && calculatedRefund.amount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="text-lg font-semibold text-green-900">Refund Calculation</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Original Amount:</span>
                          <span className="font-medium">${refundableTransactions.find(t => t.id === formData.selectedTransaction)?.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Refund Percentage:</span>
                          <span className="font-medium">{calculatedRefund.percentage}%</span>
                        </div>
                        {calculatedRefund.fee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-green-700">Processing Fee:</span>
                            <span className="font-medium">-${calculatedRefund.fee}</span>
                          </div>
                        )}
                        <hr className="border-green-200" />
                        <div className="flex justify-between font-bold text-green-900">
                          <span>Refund Amount:</span>
                          <span className="text-lg">${calculatedRefund.amount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        onBlur={() => handleFieldBlur('contactEmail')}
                        placeholder="your.email@example.com"
                        className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                          getFieldStatus('contactEmail') === 'error' ? 'border-red-500 bg-red-50' :
                          getFieldStatus('contactEmail') === 'success' ? 'border-green-500 bg-green-50' :
                          'border-gray-300'
                        }`}
                      />
                      {getFieldStatus('contactEmail') === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-3.5" />
                      )}
                      {getFieldStatus('contactEmail') === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500 absolute right-3 top-3.5" />
                      )}
                    </div>
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.contactEmail}
                      </p>
                    )}
                  </div>

                  {/* Refund Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Refund *
                    </label>
                    <div className="relative">
                      <textarea
                        name="refundReason"
                        value={formData.refundReason}
                        onChange={(e) => handleInputChange('refundReason', e.target.value)}
                        onBlur={() => handleFieldBlur('refundReason')}
                        placeholder="Please provide a detailed explanation for your refund request..."
                        rows={4}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none ${
                          getFieldStatus('refundReason') === 'error' ? 'border-red-500 bg-red-50' :
                          getFieldStatus('refundReason') === 'success' ? 'border-green-500 bg-green-50' :
                          'border-gray-300'
                        }`}
                        maxLength={500}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {formData.refundReason.length}/500
                      </div>
                    </div>
                    {errors.refundReason && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.refundReason}
                      </p>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      placeholder="Any additional details that might help us process your request..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                      maxLength={300}
                    />
                    <div className="text-xs text-gray-400 mt-1">{formData.additionalInfo.length}/300</div>
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
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || Object.keys(errors).some(key => key !== 'submit' && errors[key])}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isSubmitting || Object.keys(errors).some(key => key !== 'submit' && errors[key])
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-lg'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          <span>Submit Refund Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Refund Requests History */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Refund Requests</h3>
            
            {refundRequests.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No refund requests</h4>
                <p className="text-gray-600">You haven't made any refund requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {refundRequests.map(request => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-semibold text-gray-900">{request.packageName}</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="space-y-2">
                            <p><strong>Request ID:</strong> {request.id}</p>
                            <p><strong>Transaction ID:</strong> {request.transactionId}</p>
                            <p className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <strong>Requested:</strong> {new Date(request.requestDate).toLocaleDateString()}
                            </p>
                            {request.processedDate && (
                              <p className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                <strong>Processed:</strong> {new Date(request.processedDate).toLocaleDateString()}
                              </p>
                            )}
                            {request.expectedProcessingDays && !request.processedDate && (
                              <p className="flex items-center text-blue-600">
                                <Info className="w-4 h-4 mr-1" />
                                <strong>Expected:</strong> {request.expectedProcessingDays}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {request.originalAmount && (
                              <p><strong>Original Amount:</strong> ${request.originalAmount}</p>
                            )}
                            {request.refundPercentage && (
                              <p><strong>Refund Rate:</strong> {request.refundPercentage}%</p>
                            )}
                            {request.processingFee > 0 && (
                              <p><strong>Processing Fee:</strong> -${request.processingFee}</p>
                            )}
                            {request.contactEmail && (
                              <p><strong>Contact:</strong> {request.contactEmail}</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm"><strong>Reason:</strong></p>
                          <p className="text-sm text-gray-700 mt-1">{request.reason}</p>
                        </div>

                        {request.additionalInfo && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm"><strong>Additional Information:</strong></p>
                            <p className="text-sm text-blue-700 mt-1">{request.additionalInfo}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right lg:ml-6">
                        <div className="text-3xl font-bold text-gray-900 flex items-center justify-end">
                          <DollarSign className="w-6 h-6 mr-1" />
                          {request.refundAmount || request.amount}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">Refund Amount</div>
                        
                        {request.status === 'pending' && (
                          <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                            Processing...
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                            Approved
                          </div>
                        )}
                        {request.status === 'rejected' && (
                          <div className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                            Rejected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation
RefundManagement.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    packageName: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    canRefund: PropTypes.bool.isRequired
  }))
};

export default RefundManagement;