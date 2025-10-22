import React, { useState } from 'react';

const ReviewForm = ({ bookingId, bookingInfo, onSubmit, onCancel, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    comment: initialData?.comment || '',
    reviewTitle: initialData?.reviewTitle || '',
    categoryRatings: {
      serviceQuality: initialData?.categoryRatings?.serviceQuality || 0,
      communication: initialData?.categoryRatings?.communication || 0,
      valueForMoney: initialData?.categoryRatings?.valueForMoney || 0,
      professionalism: initialData?.categoryRatings?.professionalism || 0
    },
    wouldRecommend: initialData?.wouldRecommend !== undefined ? initialData.wouldRecommend : true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [tone, setTone] = useState('friendly'); // friendly | professional | casual | concise
  const [suggestion, setSuggestion] = useState('');
  const [generating, setGenerating] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rating || formData.rating < 1) {
      newErrors.rating = 'Please provide a rating';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Please write a review comment';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    } else if (formData.comment.trim().length > 1000) {
      newErrors.comment = 'Review must be less than 1000 characters';
    }

    if (formData.reviewTitle && formData.reviewTitle.length > 100) {
      newErrors.reviewTitle = 'Title must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        bookingId,
        ...formData,
        comment: formData.comment.trim(),
        reviewTitle: formData.reviewTitle.trim()
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lightweight on-device review suggestion generator (no network calls)
  const generateReviewSuggestion = () => {
    const rating = formData.rating || 0;
    const cats = formData.categoryRatings || {};
    const pros = [];
    const cons = [];

    const labels = {
      serviceQuality: 'service quality',
      communication: 'communication',
      valueForMoney: 'value for money',
      professionalism: 'professionalism',
    };

    Object.entries(labels).forEach(([key, label]) => {
      const val = Number(cats[key] || 0);
      if (val >= 4) pros.push(label);
      if (val > 0 && val <= 2) cons.push(label);
    });

    const toneSets = {
      friendly: {
        opener5: 'Absolutely loved the experience',
        opener4: 'Had a great experience',
        opener3: 'Overall a decent experience',
        opener2: 'Mixed feelings about the experience',
        opener1: 'Disappointed with the experience',
        recommendYes: 'I would happily recommend this service to others.',
        recommendNo: 'I can’t recommend this service at the moment.',
        prosIntro: 'Highlights for me were',
        consIntro: 'Areas to improve would be',
        close5: 'I’d definitely book again.',
        close4: 'I’d consider booking again.',
        close3: 'There’s room for improvement.',
        close2: 'Improvements could make this much better.',
        close1: 'Hoping to see meaningful improvements.'
      },
      professional: {
        opener5: 'The overall experience exceeded expectations',
        opener4: 'The overall experience was very good',
        opener3: 'The overall experience met expectations',
        opener2: 'The overall experience fell short in several areas',
        opener1: 'The overall experience was unsatisfactory',
        recommendYes: 'I would recommend this service.',
        recommendNo: 'I cannot recommend this service at this time.',
        prosIntro: 'Key strengths included',
        consIntro: 'Notable areas for improvement included',
        close5: 'I would not hesitate to return.',
        close4: 'I would consider returning.',
        close3: 'Further refinements would enhance the experience.',
        close2: 'Meaningful improvements are needed.',
        close1: 'Significant improvements are required.'
      },
      casual: {
        opener5: 'Amazing time — totally worth it',
        opener4: 'Really good experience',
        opener3: 'Pretty okay overall',
        opener2: 'Kinda mixed for me',
        opener1: 'Not the best experience',
        recommendYes: 'I’d recommend it.',
        recommendNo: 'Wouldn’t really recommend right now.',
        prosIntro: 'Loved',
        consIntro: 'Could be better with',
        close5: 'Would book again for sure.',
        close4: 'Might book again.',
        close3: 'Could be better.',
        close2: 'Needs work.',
        close1: 'Needs serious improvement.'
      },
      concise: {
        opener5: 'Excellent experience',
        opener4: 'Very good experience',
        opener3: 'Average experience',
        opener2: 'Below expectations',
        opener1: 'Poor experience',
        recommendYes: 'Recommended.',
        recommendNo: 'Not recommended.',
        prosIntro: 'Pros:',
        consIntro: 'Cons:',
        close5: 'Would return.',
        close4: 'Likely to return.',
        close3: 'Room to improve.',
        close2: 'Needs improvement.',
        close1: 'Requires major changes.'
      }
    };

    const toneCfg = toneSets[tone] || toneSets.friendly;
    const opener = rating >= 5 ? toneCfg.opener5
                  : rating === 4 ? toneCfg.opener4
                  : rating === 3 ? toneCfg.opener3
                  : rating === 2 ? toneCfg.opener2
                  : toneCfg.opener1;

    const pkg = bookingInfo?.packageName ? ` for the ${bookingInfo.packageName}` : '';

    const parts = [];
    parts.push(`${opener}${pkg}.`);

    if (pros.length) {
      if (tone === 'concise') {
        parts.push(`${toneCfg.prosIntro} ${pros.join(', ')}.`);
      } else {
        parts.push(`${toneCfg.prosIntro} ${pros.join(', ')} which stood out during my session.`);
      }
    }

    if (cons.length) {
      if (tone === 'concise') {
        parts.push(`${toneCfg.consIntro} ${cons.join(', ')}.`);
      } else {
        parts.push(`${toneCfg.consIntro} ${cons.join(', ')} to make the experience even better.`);
      }
    }

    if (formData.wouldRecommend === true) {
      parts.push(toneCfg.recommendYes);
    } else if (formData.wouldRecommend === false) {
      parts.push(toneCfg.recommendNo);
    }

    const closer = rating >= 5 ? toneCfg.close5
                 : rating === 4 ? toneCfg.close4
                 : rating === 3 ? toneCfg.close3
                 : rating === 2 ? toneCfg.close2
                 : toneCfg.close1;
    parts.push(closer);

    // Keep concise tone short
    const result = tone === 'concise' ? parts.slice(0, 3).join(' ') : parts.join(' ');
    return result.trim();
  };

  const handleGenerate = () => {
    if (!formData.rating || formData.rating < 1) {
      setErrors({ ...errors, rating: 'Please provide a rating first (used to tailor the suggestion)' });
      return;
    }
    setGenerating(true);
    try {
      const text = generateReviewSuggestion();
      setSuggestion(text);
    } finally {
      setGenerating(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label, size = 'large' }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    const sizeClasses = {
      small: 'w-4 h-4',
      medium: 'w-6 h-6',
      large: 'w-8 h-8'
    };

    return (
      <div className="flex flex-col">
        {label && <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>}
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`${sizeClasses[size]} transition-colors duration-200 ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {bookingInfo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">{bookingInfo.packageName}</h4>
            <p className="text-sm text-gray-600">
              Booking Date: {new Date(bookingInfo.bookingDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Amount: LKR {bookingInfo.totalAmount?.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <StarRating
            rating={formData.rating}
            onRatingChange={(rating) => setFormData({ ...formData, rating })}
            label="Overall Rating *"
          />
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            value={formData.reviewTitle}
            onChange={(e) => setFormData({ ...formData, reviewTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Summary of your experience"
            maxLength={100}
          />
          {errors.reviewTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.reviewTitle}</p>
          )}
        </div>

        {/* Review Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          {/* AI Suggestion Helper */}
          <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Need help?</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="concise">Concise</option>
              </select>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className={`text-sm px-3 py-1 rounded-md ${generating ? 'bg-gray-200' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              >
                {generating ? 'Generating…' : 'Suggest review'}
              </button>
            </div>
          </div>

          {suggestion && (
            <div className="mb-2 border border-purple-200 bg-purple-50 rounded-md p-3">
              <div className="text-xs text-purple-800 mb-1">Suggested text</div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{suggestion}</p>
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-white"
                  onClick={() => setSuggestion('')}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setFormData({ ...formData, comment: suggestion })}
                >
                  Use this
                </button>
              </div>
            </div>
          )}

          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
            placeholder="Share details of your experience..."
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comment && (
              <p className="text-red-500 text-sm">{errors.comment}</p>
            )}
            <span className="text-sm text-gray-500 ml-auto">
              {formData.comment.length}/1000 characters
            </span>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Detailed Ratings (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StarRating
              rating={formData.categoryRatings.serviceQuality}
              onRatingChange={(rating) => 
                setFormData({
                  ...formData,
                  categoryRatings: { ...formData.categoryRatings, serviceQuality: rating }
                })
              }
              label="Service Quality"
              size="medium"
            />
            <StarRating
              rating={formData.categoryRatings.communication}
              onRatingChange={(rating) => 
                setFormData({
                  ...formData,
                  categoryRatings: { ...formData.categoryRatings, communication: rating }
                })
              }
              label="Communication"
              size="medium"
            />
            <StarRating
              rating={formData.categoryRatings.valueForMoney}
              onRatingChange={(rating) => 
                setFormData({
                  ...formData,
                  categoryRatings: { ...formData.categoryRatings, valueForMoney: rating }
                })
              }
              label="Value for Money"
              size="medium"
            />
            <StarRating
              rating={formData.categoryRatings.professionalism}
              onRatingChange={(rating) => 
                setFormData({
                  ...formData,
                  categoryRatings: { ...formData.categoryRatings, professionalism: rating }
                })
              }
              label="Professionalism"
              size="medium"
            />
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Would you recommend our services?
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="wouldRecommend"
                checked={formData.wouldRecommend === true}
                onChange={() => setFormData({ ...formData, wouldRecommend: true })}
                className="mr-2"
              />
              <span className="text-green-600">👍 Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="wouldRecommend"
                checked={formData.wouldRecommend === false}
                onChange={() => setFormData({ ...formData, wouldRecommend: false })}
                className="mr-2"
              />
              <span className="text-red-600">👎 No</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isEditing ? 'Updating...' : 'Submitting...'}
              </div>
            ) : (
              isEditing ? 'Update Review' : 'Submit Review'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;