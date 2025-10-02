import React, { useState, useEffect } from 'react';

const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    condition: 'all',
    location: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 10
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = ['Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Backdrop', 'Props', 'Computer', 'Other'];
  const statuses = ['Available', 'In Use', 'Maintenance', 'Damaged', 'Lost'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair'];

  useEffect(() => {
    fetchInventory();
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, filters, pagination.current]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`http://localhost:5000/api/admin/inventory?${queryParams}`, {
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

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/inventory/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      setError('Failed to fetch analytics');
      console.error('Error:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSort = (sortBy) => {
    const sortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventory.map(item => item._id));
    }
  };

  const handleAddItem = () => {
    setCurrentItem(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/inventory/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete item');
        }

        setSuccess('Item deleted successfully');
        fetchInventory();
      } catch (error) {
        setError('Failed to delete item');
        console.error('Error:', error);
      }
    }
  };

  const handleBulkUpdate = async (updateData) => {
    if (selectedItems.length === 0) {
      setError('Please select items to update');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/inventory/bulk-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: selectedItems,
          updateData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update items');
      }

      setSuccess('Items updated successfully');
      setSelectedItems([]);
      fetchInventory();
    } catch (error) {
      setError('Failed to update items');
      console.error('Error:', error);
    }
  };

  const exportInventory = async (format = 'json') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/inventory/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export inventory');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.csv';
        a.click();
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.json';
        a.click();
      }

      setSuccess('Inventory exported successfully');
    } catch (error) {
      setError('Failed to export inventory');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-green-100 text-green-800',
      'In Use': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-yellow-100 text-yellow-800',
      'Damaged': 'bg-red-100 text-red-800',
      'Lost': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-orange-100 text-orange-800',
      'Needs Repair': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-LK');
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-1">Manage studio equipment and assets</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAddItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => exportInventory('json')}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportInventory('csv')}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Export CSV
                </button>
              </div>
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Tabs">
              {[
                { id: 'list', name: 'Inventory List', icon: '📋' },
                { id: 'analytics', name: 'Analytics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'list' && (
              <>
                {/* Filters */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Search inventory..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
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
                    <div>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={filters.condition}
                        onChange={(e) => handleFilterChange('condition', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Conditions</option>
                        {conditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Location..."
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                          const [sortBy, sortOrder] = e.target.value.split('-');
                          setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="purchasePrice-desc">Price High-Low</option>
                        <option value="purchasePrice-asc">Price Low-High</option>
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedItems.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <span className="text-blue-700 font-medium">
                          {selectedItems.length} items selected
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleBulkUpdate({ status: 'Available' })}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Mark Available
                          </button>
                          <button
                            onClick={() => handleBulkUpdate({ status: 'Maintenance' })}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            Mark Maintenance
                          </button>
                          <button
                            onClick={() => handleBulkUpdate({ status: 'Damaged' })}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Mark Damaged
                          </button>
                          <button
                            onClick={() => setSelectedItems([])}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                          >
                            Clear Selection
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === inventory.length && inventory.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('name')}
                        >
                          Item Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('purchasePrice')}
                        >
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item._id)}
                              onChange={() => handleSelectItem(item._id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img 
                                  className="h-12 w-12 rounded object-cover border"
                                  src={item.imageUrl || getDefaultImageForCategory(item.category)}
                                  alt={item.name}
                                  onError={(e) => {
                                    e.target.src = getDefaultImageForCategory(item.category);
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.brand} {item.model}</div>
                                <div className="text-xs text-gray-400">S/N: {item.serialNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.availableQuantity} / {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(item.currentValue || item.purchasePrice)}</div>
                            <div className="text-xs text-gray-500">Purchased: {formatCurrency(item.purchasePrice)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-red-600 hover:text-red-900"
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

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {inventory.map((item) => (
                    <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded object-cover border"
                              src={item.imageUrl || getDefaultImageForCategory(item.category)}
                              alt={item.name}
                              onError={(e) => {
                                e.target.src = getDefaultImageForCategory(item.category);
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.brand} {item.model}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800`}>
                            {item.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Condition:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getConditionColor(item.condition)}`}>
                            {item.condition}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="ml-2 font-medium">{item.availableQuantity} / {item.quantity}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Value:</span>
                          <span className="ml-2 font-medium">{formatCurrency(item.currentValue || item.purchasePrice)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">S/N:</span>
                          <span className="ml-2 text-xs font-mono">{item.serialNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.current * pagination.limit, pagination.totalItems)} of{' '}
                      {pagination.totalItems} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                        disabled={pagination.current === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium">
                        {pagination.current} / {pagination.total}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                        disabled={pagination.current === pagination.total}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📦</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Items</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalItems}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✅</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Available</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics.overview.availableItems}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🔧</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Maintenance</p>
                        <p className="text-2xl font-semibold text-gray-900">{analytics.overview.maintenanceItems}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">💰</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Value</p>
                        <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.overview.totalValue)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Category</th>
                          <th className="text-left py-2">Items</th>
                          <th className="text-left py-2">Available</th>
                          <th className="text-left py-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.categoryBreakdown.map((category) => (
                          <tr key={category._id} className="border-b">
                            <td className="py-2">{category._id}</td>
                            <td className="py-2">{category.count}</td>
                            <td className="py-2">{category.availableItems}</td>
                            <td className="py-2">{formatCurrency(category.totalValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Alerts */}
                {(analytics.maintenanceAlerts.length > 0 || analytics.lowStockItems.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analytics.maintenanceAlerts.length > 0 && (
                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-lg font-medium text-red-600 mb-4">
                          🚨 Maintenance Alerts
                        </h3>
                        <div className="space-y-2">
                          {analytics.maintenanceAlerts.map((item) => (
                            <div key={item._id} className="p-3 bg-red-50 border border-red-200 rounded">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.brand} {item.model}</p>
                              <p className="text-xs text-red-600">Condition: {item.condition}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analytics.lowStockItems.length > 0 && (
                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="text-lg font-medium text-yellow-600 mb-4">
                          ⚠️ Low Stock Items
                        </h3>
                        <div className="space-y-2">
                          {analytics.lowStockItems.map((item) => (
                            <div key={item._id} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.brand} {item.model}</p>
                              <p className="text-xs text-yellow-600">
                                Stock: {item.availableQuantity} / {item.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <InventoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          item={currentItem}
          onSuccess={() => {
            setShowModal(false);
            fetchInventory();
            setSuccess(`Item ${modalMode === 'add' ? 'added' : 'updated'} successfully`);
          }}
          onError={setError}
        />
      )}
    </div>
  );
};

// Helper function to get default image for category
const getDefaultImageForCategory = (category) => {
  const imageMap = {
    'Lighting': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop&crop=center',
    'Audio': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop&crop=center',
    'Camera': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&crop=center',
    'Lens': 'https://images.unsplash.com/photo-1606918801925-e2c914c4b503?w=400&h=300&fit=crop&crop=center',
    'Tripod': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&crop=center',
    'Backdrop': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&crop=center',
    'Props': 'https://images.unsplash.com/photo-1542038784456-1ea8e732331d?w=400&h=300&fit=crop&crop=center',
    'Computer': 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=400&h=300&fit=crop&crop=center',
    'Other': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop&crop=center'
  };
  return imageMap[category] || imageMap['Other'];
};

// Inventory Modal Component
const InventoryModal = ({ isOpen, onClose, mode, item, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Camera',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    availableQuantity: 1,
    condition: 'Good',
    status: 'Available',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    warrantyExpiry: '',
    description: '',
    imageUrl: '',
    'supplier.name': '',
    'supplier.contact': '',
    'supplier.email': ''
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Backdrop', 'Props', 'Computer', 'Other'];
  const statuses = ['Available', 'In Use', 'Maintenance', 'Damaged', 'Lost'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair'];

  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'Camera',
        brand: item.brand || '',
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        quantity: item.quantity || 1,
        availableQuantity: item.availableQuantity || 1,
        condition: item.condition || 'Good',
        status: item.status || 'Available',
        location: item.location || '',
        purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
        purchasePrice: item.purchasePrice || '',
        currentValue: item.currentValue || '',
        warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.split('T')[0] : '',
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        'supplier.name': item.supplier?.name || '',
        'supplier.contact': item.supplier?.contact || '',
        'supplier.email': item.supplier?.email || ''
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        category: 'Camera',
        brand: '',
        model: '',
        serialNumber: '',
        quantity: 1,
        availableQuantity: 1,
        condition: 'Good',
        status: 'Available',
        location: '',
        purchaseDate: '',
        purchasePrice: '',
        currentValue: '',
        warrantyExpiry: '',
        description: '',
        imageUrl: '',
        'supplier.name': '',
        'supplier.contact': '',
        'supplier.email': ''
      });
    }
  }, [mode, item]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-update available quantity when total quantity changes
    if (field === 'quantity') {
      setFormData(prev => ({
        ...prev,
        availableQuantity: Math.min(prev.availableQuantity, parseInt(value) || 0)
      }));
    }

    // Auto-set current value to purchase price if not already set
    if (field === 'purchasePrice' && !formData.currentValue) {
      setFormData(prev => ({
        ...prev,
        currentValue: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = mode === 'add' 
        ? 'http://localhost:5000/api/admin/inventory'
        : `http://localhost:5000/api/admin/inventory/${item._id}`;

      // Prepare the data
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        availableQuantity: parseInt(formData.availableQuantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentValue: parseFloat(formData.currentValue || formData.purchasePrice),
        supplier: {
          name: formData['supplier.name'],
          contact: formData['supplier.contact'],
          email: formData['supplier.email']
        }
      };

      // Remove empty supplier fields
      if (!submitData.supplier.name && !submitData.supplier.contact && !submitData.supplier.email) {
        delete submitData.supplier;
      }

      // Remove empty dates
      if (!submitData.warrantyExpiry) {
        delete submitData.warrantyExpiry;
      }

      const response = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item');
      }

      onSuccess();
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl bg-white rounded-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'add' ? 'Add New Inventory Item' : 'Edit Inventory Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Studio A, Storage Room, Shelf 1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status and Quantity */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Status & Quantity</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.quantity}
                    required
                    value={formData.availableQuantity}
                    onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional notes about this item..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Image Section */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Equipment Image</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                  <span className="text-xs text-gray-500 ml-2">(Optional - will auto-generate based on category if not provided)</span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="w-full h-40 border border-gray-300 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img 
                      src={formData.imageUrl}
                      alt="Equipment preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-500">
                        {formData.category ? `Auto-generated ${formData.category.toLowerCase()} image will be used` : 'No image'}
                      </p>
                    </div>
                  )}
                  {/* Error fallback */}
                  <div className="text-center hidden">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-500">Failed to load image</p>
                  </div>
                </div>
              </div>

              {/* Quick Image Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Suggestions</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleInputChange('imageUrl', getDefaultImageForCategory(formData.category))}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-left"
                  >
                    📸 Use {formData.category} Default
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('imageUrl', '')}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-left"
                  >
                    🔄 Auto-Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (LKR) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value (LKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.currentValue}
                onChange={(e) => handleInputChange('currentValue', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Supplier Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData['supplier.name']}
                  onChange={(e) => handleInputChange('supplier.name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={formData['supplier.contact']}
                  onChange={(e) => handleInputChange('supplier.contact', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData['supplier.email']}
                  onChange={(e) => handleInputChange('supplier.email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
            <input
              type="date"
              value={formData.warrantyExpiry}
              onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (mode === 'add' ? 'Add Item' : 'Update Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminInventory;