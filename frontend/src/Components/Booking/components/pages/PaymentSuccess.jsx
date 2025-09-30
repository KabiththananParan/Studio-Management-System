import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Download, Calendar, Clock, Mail, Phone } from 'lucide-react';

const PaymentSuccess = ({ bookingDetails, onNewBooking }) => {
  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    // Generate invoice ID
    const id = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    setInvoiceId(id);
  }, []);

  const downloadInvoice = () => {
    // Create a simple invoice content
    const invoiceContent = `
INVOICE - ${invoiceId}
======================================

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Customer Information:
- Name: ${bookingDetails.customerInfo.name}
- Email: ${bookingDetails.customerInfo.email}
- Phone: ${bookingDetails.customerInfo.phone}
- Address: ${bookingDetails.customerInfo.address}

Booking Details:
- Package: Studio Package
- Amount: $${bookingDetails.totalAmount}
- Payment Method: ${bookingDetails.paymentMethod}
- Status: Completed

Thank you for your business!
PhotoStudio Pro - Professional Photography Studios
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-8 text-center text-white">
          <div className="mb-4">
            <CheckCircle className="w-20 h-20 mx-auto text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-green-100 text-lg">Your studio session has been booked successfully</p>
        </div>

        {/* Booking Details */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Confirmation</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Booking Date</p>
                    <p className="font-semibold">Studio Session Booked</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-green-600">${bookingDetails.totalAmount}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{bookingDetails.customerInfo.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{bookingDetails.customerInfo.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Invoice & Receipt</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="mb-4">
                <div className="bg-blue-100 rounded-full p-3 inline-block mb-3">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Download Your Invoice</h4>
                <p className="text-gray-600">Invoice ID: {invoiceId}</p>
              </div>
              
              <button
                onClick={downloadInvoice}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 inline-flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Invoice</span>
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Confirmation Email Sent</p>
                  <p className="text-sm text-gray-600">Check your email for detailed booking information</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Studio Contact</p>
                  <p className="text-sm text-gray-600">Our team will contact you 24 hours before your photo session</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Payment Recorded</p>
                  <p className="text-sm text-gray-600">Your transaction has been saved to payment history</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-1 mt-1">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Refund Policy</p>
                  <p className="text-sm text-gray-600">Free cancellation up to 48 hours before your photo session</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onNewBooking}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Book Another Photo Session
            </button>
            
            <button
              onClick={() => window.location.href = 'mailto:support@photostudiopro.com'}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes validation
PaymentSuccess.propTypes = {
  bookingDetails: PropTypes.shape({
    totalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    paymentMethod: PropTypes.string.isRequired,
    customerInfo: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      address: PropTypes.string
    }).isRequired,
    transactionId: PropTypes.string,
    processedAt: PropTypes.string
  }).isRequired,
  onNewBooking: PropTypes.func.isRequired
};

export default PaymentSuccess;