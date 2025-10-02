import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign,
  Eye,
  Check,
  X,
  CreditCard,
  Calendar
} from 'lucide-react';

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approvedAmount: 0,
    adminNotes: ''
  });
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({});

  // Fetch refunds data
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/refunds?status=${filterStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch refunds');
      }

      const data = await response.json();
      setRefunds(data.refunds || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch refunds on component mount and when filter changes
  useEffect(() => {
    fetchRefunds();
  }, [filterStatus]);

  // Handle refund approval
  const handleApprove = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/refunds/${selectedRefund._id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalData)
      });

      if (!response.ok) {
        throw new Error('Failed to approve refund');
      }

      const data = await response.json();
      if (data.demo) {
        alert('🎭 DEMO MODE: Refund approved successfully!\n\nNote: This is a demonstration - no actual money transfer occurred.');
      } else {
        alert('Refund approved successfully!');
      }
      
      // Refresh refunds list
      await fetchRefunds();
      setShowApprovalModal(false);
      setSelectedRefund(null);
      setApprovalData({ approvedAmount: 0, adminNotes: '' });
    } catch (error) {
      console.error('Error approving refund:', error);
      alert('Error approving refund: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle refund rejection
  const handleReject = async (refundId, adminNotes) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/refunds/${refundId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes })
      });

      if (!response.ok) {
        throw new Error('Failed to reject refund');
      }

      alert('🎭 DEMO MODE: Refund rejected successfully!\n\nNote: This is a demonstration of the refund system workflow.');
      await fetchRefunds();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      alert('Error rejecting refund: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle process refund (mark as completed)
  const handleProcess = async (refundId) => {
    const transactionId = prompt('Enter refund transaction ID:');
    if (!transactionId) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/refunds/${refundId}/process`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          refundTransactionId: transactionId,
          adminNotes: 'Refund processed and completed'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();
      if (data.demo) {
        alert('🎭 DEMO MODE: Refund processed and completed!\n\nNote: This demonstrates the final step - in reality, money would be transferred to customer account.');
      } else {
        alert('Refund processed successfully!');
      }
      await fetchRefunds();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error processing refund: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Utility functions
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CreditCard className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openApprovalModal = (refund) => {
    setSelectedRefund(refund);
    setApprovalData({
      approvedAmount: refund.requestedAmount,
      adminNotes: ''
    });
    setShowApprovalModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Demo Mode Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <span className="text-blue-600 text-xl">🎭</span>
          </div>
          <div>
            <h3 className="text-blue-800 font-semibold">Demo Mode Active</h3>
            <p className="text-blue-600 text-sm">This is a demonstration of the refund system. No actual money transfers occur.</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Management</h1>
        <p className="text-gray-600">Review and manage customer refund requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendingRefunds || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-900">{stats.approvedRefunds || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-blue-900">{stats.completedRefunds || 0}</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRequestedAmount || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          onClick={fetchRefunds}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Refunds Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{refund.refundNumber}</div>
                      <div className="text-sm text-gray-500">{refund.bookingId?.packageName || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{refund.userId?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{refund.userId?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(refund.requestedAmount)}</div>
                      {refund.approvedAmount && (
                        <div className="text-sm text-green-600">Approved: {formatCurrency(refund.approvedAmount)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(refund.status)}`}>
                      {getStatusIcon(refund.status)}
                      <span className="ml-1 capitalize">{refund.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(refund.requestDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedRefund(refund)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {refund.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openApprovalModal(refund)}
                            className="text-green-600 hover:text-green-900"
                            disabled={processing}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter rejection reason:');
                              if (notes) handleReject(refund._id, notes);
                            }}
                            className="text-red-600 hover:text-red-900"
                            disabled={processing}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {refund.status === 'approved' && (
                        <button
                          onClick={() => handleProcess(refund._id)}
                          className="text-purple-600 hover:text-purple-900"
                          disabled={processing}
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {refunds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No refund requests found</p>
          </div>
        )}
      </div>

      {/* Refund Details Modal */}
      {selectedRefund && !showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Refund Details #{selectedRefund.refundNumber}</h3>
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedRefund.status)}`}>
                      {getStatusIcon(selectedRefund.status)}
                      <span className="ml-1 capitalize">{selectedRefund.status}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Request Date</p>
                    <p className="text-sm text-gray-600">{formatDate(selectedRefund.requestDate)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Customer</p>
                  <p className="text-sm text-gray-600">{selectedRefund.userId?.name} ({selectedRefund.userId?.email})</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Requested Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedRefund.requestedAmount)}</p>
                  </div>
                  {selectedRefund.approvedAmount && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Approved Amount</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(selectedRefund.approvedAmount)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Reason</p>
                  <p className="text-sm text-gray-600 capitalize">{selectedRefund.reason?.replace('_', ' ')}</p>
                  {selectedRefund.reasonDescription && (
                    <p className="text-sm text-gray-500 mt-1">{selectedRefund.reasonDescription}</p>
                  )}
                </div>

                {selectedRefund.adminNotes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Admin Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedRefund.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedRefund(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Approve Refund Request</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved Amount (Requested: {formatCurrency(selectedRefund.requestedAmount)})
                  </label>
                  <input
                    type="number"
                    value={approvalData.approvedAmount}
                    onChange={(e) => setApprovalData({
                      ...approvalData,
                      approvedAmount: Number(e.target.value)
                    })}
                    max={selectedRefund.requestedAmount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={approvalData.adminNotes}
                    onChange={(e) => setApprovalData({
                      ...approvalData,
                      adminNotes: e.target.value
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes about the approval..."
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Approve Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;