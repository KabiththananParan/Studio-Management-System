import React, { useState, useEffect } from 'react';

const SlotsTable = () => {
  const [slots, setSlots] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Form state for creating/editing slots
  const [slotForm, setSlotForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    price: 0,
    notes: ''
  });

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  // Fetch packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  // Fetch slots when package is selected
  useEffect(() => {
    if (selectedPackage) {
      fetchSlots();
    } else {
      setSlots([]);
    }
  }, [selectedPackage]);

  const fetchPackages = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError('No authentication token found. Please log in again.');
      return;
    }
    
    setPackagesLoading(true);
    try {
      console.log('Fetching packages...'); // Debug log
      const response = await fetch("http://localhost:5000/api/admin/packages", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch packages: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched packages:', data); // Debug log
      
      // The API returns packages directly as an array, not wrapped in an object
      setPackages(Array.isArray(data) ? data : []);
      setError(''); // Clear any previous errors
    } catch (err) {
      const errorMessage = `Failed to fetch packages: ${err.message}`;
      setError(errorMessage);
      console.error('Error fetching packages:', err);
    } finally {
      setPackagesLoading(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedPackage) return;
    
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/slots/${selectedPackage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch slots');
      
      const data = await response.json();
      setSlots(data.slots || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch slots');
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSlots = (date, startTime, endTime) => {
    const existingSlotsOnDate = slots.filter(slot => {
      const slotDate = new Date(slot.date).toDateString();
      const formDate = new Date(date).toDateString();
      return slotDate === formDate;
    });

    const conflictingSlots = existingSlotsOnDate.filter(slot => {
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      
      // Check if times overlap
      return (startTime < slotEnd && endTime > slotStart);
    });

    return { existingSlotsOnDate, conflictingSlots };
  };

  // Function to suggest available time slots
  const findAvailableTimeSlots = (date, startTime, endTime) => {
    const existingSlotsOnDate = slots.filter(slot => {
      const slotDate = new Date(slot.date).toDateString();
      const formDate = new Date(date).toDateString();
      return slotDate === formDate;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    const suggestions = [];
    const startHour = parseInt(startTime.split(':')[0]);
    const startMin = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMin = parseInt(endTime.split(':')[1]);
    
    const durationMs = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const durationHours = Math.floor(durationMs / 60);
    const durationMinutes = durationMs % 60;
    
    // Business hours (9 AM to 9 PM)
    const businessStart = { hour: 9, min: 0 };
    const businessEnd = { hour: 21, min: 0 };
    
    const formatTime = (hour, min) => `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    
    // Check gaps between existing slots for availability
    if (existingSlotsOnDate.length === 0) {
      suggestions.push(`${formatTime(businessStart.hour, businessStart.min)} - ${formatTime(businessStart.hour + durationHours, businessStart.min + durationMinutes)}`);
    } else {
      // Check before first slot
      const firstSlot = existingSlotsOnDate[0];
      const firstStartHour = parseInt(firstSlot.startTime.split(':')[0]);
      const firstStartMin = parseInt(firstSlot.startTime.split(':')[1]);
      
      if ((firstStartHour * 60 + firstStartMin) - (businessStart.hour * 60 + businessStart.min) >= durationMs) {
        suggestions.push(`${formatTime(businessStart.hour, businessStart.min)} - ${formatTime(businessStart.hour + durationHours, businessStart.min + durationMinutes)}`);
      }
      
      // Check gaps between slots
      for (let i = 0; i < existingSlotsOnDate.length - 1; i++) {
        const currentSlot = existingSlotsOnDate[i];
        const nextSlot = existingSlotsOnDate[i + 1];
        
        const currentEndHour = parseInt(currentSlot.endTime.split(':')[0]);
        const currentEndMin = parseInt(currentSlot.endTime.split(':')[1]);
        const nextStartHour = parseInt(nextSlot.startTime.split(':')[0]);
        const nextStartMin = parseInt(nextSlot.startTime.split(':')[1]);
        
        const gapMs = (nextStartHour * 60 + nextStartMin) - (currentEndHour * 60 + currentEndMin);
        
        if (gapMs >= durationMs) {
          const suggestedEndHour = currentEndHour + durationHours;
          const suggestedEndMin = currentEndMin + durationMinutes;
          suggestions.push(`${formatTime(currentEndHour, currentEndMin)} - ${formatTime(suggestedEndHour, suggestedEndMin)}`);
        }
      }
      
      // Check after last slot
      const lastSlot = existingSlotsOnDate[existingSlotsOnDate.length - 1];
      const lastEndHour = parseInt(lastSlot.endTime.split(':')[0]);
      const lastEndMin = parseInt(lastSlot.endTime.split(':')[1]);
      
      if ((businessEnd.hour * 60 + businessEnd.min) - (lastEndHour * 60 + lastEndMin) >= durationMs) {
        const suggestedEndHour = lastEndHour + durationHours;
        const suggestedEndMin = lastEndMin + durationMinutes;
        suggestions.push(`${formatTime(lastEndHour, lastEndMin)} - ${formatTime(suggestedEndHour, suggestedEndMin)}`);
      }
    }
    
    return suggestions.slice(0, 3); // Return up to 3 suggestions
  };

  const handleCreateSlot = async () => {
    const token = localStorage.getItem("token");
    
    // Validation before sending
    if (!selectedPackage) {
      setError('Please select a package first');
      console.log('Debug: selectedPackage is empty:', selectedPackage);
      console.log('Debug: available packages:', packages);
      return;
    }

    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      setError('Please fill in all required fields (date, start time, end time)');
      console.log('Debug: form validation failed:', {
        date: slotForm.date,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        price: slotForm.price
      });
      return;
    }

    // Validate that start time is before end time
    if (slotForm.startTime >= slotForm.endTime) {
      setError('Start time must be before end time');
      return;
    }

    // Validate that the date is not in the past
    const selectedDate = new Date(slotForm.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Cannot create slots for past dates');
      return;
    }

    // Check for conflicts with existing slots
    const { existingSlotsOnDate, conflictingSlots } = checkExistingSlots(
      slotForm.date, 
      slotForm.startTime, 
      slotForm.endTime
    );

    if (conflictingSlots.length > 0) {
      const conflictDetails = conflictingSlots.map(slot => 
        `${slot.startTime} - ${slot.endTime}`
      ).join(', ');
      
      // Get suggestions for alternative times
      const suggestions = findAvailableTimeSlots(
        slotForm.date, 
        slotForm.startTime, 
        slotForm.endTime
      );
      
      let errorMessage = `Time slot conflicts with existing slots: ${conflictDetails}.`;
      
      if (suggestions.length > 0) {
        errorMessage += ` Suggested available times: ${suggestions.join(', ')}`;
      } else {
        errorMessage += ' No alternative times available on this date.';
      }
      
      setError(errorMessage);
      return;
    }

    // Show helpful info if there are other slots on the same date
    if (existingSlotsOnDate.length > 0) {
      console.log('Existing slots on this date:', existingSlotsOnDate.map(slot => 
        `${slot.startTime} - ${slot.endTime}`
      ));
    }

    if (slotForm.price < 0 || isNaN(slotForm.price)) {
      setError('Please enter a valid price');
      return;
    }

    const requestData = {
      packageId: selectedPackage,
      date: slotForm.date,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      price: Number(slotForm.price),
      isAvailable: slotForm.isAvailable,
      notes: slotForm.notes || ''
    };

    console.log('Creating slot with data:', requestData);
    
    try {
      const response = await fetch("http://localhost:5000/api/admin/slots", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        
        // Provide specific error messages for different conflict types
        if (errorData.message.includes('conflicts with existing slot')) {
          throw new Error(`Time slot conflict! There's already a slot from ${requestData.startTime} to ${requestData.endTime} on ${requestData.date}. Please choose a different time or check existing slots below.`);
        } else {
          throw new Error(errorData.message || 'Failed to create slot');
        }
      }
      
      await fetchSlots(); // Refresh slots
      setIsCreateModalOpen(false);
      resetForm();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create slot');
      console.error('Error creating slot:', err);
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/slots/${editingSlot._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(slotForm)
      });
      
      if (!response.ok) throw new Error('Failed to update slot');
      
      await fetchSlots(); // Refresh slots
      setEditingSlot(null);
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to update slot');
      console.error('Error updating slot:', err);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete slot');
      
      await fetchSlots(); // Refresh slots
      setError('');
    } catch (err) {
      setError('Failed to delete slot');
      console.error('Error deleting slot:', err);
    }
  };

  const resetForm = () => {
    setSlotForm({
      date: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
      price: 0,
      notes: ''
    });
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      date: slot.date ? slot.date.split('T')[0] : '',
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : true,
      price: slot.price || 0,
      notes: slot.notes || ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`max-w-md w-full mx-4 p-6 rounded-2xl shadow-lg ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className={`text-2xl hover:opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Package Selection */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-2xl shadow-md border`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          Manage Time Slots
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Package
            </label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              disabled={packagesLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${packagesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {packagesLoading ? 'Loading packages...' : 
                 packages.length === 0 ? 'No packages available' : 
                 'Choose a package...'}
              </option>
              {packages.map((pkg) => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name} - ${pkg.price}
                </option>
              ))}
            </select>
            {packagesLoading && (
              <div className="flex items-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading packages...
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchPackages}
              disabled={packagesLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition whitespace-nowrap disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            {selectedPackage && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition whitespace-nowrap"
              >
                + Add Slot
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Slots Table */}
      {selectedPackage && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-md border overflow-hidden`}>
          <div className="p-6">
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Available Time Slots
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className={`ml-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading slots...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>No slots found for this package.</p>
                <p className="text-sm mt-2">Click "Add Slot" to create your first time slot.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                      <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time</th>
                      <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</th>
                      <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                      <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</th>
                      <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot._id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {formatDate(slot.date)}
                        </td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          ${slot.price || 0}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            slot.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {slot.notes || 'No notes'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(slot)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Slot Modal */}
      <Modal
        isOpen={isCreateModalOpen || editingSlot !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingSlot(null);
          resetForm();
        }}
        title={editingSlot ? 'Edit Slot' : 'Create New Slot'}
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date
            </label>
            <input
              type="date"
              value={slotForm.date}
              onChange={(e) => setSlotForm({...slotForm, date: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            
            {/* Show existing slots for the selected date */}
            {slotForm.date && (() => {
              const existingOnDate = slots.filter(slot => 
                slot.date.split('T')[0] === slotForm.date
              );
              
              if (existingOnDate.length > 0) {
                return (
                  <div className={`mt-2 p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'
                  } border`}>
                    <div className={`text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Existing slots on {new Date(slotForm.date).toLocaleDateString()}:
                    </div>
                    <div className="space-y-1">
                      {existingOnDate
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((slot, index) => (
                          <div 
                            key={slot._id || index}
                            className={`text-xs p-2 rounded ${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-white text-gray-600'
                            }`}
                          >
                            <span className="font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            {slot.package && (
                              <span className="ml-2 text-blue-600 dark:text-blue-400">
                                ({slot.package.name || 'Package'})
                              </span>
                            )}
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                              slot.isAvailable 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {slot.isAvailable ? 'Available' : 'Booked'}
                            </span>
                          </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div className={`mt-2 p-2 rounded text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No existing slots on this date
                </div>
              );
            })()}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Start Time
              </label>
              <input
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm({...slotForm, startTime: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                End Time
              </label>
              <input
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm({...slotForm, endTime: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={slotForm.price}
              onChange={(e) => setSlotForm({...slotForm, price: parseFloat(e.target.value) || 0})}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          
          <div>
            <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <input
                type="checkbox"
                checked={slotForm.isAvailable}
                onChange={(e) => setSlotForm({...slotForm, isAvailable: e.target.checked})}
                className="mr-2 rounded focus:ring-2 focus:ring-blue-500"
              />
              Available for booking
            </label>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes (optional)
            </label>
            <textarea
              value={slotForm.notes}
              onChange={(e) => setSlotForm({...slotForm, notes: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows="3"
              placeholder="Add any special notes for this slot..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingSlot(null);
                resetForm();
              }}
              className={`px-4 py-2 rounded-lg transition ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-700 text-gray-200' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={editingSlot ? handleUpdateSlot : handleCreateSlot}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              {editingSlot ? 'Update' : 'Create'} Slot
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SlotsTable;