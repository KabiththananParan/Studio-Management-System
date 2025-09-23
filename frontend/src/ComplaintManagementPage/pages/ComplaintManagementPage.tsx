import { useState } from 'react';
import { Header } from '../components/Header';
import { ComplaintSubmissionForm } from '../components/ComplaintSubmissionForm';
import { ComplaintTrackingDashboard } from '../components/ComplaintTrackingDashboard';
import { OpenIssuesPanel } from '../components/OpenIssuesPanel';
import { ComplaintStatus } from '../components/StatusBadge';
import { Toaster } from '../components/ui/sonner';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

export interface Complaint {
  id: string;
  serviceId: string;
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

// Mock data for existing complaints
const initialComplaints: Complaint[] = [
  {
    id: 'CMP-1731974823456',
    serviceId: '1',
    serviceName: 'Home Cleaning Service',
    transactionReference: 'TXN-001',
    description: 'The cleaning service was incomplete. Several rooms were not cleaned properly and dust was left on furniture.',
    attachments: ['before_cleaning.jpg', 'missed_spots.jpg'],
    status: 'In Progress',
    dateSubmitted: '2024-11-15T10:30:00.000Z',
    timeline: [
      {
        date: '2024-11-15T10:30:00.000Z',
        action: 'Complaint submitted',
        details: 'Complaint has been received and assigned tracking ID'
      },
      {
        date: '2024-11-15T14:20:00.000Z',
        action: 'Forwarded to provider',
        details: 'Complaint forwarded to cleaning service provider for review'
      },
      {
        date: '2024-11-16T09:15:00.000Z',
        action: 'Provider response received',
        details: 'Provider acknowledged the issue and scheduled re-cleaning'
      }
    ]
  },
  {
    id: 'CMP-1731888423789',
    serviceId: '2',
    serviceName: 'Plumbing Repair',
    transactionReference: 'TXN-002',
    description: 'Plumber arrived 2 hours late and the leak was not completely fixed. Water is still dripping.',
    attachments: ['leak_photo.jpg'],
    status: 'Escalated',
    dateSubmitted: '2024-11-13T08:45:00.000Z',
    timeline: [
      {
        date: '2024-11-13T08:45:00.000Z',
        action: 'Complaint submitted',
        details: 'Complaint has been received and assigned tracking ID'
      },
      {
        date: '2024-11-13T12:30:00.000Z',
        action: 'Forwarded to provider',
        details: 'Complaint forwarded to plumbing service provider'
      },
      {
        date: '2024-11-16T16:00:00.000Z',
        action: 'Escalated to admin',
        details: 'Provider failed to respond within 48 hours - escalated to administration'
      }
    ]
  },
  {
    id: 'CMP-1731802023123',
    serviceId: '3',
    serviceName: 'Electrical Installation',
    transactionReference: 'TXN-003',
    description: 'Installation was completed successfully. Thank you for the professional service.',
    attachments: [],
    status: 'Resolved',
    dateSubmitted: '2024-11-12T15:20:00.000Z',
    timeline: [
      {
        date: '2024-11-12T15:20:00.000Z',
        action: 'Complaint submitted',
        details: 'Complaint has been received and assigned tracking ID'
      },
      {
        date: '2024-11-12T16:45:00.000Z',
        action: 'Forwarded to provider',
        details: 'Complaint forwarded to electrical service provider'
      },
      {
        date: '2024-11-13T10:30:00.000Z',
        action: 'Provider response',
        details: 'Provider contacted customer and resolved the issue'
      },
      {
        date: '2024-11-14T14:00:00.000Z',
        action: 'Marked as resolved',
        details: 'Customer confirmed satisfaction - complaint resolved'
      }
    ]
  },
  {
    id: 'CMP-1731715623456',
    serviceId: '4',
    serviceName: 'Gardening Service',
    transactionReference: 'TXN-004',
    description: 'Garden maintenance was not up to standards. Weeds were not removed and plants were damaged.',
    attachments: ['damaged_plants.jpg', 'unfinished_work.jpg'],
    status: 'Pending',
    dateSubmitted: '2024-11-11T11:00:00.000Z',
    timeline: [
      {
        date: '2024-11-11T11:00:00.000Z',
        action: 'Complaint submitted',
        details: 'Complaint has been received and assigned tracking ID'
      }
    ]
  }
];

export default function ComplaintManagementPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleNewComplaint = (newComplaint: Complaint) => {
    setComplaints((prev: Complaint[]) => [newComplaint, ...prev]);
  };

  const handleStatusUpdate = (complaintId: string, newStatus: ComplaintStatus) => {
    setComplaints((prev: Complaint[]) => prev.map((complaint: Complaint) => {
      if (complaint.id === complaintId) {
        const updatedComplaint = { ...complaint, status: newStatus };
        const statusActions = {
          'Pending': 'Status changed to Pending',
          'In Progress': 'Complaint assigned and investigation started',
          'Resolved': 'Complaint has been resolved',
          'Closed': 'Complaint has been closed',
          'Escalated': 'Complaint escalated to higher level support'
        } as const;
        updatedComplaint.timeline.push({
          date: new Date().toISOString(),
          action: `Status updated to ${newStatus}`,
          details: statusActions[newStatus] || `Complaint status changed to ${newStatus}`
        });
        return updatedComplaint;
      }
      return complaint;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
            <p className="text-gray-600 mt-2">Submit, track, and manage service complaints</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="admin-mode">Admin Mode</Label>
              <Switch id="admin-mode" checked={isAdminMode} onCheckedChange={setIsAdminMode} />
            </div>
            <Button variant="outline" onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden">
              {showSidebar ? 'Hide' : 'Show'} Help Panel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <ComplaintSubmissionForm onSubmit={handleNewComplaint} />
            <ComplaintTrackingDashboard complaints={complaints} onStatusUpdate={handleStatusUpdate} isAdmin={isAdminMode} />
          </div>

          <div className={`lg:col-span-1 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <OpenIssuesPanel />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
