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

  const handleCreateSlot = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch("http://localhost:5000/api/admin/slots", {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          ...slotForm
        })
      });
      
      if (!response.ok) throw new Error('Failed to create slot');
      
      await fetchSlots(); // Refresh slots
      setIsCreateModalOpen(false);
      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to create slot');
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