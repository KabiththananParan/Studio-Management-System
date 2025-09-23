import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const mockServices = [
  { id: '1', name: 'Home Cleaning Service', reference: 'TXN-001' },
  { id: '2', name: 'Plumbing Repair', reference: 'TXN-002' },
  { id: '3', name: 'Electrical Installation', reference: 'TXN-003' },
  { id: '4', name: 'Gardening Service', reference: 'TXN-004' },
  { id: '5', name: 'Pest Control', reference: 'TXN-005' },
];

interface ComplaintSubmissionFormProps {
  onSubmit: (complaint: any) => void;
}

export function ComplaintSubmissionForm({ onSubmit }: ComplaintSubmissionFormProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedServiceData = mockServices.find(s => s.id === selectedService);
    const complaintId = `CMP-${Date.now()}`;
    
    const complaint = {
      id: complaintId,
      serviceId: selectedService,
      serviceName: selectedServiceData?.name || '',
      transactionReference: selectedServiceData?.reference || '',
      description: description.trim(),
      attachments: attachments.map(file => file.name),
      status: 'Pending' as const,
      dateSubmitted: new Date().toISOString(),
      timeline: [
        {
          date: new Date().toISOString(),
          action: 'Complaint submitted',
          details: 'Complaint has been received and assigned tracking ID'
        }
      ]
    };

    onSubmit(complaint);
    
    // Reset form
    setSelectedService('');
    setDescription('');
    setAttachments([]);
    
    toast.success(`Complaint submitted successfully! Tracking ID: ${complaintId}`);
  };

  const handleCancel = () => {
    setSelectedService('');
    setDescription('');
    setAttachments([]);
    toast.info('Form cleared');
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Submit a Complaint</CardTitle>
        <CardDescription>
          Please provide details about your complaint. We'll investigate and respond as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Related Service/Transaction *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Select the service related to your complaint" />
              </SelectTrigger>
              <SelectContent>
                {mockServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({service.reference})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Complaint Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Complaint Details *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your complaint in detail. Include what happened, when it occurred, and what outcome you're seeking..."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-500"
                  >
                    Click to upload files
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Upload screenshots, documents, or other relevant files (PDF, DOC, Images)
                </p>
              </div>
            </div>

            {/* Attachment List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files:</Label>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Submit Complaint
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}