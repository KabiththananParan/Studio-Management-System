import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Calendar, Clock, AlertCircle, CheckCircle, Users, DollarSign } from 'lucide-react';
import { validators, businessRules } from '../../utils/validation';

const SlotSelection = ({ onBack, onSlotSelect, selectedPackage, existingBookings = [] }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Fetch available slots from backend
  useEffect(() => {
    if (selectedPackage?.id) {
      fetchAvailableSlots();
    }
  }, [selectedPackage]);

  const fetchAvailableSlots = async () => {
    if (!selectedPackage?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/user/slots/${selectedPackage.id}`, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      // Transform backend slots to match component format
      const transformedSlots = data.slots?.map(slot => ({
        id: slot._id,
        date: slot.date.split('T')[0], // Extract date part
        time: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        available: slot.isAvailable && slot.status === 'available',
        duration: calculateDuration(slot.startTime, slot.endTime),
        capacity: 10, // Default capacity
        isPremium: slot.price > 80 // Mark high-price slots as premium
      })) || [];

      setSlots(transformedSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setErrors({ general: 'Failed to load available time slots. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    return Math.round((end - start) / (1000 * 60 * 60)); // Duration in hours
  };
  
  // Validation and filtering logic
  const validateDateSelection = (date) => {
    const errors = [];
    
    if (!date) {
      errors.push('Please select a date');
      return errors;
    }

    // Validate date is not in the past
    if (!businessRules.validBookingDate(date)) {
      errors.push('Cannot book dates in the past');
    }

    // Validate date is not too far in the future (e.g., 90 days)
    const selectedDateTime = new Date(date);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (selectedDateTime > maxDate) {
      errors.push('Cannot book more than 90 days in advance');
    }

    // Validate date is not a blackout date (if any)
    const blackoutDates = ['2024-12-25', '2024-01-01']; // Example blackout dates
    if (blackoutDates.includes(date)) {
      errors.push('This date is not available for bookings');
    }

    return errors;
  };

  const validateSlotSelection = (slot, date) => {
    const errors = [];
    
    if (!slot) {
      errors.push('Please select a time slot');
      return errors;
    }

    // Validate slot availability
    if (!slot.available) {
      errors.push('Selected time slot is no longer available');
    }

    // Validate minimum booking notice (e.g., 2 hours in advance)
    const slotDateTime = new Date(`${date} ${slot.time}`);
    const minNoticeTime = new Date();
    minNoticeTime.setHours(minNoticeTime.getHours() + 2);
    if (slotDateTime <= minNoticeTime) {
      errors.push('Bookings must be made at least 2 hours in advance');
    }

    // Validate package-specific requirements
    if (selectedPackage) {
      if (selectedPackage.minDuration && slot.duration < selectedPackage.minDuration) {
        errors.push(`Selected package requires minimum ${selectedPackage.minDuration} hours`);
      }

      if (selectedPackage.maxCapacity && slot.capacity && slot.capacity < selectedPackage.minCapacity) {
        errors.push(`Studio capacity insufficient for selected package`);
      }
    }

    // Check for conflicting bookings
    const conflictingBooking = existingBookings.find(booking => 
      booking.date === date && 
      booking.time === slot.time &&
      booking.status !== 'cancelled'
    );
    if (conflictingBooking) {
      errors.push('Time slot conflicts with existing booking');
    }

    return errors;
  };

  // Filter available dates (only show dates with available slots)
  const availableDates = Array.from(new Set(
    slots
      .filter(slot => slot.available && validateDateSelection(slot.date).length === 0)
      .map(slot => slot.date)
  )).sort();

  // Filter slots for selected date
  const filteredSlots = selectedDate 
    ? slots.filter(slot => slot.date === selectedDate)
    : [];
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr, timeStr) => {
    return new Date(`${dateStr} ${timeStr}`).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Enhanced date selection handler with validation
  const handleDateSelection = (date) => {
    const dateErrors = validateDateSelection(date);
    
    if (dateErrors.length > 0) {
      setErrors(prev => ({ ...prev, date: dateErrors[0] }));
      return;
    }

    setSelectedDate(date);
    setSelectedSlot(null); // Reset slot selection when date changes
    setErrors(prev => ({ ...prev, date: null, slot: null }));
  };

  // Enhanced slot selection handler with validation
  const handleSlotSelection = async (slot) => {
    setIsValidating(true);
    
    try {
      const slotErrors = validateSlotSelection(slot, selectedDate);
      
      if (slotErrors.length > 0) {
        setErrors(prev => ({ ...prev, slot: slotErrors[0] }));
        setIsValidating(false);
        return;
      }

      // Additional real-time availability check (simulate API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulated availability re-check
      const updatedSlot = slots.find(s => s.id === slot.id);
      if (!updatedSlot?.available) {
        setErrors(prev => ({ 
          ...prev, 
          slot: 'This slot was just booked by another user. Please select a different time.' 
        }));
        setIsValidating(false);
        return;
      }

      setSelectedSlot(slot);
      setErrors(prev => ({ ...prev, slot: null }));
      
      // Auto-proceed to next step after successful validation
      setTimeout(() => {
        onSlotSelect({
          ...slot,
          date: selectedDate,
          formattedDateTime: formatDateTime(selectedDate, slot.time)
        });
      }, 800);
      
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        slot: 'Failed to validate slot availability. Please try again.' 
      }));
    } finally {
      setIsValidating(false);
    }
  };

  // Calculate total available slots for selected date
  const availableSlotCount = filteredSlots.filter(slot => slot.available).length;
  const totalSlotCount = filteredSlots.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Available Slot</h2>
            <p className="text-gray-600">Choose your preferred date and time</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available time slots...</p>
          </div>
        )}

        {/* Error State */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{errors.general}</span>
            </div>
            <button
              onClick={fetchAvailableSlots}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Date Selection */}
        {!loading && !errors.general && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Available Dates
              </h3>
              <div className="text-sm text-gray-600">
                {availableDates.length} dates available
              </div>
            </div>
            
            {availableDates.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No available dates found</p>
              <p className="text-sm text-gray-500">Please check back later or contact support</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {availableDates.map(date => {
                  const dateSlotCount = slots.filter(slot => slot.date === date && slot.available).length;
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateSelection(date)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 relative ${
                        selectedDate === date
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{formatDate(date)}</div>
                      <div className={`text-xs mt-1 ${
                        selectedDate === date ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {dateSlotCount} slots
                      </div>
                      {selectedDate === date && (
                        <CheckCircle className="w-4 h-4 text-white absolute -top-1 -right-1 bg-green-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {errors.date && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{errors.date}</span>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        )}

        {/* Time Slots */}
        {!loading && !errors.general && selectedDate && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-600" />
                Time Slots for {formatDate(selectedDate)}
              </h3>
              <div className="text-sm text-gray-600">
                {availableSlotCount} of {totalSlotCount} slots available
              </div>
            </div>

            {filteredSlots.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No time slots available for this date</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSlots.map(slot => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isCurrentlyValidating = isValidating && isSelected;
                    
                    return (
                      <button
                        key={slot.id}
                        onClick={() => slot.available && handleSlotSelection(slot)}
                        disabled={!slot.available || isCurrentlyValidating}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left relative ${
                          isSelected && slot.available
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : slot.available
                            ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <div className="font-semibold text-lg">{slot.time}</div>
                              {isCurrentlyValidating && (
                                <div className="ml-2 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                              )}
                              {isSelected && !isCurrentlyValidating && slot.available && (
                                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {slot.available ? 'Available' : 'Booked'}
                            </div>
                            
                            {/* Additional slot details */}
                            {slot.available && (
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {slot.duration && (
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {slot.duration}h
                                  </div>
                                )}
                                {slot.capacity && (
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    Max {slot.capacity}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {slot.available && (
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-purple-600 flex items-center">
                                <DollarSign className="w-4 h-4" />
                                {slot.price}
                              </div>
                              <div className="text-xs text-gray-500">booking fee</div>
                            </div>
                          )}
                        </div>

                        {/* Premium slot indicator */}
                        {slot.isPremium && slot.available && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            PREMIUM
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {errors.slot && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{errors.slot}</span>
                    </div>
                  </div>
                )}

                {/* Booking guidelines */}
                {availableSlotCount > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Booking Guidelines:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Bookings must be made at least 2 hours in advance</li>
                      <li>• All slots are subject to availability</li>
                      <li>• Premium slots include additional equipment and services</li>
                      <li>• Cancellations must be made 24 hours before the booking time</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes validation
SlotSelection.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSlotSelect: PropTypes.func.isRequired,
  selectedPackage: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    minDuration: PropTypes.number,
    maxCapacity: PropTypes.number,
    minCapacity: PropTypes.number
  }),
  existingBookings: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    status: PropTypes.string
  }))
};

export default SlotSelection;