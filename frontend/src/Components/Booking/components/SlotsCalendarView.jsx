import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const SlotsCalendarView = ({ selectedPackage, onSlotSelect }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (selectedPackage) {
      fetchSlots();
    }
  }, [selectedPackage, currentMonth]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const packageId = selectedPackage.id || selectedPackage._id;
      
      // Get start and end of current month
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await fetch(
        `http://localhost:5000/api/user/slots/${packageId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getSlotsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter(slot => {
      const slotDate = new Date(slot.date).toISOString().split('T')[0];
      return slotDate === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 border rounded"
          >
            ←
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 border rounded"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {getDaysInMonth().map((date, index) => {
          const daySlots = date ? getSlotsForDate(date) : [];
          const hasSlots = daySlots.length > 0;
          const isToday = date && date.toDateString() === new Date().toDateString();
          const isPast = date && date < new Date().setHours(0, 0, 0, 0);
          
          return (
            <div
              key={index}
              className={`min-h-[80px] p-1 border border-gray-100 ${
                date ? (hasSlots && !isPast ? 'bg-purple-50 hover:bg-purple-100 cursor-pointer' : 'bg-gray-50') : ''
              } ${isToday ? 'ring-2 ring-purple-500' : ''}`}
              onClick={() => hasSlots && !isPast && date && onSlotSelect({ date, slots: daySlots })}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium ${
                    isPast ? 'text-gray-400' : 
                    hasSlots ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </div>
                  {hasSlots && !isPast && (
                    <div className="mt-1">
                      <div className="text-xs bg-purple-200 text-purple-800 px-1 rounded">
                        {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-200 rounded mr-1"></div>
          <span>Available slots</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
          <span>No availability</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border-2 border-purple-500 rounded mr-1"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default SlotsCalendarView;