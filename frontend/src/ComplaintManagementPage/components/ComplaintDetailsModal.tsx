import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { StatusBadge, ComplaintStatus } from './StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { FileText, Calendar, Clock, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  serviceName: string;
  transactionReference: string;
  description: string;
  attachments: string[];
  status: ComplaintStatus;
  dateSubmitted: string;
  timeline: Array<{
    date: string;
    action: string;
    details: string;
  }>;
}

interface ComplaintDetailsModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (complaintId: string, newStatus: ComplaintStatus) => void;
  isAdmin?: boolean;
}

export function ComplaintDetailsModal({ 
  complaint, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  isAdmin = false 
}: ComplaintDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | ''>('');

  if (!complaint) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = () => {
    if (!selectedStatus || selectedStatus === complaint.status) return;
    
    onStatusUpdate(complaint.id, selectedStatus);
    setSelectedStatus('');
    toast.success(`Complaint status updated to ${selectedStatus}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Complaint Details</span>
            <StatusBadge status={complaint.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Complaint Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Complaint ID</p>
                  <p className="text-gray-900">{complaint.id}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date Submitted</p>
                  <p className="text-gray-900">{formatDate(complaint.dateSubmitted)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Service Name</p>
                  <p className="text-gray-900">{complaint.serviceName}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Transaction Reference</p>
                  <p className="text-gray-900">{complaint.transactionReference}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-2">Description</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-900">{complaint.description}</p>
                </div>
              </div>

              {complaint.attachments.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-2">Attachments</p>
                  <div className="space-y-2">
                    {complaint.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment}</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complaint.timeline.map((event, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{event.action}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                      </div>
                      <p className="text-sm text-gray-600">{event.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Controls */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Admin Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || selectedStatus === complaint.status}
                  >
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {!isAdmin && complaint.status === 'Pending' && (
              <Button variant="destructive">
                Withdraw Complaint
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}