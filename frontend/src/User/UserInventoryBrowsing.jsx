import React, { useState, useEffect } from 'react';

const UserInventoryBrowsing = ({ isDarkMode = false }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [availabilityChecking, setAvailabilityChecking] = useState({});

  // Categories for filtering
  const categories = ['All', 'Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Backdrop', 'Props', 'Computer', 'Other'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');

      
      if (!token) {

        setError('Please log in to browse equipment');
        setLoading(false);
        return;
      }


      const response = await fetch('http://localhost:5000/api/user/inventory-bookings/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      


      if (response.ok) {
        const data = await response.json();
        const items = data.data?.items || [];
        setInventory(items);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('An error occurred while fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (item) => {
    if (!startDate || !endDate) {
      alert('Please select rental dates first');
      return;
    }

    try {
      setAvailabilityChecking(prev => ({ ...prev, [item._id]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/inventory-bookings/check-availability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{ inventoryId: item._id, quantity: 1 }],
          startDate,
          endDate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.availability?.length > 0) {
        const availabilityResult = data.data.availability[0];
        
        if (availabilityResult.available) {
          // Add to cart with availability info
          const cartItem = {
            ...item,
            startDate,
            endDate,
            totalCost: availabilityResult.pricing.totalCost,
            depositAmount: availabilityResult.pricing.deposit,
            rentalDays: availabilityResult.pricing.days,
            dailyRate: availabilityResult.pricing.dailyRate
          };
          
          setCart(prev => {
            const existing = prev.find(cartItem => cartItem._id === item._id);
            if (existing) {
              // Update existing item
              return prev.map(existingItem => 
                existingItem._id === item._id ? cartItem : existingItem
              );
            }
            return [...prev, cartItem];
          });
          
          alert(`✅ Added to cart!\n${item.name}\nDates: ${startDate} to ${endDate}\nTotal cost: LKR ${availabilityResult.pricing.totalCost.toLocaleString()}`);
        } else {
          alert(`❌ ${availabilityResult.reason || 'Item not available for selected dates'}`);
        }
      } else {
        alert(`❌ ${data.message || 'No availability data received'}`);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      alert('Error checking availability');
    } finally {
      setAvailabilityChecking(prev => ({ ...prev, [item._id]: false }));
    }
  };

  const addToCart = async (item) => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates before adding to cart');
      return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      alert('End date must be after start date');
      return;
    }
    
    await checkAvailability(item);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item._id !== itemId));
  };

  const proceedToBooking = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Get user information first
      const userResponse = await fetch('http://localhost:5000/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }

      const user = await userResponse.json();

      // Group cart items by date range (in case user has multiple date ranges)
      const bookingGroups = {};
      
      cart.forEach(item => {
        const key = `${item.startDate}_${item.endDate}`;
        if (!bookingGroups[key]) {
          bookingGroups[key] = {
            startDate: item.startDate,
            endDate: item.endDate,
            items: []
          };
        }
        bookingGroups[key].items.push({
          inventoryId: item._id,
          quantity: 1
        });
      });

      const bookings = [];

      // Create one booking per date range
      for (const group of Object.values(bookingGroups)) {
        const bookingData = {
          items: group.items,
          startDate: group.startDate,
          endDate: group.endDate,
          customerInfo: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone || 'Not provided'
          },
          notes: 'Equipment rental booking created from inventory browsing'
        };

        console.log('📋 Sending booking data:', JSON.stringify(bookingData, null, 2));

        const response = await fetch('http://localhost:5000/api/user/inventory-bookings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Booking created:', data);
          bookings.push(data.data || data.booking);
        } else {
          const errorData = await response.json();
          console.error('❌ Booking creation failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData.message || `Failed to create booking (Status: ${response.status})`);
        }
      }

      // Clear cart and show success
      setCart([]);
      setShowCart(false);
      alert(`Successfully created ${bookings.length} booking(s)! Check your dashboard for payment options.`);
      
      // Optionally redirect to dashboard
      // window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Error creating bookings:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      // Show more detailed error
      if (error.message.includes('Failed to get user information')) {
        alert('Please log in again to continue with booking');
      } else if (error.message.includes('Failed to create booking')) {
        alert('Booking creation failed. Please check your cart items and try again.');
      } else {
        alert('Error creating bookings: ' + error.message + '\nPlease check the console for more details.');
      }
    }
  };

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter((item, index) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    
    const matchesPrice = item.rental?.dailyRate >= priceRange.min && 
                        item.rental?.dailyRate <= priceRange.max;
    
    const isAvailable = item.rental?.isAvailableForRent && 
                       (item.status === 'Available' || item.status === undefined) && 
                       item.availableQuantity > 0;

    return matchesSearch && matchesCategory && matchesPrice && isAvailable;
  });

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + (item.totalCost || 0), 0);
  };

  // Function to get equipment image URL based on category and name
  const getEquipmentImage = (item) => {
    const category = item.category?.toLowerCase();
    const name = item.name?.toLowerCase();
    
    // Lighting equipment
    if (category === 'lighting' || name.includes('flash') || name.includes('light') || name.includes('profoto') || name.includes('godox')) {
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop&crop=center';
    }
    
    // Audio equipment
    if (category === 'audio' || name.includes('mic') || name.includes('audio') || name.includes('rode') || name.includes('sound')) {
      return 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop&crop=center';
    }
    
    // Camera equipment
    if (category === 'camera' || name.includes('camera') || name.includes('canon') || name.includes('nikon') || name.includes('sony')) {
      return 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&crop=center';
    }
    
    // Lens equipment
    if (category === 'lens' || name.includes('lens') || name.includes('mm') || name.includes('f/')) {
      return 'https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=400&h=300&fit=crop&crop=center';
    }
    
    // Tripod equipment
    if (category === 'tripod' || name.includes('tripod') || name.includes('stand') || name.includes('manfrotto')) {
      return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&crop=center';
    }
    
    // Backdrop equipment
    if (category === 'backdrop' || name.includes('backdrop') || name.includes('background') || name.includes('colorama')) {
      return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&crop=center';
    }
    
    // Props
    if (category === 'props' || name.includes('prop') || name.includes('reflector') || name.includes('softbox')) {
      return 'https://images.unsplash.com/photo-1542038784456-1ea8e732331d?w=400&h=300&fit=crop&crop=center';
    }
    
    // Computer equipment
    if (category === 'computer' || name.includes('computer') || name.includes('laptop') || name.includes('monitor')) {
      return 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=400&h=300&fit=crop&crop=center';
    }
    
    // Default photography equipment image
    return 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&crop=center';
  };

  const getTotalDeposit = () => {
    return cart.reduce((total, item) => total + (item.depositAmount || 0), 0);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Browse Equipment
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Rent professional photography equipment for your projects
          </p>
        </div>
        
        <button
          onClick={() => setShowCart(true)}
          className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Cart ({cart.length})
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Date Selection */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Select Rental Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search Equipment
            </label>
            <input
              type="text"
              placeholder="Search by name, brand, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 placeholder-gray-500'}`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Daily Rate Range (LKR)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 50000 }))}
                className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Available Equipment ({filteredInventory.length} items)
          </h3>
        </div>

        {filteredInventory.length === 0 ? (
          <div className={`text-center py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border`}>
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l5-5v5.5m0 0V14m0 0l5-2" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              No Equipment Found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => (
              <div key={item._id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden hover:shadow-lg transition-shadow duration-200`}>
                {/* Equipment Image */}
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={getEquipmentImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center hidden">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {/* Category badge overlay */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Equipment Info */}
                  <div className="mb-4">
                    <h4 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                      {item.name}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.brand} {item.model}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.condition === 'Excellent' 
                          ? 'bg-green-100 text-green-800' 
                          : item.condition === 'Good'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.condition}
                      </span>
                      <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.availableQuantity} available
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        LKR {item.rental?.dailyRate?.toLocaleString()}
                      </span>
                      <span className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        /day
                      </span>
                    </div>
                    {item.rental?.weeklyRate && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Weekly: LKR {item.rental.weeklyRate.toLocaleString()}
                      </p>
                    )}
                    {item.rental?.depositRequired && (
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                        Deposit: LKR {item.rental.depositAmount?.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-2`}>
                      {item.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => addToCart(item)}
                    disabled={availabilityChecking[item._id] || !startDate || !endDate}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                      availabilityChecking[item._id]
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : !startDate || !endDate
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {availabilityChecking[item._id] 
                      ? 'Checking...' 
                      : !startDate || !endDate
                      ? 'Select Dates First'
                      : 'Add to Cart'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Your Cart ({cart.length} items)
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className={`text-gray-400 hover:text-gray-600 text-2xl`}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {cart.length === 0 ? (
                <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your cart is empty
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item._id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.brand} {item.model}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.startDate} to {item.endDate} ({item.rentalDays} days)
                          </p>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-1`}>
                            <span className="font-medium">Total: LKR {item.totalCost?.toLocaleString()}</span>
                            {item.depositAmount > 0 && (
                              <span className="ml-2 text-xs">
                                (+ LKR {item.depositAmount?.toLocaleString()} deposit)
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <div className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Rental Cost:</span>
                    <span>LKR {getTotalCartValue().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Deposit:</span>
                    <span>LKR {getTotalDeposit().toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between text-lg font-bold mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <span>Total Amount:</span>
                    <span>LKR {(getTotalCartValue() + getTotalDeposit()).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={proceedToBooking}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                >
                  Proceed to Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInventoryBrowsing;