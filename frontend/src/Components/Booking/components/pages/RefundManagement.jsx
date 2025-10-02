import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Calendar } from 'lucide-react';

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/refunds', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch refunds');
      }

      const data = await response.json();
      setRefunds(data.refunds || []);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading refunds...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Refund Management</h2>
              <p className="text-purple-100">Track and manage your refund requests</p>
            </div>
            <button
              onClick={fetchRefunds}
              className="flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">Error: {error}</p>
              </div>
            </div>
          )}

          {refunds.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Refund Requests</h3>
              <p className="text-gray-500">You haven't submitted any refund requests yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {refunds.map((refund) => (
                <div key={refund._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-lg font-semibold text-gray-800 mr-3">
                          Refund #{refund.refundNumber}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                          {getStatusIcon(refund.status)}
                          <span className="ml-1 capitalize">{refund.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Booking ID:</span> {refund.bookingId}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Requested:</span> {formatDate(refund.requestDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(refund.requestedAmount)}</p>
                      {refund.approvedAmount && refund.approvedAmount !== refund.requestedAmount && (
                        <p className="text-sm text-green-600">
                          Approved: {formatCurrency(refund.approvedAmount)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
                        <p className="text-sm text-gray-600 capitalize">{refund.reason.replace('_', ' ')}</p>
                        {refund.reasonDescription && (
                          <p className="text-sm text-gray-500 mt-1">{refund.reasonDescription}</p>
                        )}
                      </div>
                      {refund.adminNotes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes</p>
                          <p className="text-sm text-gray-600">{refund.adminNotes}</p>
                        </div>
                      )}
                    </div>

                    {(refund.approvedDate || refund.processedDate) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          {refund.approvedDate && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Approved: {formatDate(refund.approvedDate)}</span>
                            </div>
                          )}
                          {refund.processedDate && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Processed: {formatDate(refund.processedDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefundManagement;
