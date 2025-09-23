import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Star, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

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

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (bookingId: string, rating: number, review: string) => void;
}

export function ReviewModal({ booking, isOpen, onClose, onSubmitReview }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!booking || rating === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmitReview(booking.id, rating, reviewText);
    
    // Reset form
    setRating(0);
    setHoveredRating(0);
    setReviewText("");
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setReviewText("");
    onClose();
  };

  if (!booking) return null;

  // Simple inappropriate content detection
  const hasInappropriateContent = reviewText.toLowerCase().includes('bad') || 
                                 reviewText.toLowerCase().includes('terrible') ||
                                 reviewText.toLowerCase().includes('worst');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Service Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">{booking.serviceName}</h3>
            <p className="text-gray-600">{booking.providerName}</p>
            <p className="text-sm text-gray-500">
              {new Date(booking.date).toLocaleDateString()} • ${booking.price}
            </p>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">
              Rate your experience
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-gray-600">
                  ({rating} star{rating !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>

          {/* Written Feedback */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">
              Tell us about your experience (optional)
            </label>
            <Textarea
              placeholder="Share details about your service experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Content Moderation Warning */}
          {hasInappropriateContent && reviewText.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This review may require moderation before being published.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}