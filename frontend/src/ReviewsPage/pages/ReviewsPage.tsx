import { useState } from "react";
import { Header } from "../components/Header";
import { BookingsList } from "../components/BookingsList";
import { ReviewModal } from "../components/ReviewModal";
import { ReviewsList } from "../components/ReviewsList";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";

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

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'home'|'bookings'|'reviews'|'dashboard'>('bookings');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      bookingId: '2',
      serviceName: 'Plumbing Repair',
      providerName: 'Fix-It Fast',
      customerName: 'Sarah Johnson',
      customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b388?w=150',
      rating: 5,
      reviewText: 'Excellent service! The plumber arrived on time and fixed the issue quickly. Very professional and clean work.',
      date: '2024-01-11',
      status: 'approved'
    },
    {
      id: '2',
      bookingId: '5',
      serviceName: 'House Cleaning',
      providerName: 'CleanPro Services',
      customerName: 'Sarah Johnson',
      customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b388?w=150',
      rating: 3,
      reviewText: 'Service was okay but could be better. Some areas were missed during cleaning.',
      date: '2024-01-05',
      status: 'pending'
    }
  ]);

  const handleLeaveReview = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (bookingId: string, rating: number, reviewText: string) => {
    const hasInappropriateContent = reviewText.toLowerCase().includes('bad') || 
                                   reviewText.toLowerCase().includes('terrible') ||
                                   reviewText.toLowerCase().includes('worst');

    const newReview: Review = {
      id: Date.now().toString(),
      bookingId,
      serviceName: selectedBooking?.serviceName || '',
      providerName: selectedBooking?.providerName || '',
      customerName: 'Sarah Johnson',
      customerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b388?w=150',
      rating,
      reviewText,
      date: new Date().toISOString().split('T')[0],
      status: hasInappropriateContent ? 'pending' : 'approved'
    };

  setReviews((prev: Review[]) => [newReview, ...prev]);
    
    if (hasInappropriateContent) {
      toast.warning("Review submitted for moderation", {
        description: "Your review contains content that requires approval before being published."
      });
    } else {
      toast.success("Review submitted successfully!", {
        description: "Thank you for your feedback. Your review is now live."
      });
    }
  };

  const totalReviews = reviews.filter((r: Review) => r.status === 'approved').length;
  const averageRating = totalReviews > 0 
  ? reviews
    .filter((r: Review) => r.status === 'approved')
    .reduce((sum: number, r: Review) => sum + r.rating, 0) / totalReviews 
    : 0;
  
  const ratingDistribution = reviews
    .filter((r: Review) => r.status === 'approved')
    .reduce((acc: { [key: number]: number }, review: Review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ServicePro</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Manage your service bookings, leave reviews, and track your service history all in one place.
            </p>
          </div>
        );
      case 'bookings':
        return <BookingsList onLeaveReview={handleLeaveReview} />;
      case 'reviews':
        return <ReviewsList reviews={reviews} />;
      case 'dashboard':
        return (
          <AnalyticsDashboard 
            totalReviews={totalReviews}
            averageRating={averageRating}
            ratingDistribution={ratingDistribution}
          />
        );
      default:
        return <BookingsList onLeaveReview={handleLeaveReview} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <ReviewModal
        booking={selectedBooking}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedBooking(null);
        }}
        onSubmitReview={handleSubmitReview}
      />
      <Toaster position="top-right" />
    </div>
  );
}
