import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Clock, Star } from "lucide-react";

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  location: string;
  status: 'completed' | 'cancelled' | 'upcoming';
  price: number;
  hasReview: boolean;
}

interface BookingsListProps {
  onLeaveReview: (booking: Booking) => void;
}

export function BookingsList({ onLeaveReview }: BookingsListProps) {
  const mockBookings: Booking[] = [
    {
      id: '1',
      serviceName: 'House Cleaning',
      providerName: 'CleanPro Services',
      date: '2024-01-15',
      time: '10:00 AM',
      location: '123 Main St, New York',
      status: 'completed',
      price: 150,
      hasReview: false
    },
    {
      id: '2',
      serviceName: 'Plumbing Repair',
      providerName: 'Fix-It Fast',
      date: '2024-01-10',
      time: '2:00 PM',
      location: '456 Oak Ave, New York',
      status: 'completed',
      price: 200,
      hasReview: true
    },
    {
      id: '3',
      serviceName: 'Garden Maintenance',
      providerName: 'Green Thumb Co.',
      date: '2024-01-08',
      time: '9:00 AM',
      location: '789 Pine St, New York',
      status: 'completed',
      price: 120,
      hasReview: false
    },
    {
      id: '4',
      serviceName: 'AC Repair',
      providerName: 'Cool Air Solutions',
      date: '2024-01-25',
      time: '11:00 AM',
      location: '321 Elm St, New York',
      status: 'upcoming',
      price: 180,
      hasReview: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Your Bookings</h2>
        <p className="text-gray-600">{mockBookings.length} total bookings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{booking.serviceName}</h3>
                  <p className="text-gray-600">{booking.providerName}</p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{booking.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{booking.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-semibold text-lg text-gray-900">${booking.price}</span>
                
                {booking.status === 'completed' && (
                  <Button
                    onClick={() => onLeaveReview(booking)}
                    disabled={booking.hasReview}
                    size="sm"
                    className={`flex items-center space-x-1 ${
                      booking.hasReview 
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    <Star className="h-4 w-4" />
                    <span>{booking.hasReview ? 'Reviewed' : 'Leave Review'}</span>
                  </Button>
                )}
                
                {booking.status === 'upcoming' && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    Upcoming
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}