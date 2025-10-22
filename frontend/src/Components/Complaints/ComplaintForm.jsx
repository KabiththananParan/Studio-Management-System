import React, { useState, useEffect } from 'react';

const ComplaintForm = ({ onSubmit, onCancel, existingComplaint = null, isDarkMode = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    bookingId: ''
  });
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tone, setTone] = useState('polite'); // polite | professional | firm | concise
  const [suggestion, setSuggestion] = useState('');
  const [generating, setGenerating] = useState(false);

  const isEditing = Boolean(existingComplaint);

  useEffect(() => {
    loadCategories();
    loadBookings();
    
    if (existingComplaint) {
      setFormData({
        title: existingComplaint.title || '',
        description: existingComplaint.description || '',
        category: existingComplaint.category || '',
        priority: existingComplaint.priority || 'medium',
        bookingId: existingComplaint.bookingId || ''
      });
    }
  }, [existingComplaint]);

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/complaints/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/complaints/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare submission data
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority
      };

      // Only include bookingId if one is selected
      if (formData.bookingId) {
        submissionData.bookingId = formData.bookingId;
      }

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  // Local complaint text helper (no network calls)
  const generateComplaintSuggestion = () => {
    const catMeta = categories.find(c => c.value === formData.category);
    const categoryLabel = catMeta?.label || 'General';
    const priorityLabel = formData.priority || 'medium';
    const title = formData.title?.trim();
    const bookingLabel = bookings.find(b => b._id === formData.bookingId)?.displayText;

    const toneSets = {
      polite: {
        opener: 'I am writing to report an issue I encountered',
        bodyIntro: 'Here are the details for your review',
        impactIntro: 'This has impacted me as follows',
        ask: 'I kindly request your assistance to resolve this matter',
        close: 'Thank you for your attention to this.'
      },
      professional: {
        opener: 'I wish to formally report the following concern',
        bodyIntro: 'Please find the relevant details below',
        impactIntro: 'Observed impact',
        ask: 'Please advise on the next steps to resolve this',
        close: 'Thank you for your prompt attention.'
      },
      firm: {
        opener: 'I need to report a significant issue that requires prompt attention',
        bodyIntro: 'Key details are as follows',
        impactIntro: 'Impact to my experience',
        ask: 'I expect a clear resolution timeline and next steps',
        close: 'Looking forward to a timely resolution.'
      },
      concise: {
        opener: 'Reporting an issue',
        bodyIntro: 'Details',
        impactIntro: 'Impact',
        ask: 'Request',
        close: 'Thanks.'
      }
    };

    const t = toneSets[tone] || toneSets.polite;

    const lines = [];
    const subject = title ? ` regarding "${title}"` : '';
    const ctx = [];
    ctx.push(`Category: ${categoryLabel}`);
    if (bookingLabel) ctx.push(`Related booking: ${bookingLabel}`);
    ctx.push(`Priority: ${priorityLabel.charAt(0).toUpperCase() + priorityLabel.slice(1)}`);

    // Opener
    lines.push(`${t.opener}${subject}.`);

    // Context section
    lines.push(`${t.bodyIntro}:`);
    lines.push(`- ${ctx.join(' | ')}`);

    // Guidance placeholders to help the user quickly edit
    lines.push(`${t.impactIntro}:`);
    lines.push(`- Describe what happened, when, and who was involved.`);
    lines.push(`- Explain the inconvenience or cost (if any).`);

    // Ask / resolution
    lines.push(`${t.ask}.`);
    lines.push(`- Proposed resolution (e.g., refund, reschedule, follow-up).`);
    lines.push(t.close);

    const result = tone === 'concise' ? lines.slice(0, 6).join('\n') : lines.join('\n');
    return result.trim();
  };

  const handleGenerate = () => {
    // Require minimal fields to tailor output
    const newErr = { ...errors };
    if (!formData.title.trim()) newErr.title = newErr.title || 'Please add a brief title to tailor the suggestion';
    if (!formData.category) newErr.category = newErr.category || 'Please select a category';
    setErrors(newErr);
    if (Object.keys(newErr).length && (!formData.category || !formData.title.trim())) return;

    setGenerating(true);
    try {
      const text = generateComplaintSuggestion();
      setSuggestion(text);
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="mb-6">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          {isEditing ? 'Edit Complaint' : 'Submit a Complaint'}
        </h3>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {isEditing 
            ? 'Update your complaint details below. You can only edit pending complaints within 24 hours of creation.'
            : 'We take your concerns seriously. Please provide detailed information about your complaint so we can address it effectively.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Complaint Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={200}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Brief summary of your complaint..."
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Category and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${errors.category ? 'border-red-500' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            {formData.category && (
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {categories.find(c => c.value === formData.category)?.description}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(formData.priority)}`}>
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Related Booking */}
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Related Booking (Optional)
          </label>
          <select
            name="bookingId"
            value={formData.bookingId}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">No related booking</option>
            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {booking.displayText}
              </option>
            ))}
          </select>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Select a booking if this complaint is related to a specific reservation
          </p>
        </div>

        {/* Description */}
        <div>
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            Detailed Description *
          </label>
          {/* AI Suggestion Helper */}
          <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Need help?</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={`text-sm border rounded-md px-2 py-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              >
                <option value="polite">Polite</option>
                <option value="professional">Professional</option>
                <option value="firm">Firm</option>
                <option value="concise">Concise</option>
              </select>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className={`text-sm px-3 py-1 rounded-md ${generating ? 'bg-gray-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              >
                {generating ? 'Generating…' : 'Suggest complaint'}
              </button>
            </div>
          </div>

          {suggestion && (
            <div className={`mb-2 border rounded-md p-3 ${isDarkMode ? 'border-purple-300/40 bg-purple-900/20' : 'border-purple-200 bg-purple-50'}`}>
              <div className={`text-xs mb-1 ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>Suggested text</div>
              <pre className={`text-sm whitespace-pre-wrap ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{suggestion}</pre>
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  className={`text-sm px-3 py-1 border rounded-md ${isDarkMode ? 'border-gray-600 hover:bg-gray-700 text-gray-200' : 'border-gray-300 hover:bg-white'}`}
                  onClick={() => setSuggestion('')}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setFormData({ ...formData, description: suggestion })}
                >
                  Use this
                </button>
              </div>
            </div>
          )}

          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            maxLength={2000}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Please provide a detailed description of your complaint. Include specific dates, names, and circumstances to help us understand and resolve the issue effectively..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Submission Guidelines */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${isDarkMode ? 'border-gray-600' : 'border-blue-200'}`}>
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-blue-900'} mb-2`}>
            Before Submitting:
          </h4>
          <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-800'} space-y-1`}>
            <li>• Ensure all details are accurate and complete</li>
            <li>• You can edit complaints within 24 hours of submission if they're pending</li>
            <li>• You can delete complaints within 1 hour of submission if they're pending</li>
            <li>• Our team will respond within 2-3 business days</li>
            <li>• For urgent matters, please call our customer service directly</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Submitting...'}
              </div>
            ) : (
              isEditing ? 'Update Complaint' : 'Submit Complaint'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;