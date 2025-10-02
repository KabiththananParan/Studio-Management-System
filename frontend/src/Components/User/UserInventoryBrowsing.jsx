import React, { useState, useEffect } from 'react';

const UserInventoryBrowsing = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 12
  });
  const [selectedDates, setSelectedDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Backdrop', 'Props', 'Computer', 'Other'];

  useEffect(() => {
    fetchInventory();
  }, [filters, pagination.current, selectedDates]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...filters,
        ...(selectedDates.startDate && selectedDates.endDate && {
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate
        })
      });

      const response = await fetch(`http://localhost:5000/api/user/inventory-bookings/available?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setInventory(data.data.items);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination.total,
        totalItems: data.data.pagination.totalItems
      }));
    } catch (error) {
      setError('Failed to fetch inventory items');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDateChange = (field, value) => {
    setSelectedDates(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const addToCart = (item, quantity = 1) => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      setError('Please select rental dates first');
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.inventoryId === item._id);
    
    if (existingItem) {
      setCart(prev => prev.map(cartItem => 
        cartItem.inventoryId === item._id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      const days = Math.ceil((new Date(selectedDates.endDate) - new Date(selectedDates.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const totalCost = item.rental.dailyRate * quantity * days;
      
      setCart(prev => [...prev, {
        inventoryId: item._id,
        item,
        quantity,
        days,
        dailyRate: item.rental.dailyRate,
        totalCost
      }]);
    }
    
    setSuccess(`${item.name} added to cart`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const removeFromCart = (inventoryId) => {
    setCart(prev => prev.filter(item => item.inventoryId !== inventoryId));
  };

  const updateCartQuantity = (inventoryId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(inventoryId);
      return;
    }

    setCart(prev => prev.map(cartItem => {
      if (cartItem.inventoryId === inventoryId) {
        const totalCost = cartItem.dailyRate * quantity * cartItem.days;
        return { ...cartItem, quantity, totalCost };
      }
      return cartItem;
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalCost, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getDaysCount = () => {
    if (!selectedDates.startDate || !selectedDates.endDate) return 0;
    return Math.ceil((new Date(selectedDates.endDate) - new Date(selectedDates.startDate)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const proceedToBooking = () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    
    // Store cart and dates in localStorage for booking process
    localStorage.setItem('inventoryCart', JSON.stringify(cart));
    localStorage.setItem('rentalDates', JSON.stringify(selectedDates));
    
    // Navigate to booking form (you can implement this navigation)
    window.location.href = '/inventory-booking-form';
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rent Equipment</h1>
              <p className="text-gray-600 mt-1">Browse and rent professional photography equipment</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowCart(!showCart)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l-1.1 5m0 0h9.1M16 6h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
                </svg>
                Cart ({cart.length})
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError('')} className="float-right ml-2">×</button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            <button onClick={() => setSuccess('')} className="float-right ml-2">×</button>
          </div>
        )}

        {/* Filters and Date Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            {/* Date Range */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rental Period</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={selectedDates.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={selectedDates.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={selectedDates.startDate || new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedDates.startDate && selectedDates.endDate && (
                <p className="text-xs text-gray-500 mt-1">
                  {getDaysCount()} days rental
                </p>
              )}
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search equipment..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (Daily)</label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (Daily)</label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="rental.dailyRate-asc">Price Low-High</option>
                <option value="rental.dailyRate-desc">Price High-Low</option>
                <option value="createdAt-desc">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Equipment Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {item.images && item.images.length > 0 ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm">No image</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{item.brand} {item.model}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(item.rental.dailyRate)}/day
                        </p>
                        {selectedDates.startDate && selectedDates.endDate && (
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.rental.dailyRate * getDaysCount())} total
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Available: {item.availableQuantity}</p>
                        <p className="text-xs text-green-600">• {item.condition}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(item, 1)}
                        disabled={!selectedDates.startDate || !selectedDates.endDate || item.availableQuantity === 0}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => {/* Show item details */}}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                    disabled={pagination.current === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium">
                    {pagination.current} / {pagination.total}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                    disabled={pagination.current === pagination.total}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Cart</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cart.map((cartItem) => (
                        <div key={cartItem.inventoryId} className="border-b border-gray-200 pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{cartItem.item.name}</h4>
                            <button
                              onClick={() => removeFromCart(cartItem.inventoryId)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{cartItem.item.brand} {cartItem.item.model}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(cartItem.inventoryId, cartItem.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-xs"
                              >
                                -
                              </button>
                              <span className="text-sm">{cartItem.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(cartItem.inventoryId, cartItem.quantity + 1)}
                                disabled={cartItem.quantity >= cartItem.item.availableQuantity}
                                className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-xs disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-sm font-medium">{formatCurrency(cartItem.totalCost)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-lg">{formatCurrency(getCartTotal())}</span>
                      </div>
                      
                      {selectedDates.startDate && selectedDates.endDate && (
                        <p className="text-xs text-gray-500 mb-3">
                          For {getDaysCount()} days ({selectedDates.startDate} to {selectedDates.endDate})
                        </p>
                      )}

                      <button
                        onClick={proceedToBooking}
                        disabled={cart.length === 0 || !selectedDates.startDate || !selectedDates.endDate}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                      >
                        Proceed to Booking
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInventoryBrowsing;