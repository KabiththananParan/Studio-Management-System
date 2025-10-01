import React, { useState } from 'react';

const ReviewDisplay = ({ 
  reviews, 
  loading = false, 
  onEditReview = null, 
  onDeleteReview = null,
  showActions = false,
  showBookingInfo = true 
}) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const StarDisplay = ({ rating, size = 'small', showNumber = false }) => {
    const sizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6'
    };

    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`${sizeClasses[size]} ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {showNumber && <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {review.customerInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              
              {/* User Info and Rating */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900">
                    {review.customerInfo?.name || 'Anonymous User'}
                  </h4>
                  {review.customerInfo?.verifiedCustomer && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      ✓ Verified Customer
                    </span>
                  )}
                </div>
                <StarDisplay rating={review.rating} size="medium" showNumber />
                <p className="text-sm text-gray-500 mt-1">
                  Reviewed on {formatDate(review.createdAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex space-x-2">
                {review.canEdit && onEditReview && (
                  <button
                    onClick={() => onEditReview(review)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
                {review.canDelete && onDeleteReview && (
                  <button
                    onClick={() => onDeleteReview(review._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Booking Info */}
          {showBookingInfo && review.bookingInfo && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium text-gray-900">{review.bookingInfo.packageName}</h5>
                  <p className="text-sm text-gray-600">
                    {new Date(review.bookingInfo.bookingDate).toLocaleDateString()}
                  </p>
                </div>
                {review.bookingInfo.totalAmount && (
                  <span className="text-sm font-medium text-gray-700">
                    LKR {review.bookingInfo.totalAmount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Review Title */}
          {review.reviewTitle && (
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {review.reviewTitle}
            </h3>
          )}

          {/* Review Comment */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              {expandedReviews.has(review._id) ? review.comment : truncateText(review.comment)}
            </p>
            {review.comment.length > 200 && (
              <button
                onClick={() => toggleExpanded(review._id)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
              >
                {expandedReviews.has(review._id) ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* Category Ratings */}
          {review.categoryRatings && Object.keys(review.categoryRatings).some(key => review.categoryRatings[key] > 0) && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Detailed Ratings</h4>
              <div className="grid grid-cols-2 gap-3">
                {review.categoryRatings.serviceQuality > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Service Quality</span>
                    <StarDisplay rating={review.categoryRatings.serviceQuality} size="small" />
                  </div>
                )}
                {review.categoryRatings.communication > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Communication</span>
                    <StarDisplay rating={review.categoryRatings.communication} size="small" />
                  </div>
                )}
                {review.categoryRatings.valueForMoney > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Value for Money</span>
                    <StarDisplay rating={review.categoryRatings.valueForMoney} size="small" />
                  </div>
                )}
                {review.categoryRatings.professionalism > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Professionalism</span>
                    <StarDisplay rating={review.categoryRatings.professionalism} size="small" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {review.wouldRecommend !== undefined && (
            <div className="mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                review.wouldRecommend 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {review.wouldRecommend ? '👍 Recommends' : '👎 Does not recommend'}
              </span>
            </div>
          )}

          {/* Business Response */}
          {review.businessResponse && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium text-sm">Studio</span>
                </div>
                <div>
                  <h5 className="font-medium text-blue-900">Response from Studio</h5>
                  <p className="text-xs text-blue-700">
                    {formatDate(review.businessResponse.respondedAt)}
                  </p>
                </div>
              </div>
              <p className="text-blue-800">{review.businessResponse.message}</p>
            </div>
          )}

          {/* Review Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {review.helpfulVotes > 0 && (
                <span>{review.helpfulVotes} people found this helpful</span>
              )}
            </div>
            {review.updatedAt !== review.createdAt && (
              <span className="text-xs text-gray-400">
                Edited on {formatDate(review.updatedAt)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewDisplay;