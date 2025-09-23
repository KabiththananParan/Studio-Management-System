import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, Check, Clock } from "lucide-react";

interface Review {
  id: string;
  bookingId: string;
  serviceName: string;
  providerName: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  reviewText: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" />
            Pending Moderation
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Star className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-600">Complete a service to leave your first review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Your Reviews</h2>
        <p className="text-gray-600">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.customerAvatar} alt={review.customerName} />
                    <AvatarFallback>{review.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{review.customerName}</p>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(review.status)}
                  <p className="text-sm text-gray-500 mt-1">{formatDate(review.date)}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{review.serviceName}</p>
                  <p className="text-sm text-gray-600">{review.providerName}</p>
                </div>
                
                {review.reviewText && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700">{review.reviewText}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}