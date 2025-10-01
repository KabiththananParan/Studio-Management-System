import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

const UserSlotsSelector = ({ selectedPackage, onSlotSelect, onBack }) => {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPackage?.id || selectedPackage?._id) {
      fetchSlots();
    }
  }, [selectedPackage]);

  const fetchSlots = async () => {
    const packageId = selectedPackage?.id || selectedPackage?._id;
    if (!packageId) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/user/slots/${packageId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      
      const data = await response.json();
      console.log('Fetched slots data:', data); // Debug log
      
      if (data.success && data.slots) {
        setSlots(data.slots);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load available time slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [...new Set(slots.map(slot => {
      const date = new Date(slot.date);
      return date.toISOString().split('T')[0];
    }))].sort();
    return dates;
  };

  const getSlotsForDate = (date) => {
    return slots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate.toISOString().split('T')[0] === date;
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
    
    // Prepare slot data for booking
    const slotData = {
      slotId: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      packageId: selectedPackage?.id || selectedPackage?._id,
      packageName: selectedPackage?.name,
      formattedDate: formatDate(slot.date),
      formattedTime: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
    };
    
    onSlotSelect(slotData);
  };

  const availableDates = getAvailableDates();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available time slots...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSlots}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select Time Slot</h2>
              <p className="text-gray-600">
                Choose your preferred date and time for {selectedPackage?.name}
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {availableDates.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Slots</h3>
            <p className="text-gray-600 mb-4">
              There are currently no available time slots for this package.
            </p>
            <button
              onClick={fetchSlots}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        ) : (
          <>
            {/* Date Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Available Dates ({availableDates.length})
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {availableDates.map(date => {
                  const slotsForDate = getSlotsForDate(date);
                  const availableCount = slotsForDate.length;
                  
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 ${
                        selectedDate === date
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{formatDate(date)}</div>
                      <div className={`text-xs mt-1 ${
                        selectedDate === date ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {availableCount} slots
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots for Selected Date */}
            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-600" />
                  Time Slots for {formatDate(selectedDate)}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSlotsForDate(selectedDate).map(slot => (
                    <button
                      key={slot._id}
                      onClick={() => handleSlotSelection(slot)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        selectedSlot?._id === slot._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-lg text-gray-900">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Available Now
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600 flex items-center">
                            <DollarSign className="w-4 h-4" />
                            {slot.price}
                          </div>
                          <div className="text-xs text-gray-500">slot fee</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {getSlotsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No available slots for this date</p>
                  </div>
                )}
              </div>
            )}

            {/* Booking Guidelines */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Booking Guidelines:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Select your preferred date and time slot</li>
                <li>• Slots are available on a first-come, first-served basis</li>
                <li>• Please arrive 15 minutes before your scheduled time</li>
                <li>• Cancellations must be made 24 hours in advance</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserSlotsSelector;