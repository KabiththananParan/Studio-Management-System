import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronDown, HelpCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'How long does it take to resolve a complaint?',
    answer: 'Most complaints are resolved within 3-5 business days. Complex issues may take up to 10 business days. You\'ll receive updates throughout the process.'
  },
  {
    question: 'Can I track my complaint status?',
    answer: 'Yes! You can track your complaint using the tracking ID provided when you submitted it. The status is updated in real-time.'
  },
  {
    question: 'What happens if my complaint is not resolved?',
    answer: 'If your complaint is not resolved at the provider level, it will be automatically escalated to our admin team for further review.'
  },
  {
    question: 'Can I withdraw my complaint?',
    answer: 'Yes, you can withdraw your complaint while it\'s in "Pending" status. Once it moves to "In Progress", please contact support.'
  }
];

const openIssues = [
  {
    title: 'Should unresolved complaints impact provider ratings?',
    description: 'Currently reviewing policy on how complaint resolution affects service provider ratings and visibility.',
    status: 'Under Review',
    priority: 'Medium'
  },
  {
    title: 'Response time for providers',
    description: 'Determining optimal response timeframes before complaints are escalated to administration.',
    status: 'Discussion',
    priority: 'High'
  },
  {
    title: 'Complaint categories and routing',
    description: 'Implementing automatic categorization to route complaints to appropriate departments.',
    status: 'In Development',
    priority: 'Low'
  }
];

export function OpenIssuesPanel() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review': return 'bg-orange-100 text-orange-800';
      case 'Discussion': return 'bg-purple-100 text-purple-800';
      case 'In Development': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about the complaint process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <Collapsible
              key={index}
              open={openFAQ === index}
              onOpenChange={(open) => setOpenFAQ(open ? index : null)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-left h-auto p-3"
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Open Issues Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Open Policy Issues
          </CardTitle>
          <CardDescription>
            Current discussions and improvements in progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {openIssues.map((issue, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{issue.title}</h4>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{issue.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Need More Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Contact Support Team
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Escalate to Management
          </Button>
          <Button variant="outline" className="w-full justify-start">
            View All Policies
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}