import React, { useEffect, useState } from "react";
import axios from "axios";

const PackagesTable = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPackage, setEditingPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: '',
    image: '',
    isActive: true
  });
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportFormat, setReportFormat] = useState("csv");
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch all packages
  const fetchPackages = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/admin/packages", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      // Ensure we always have an array
      const packagesData = Array.isArray(res.data) ? res.data : [];
      setPackages(packagesData);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching packages:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch packages. Please try again.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleGenerateReport = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    setReportLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportFrom) params.append("from", reportFrom);
      if (reportTo) params.append("to", reportTo);
      if (reportFormat) params.append("format", reportFormat);

      const res = await axios.get(
        `http://localhost:5000/api/admin/packages/report?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: reportFormat === 'csv' ? 'blob' : 'json',
        }
      );

      if (reportFormat === 'csv') {
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `packages_report_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // JSON fallback: open in new tab
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `packages_report_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("Error generating report:", err);
      alert(err.response?.data?.message || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  // Add new package
  const handleAddPackage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    // Validation
    if (!newPackage.name.trim()) {
      alert("Package name is required");
      return;
    }
    if (!newPackage.description.trim()) {
      alert("Package description is required");
      return;
    }
    if (!newPackage.price || parseFloat(newPackage.price) <= 0) {
      alert("Valid price is required");
      return;
    }
    if (!newPackage.duration || parseInt(newPackage.duration) <= 0) {
      alert("Valid duration is required");
      return;
    }

    try {
      const packageToAdd = {
        name: newPackage.name.trim(),
        description: newPackage.description.trim(),
        price: parseFloat(newPackage.price),
        duration: parseInt(newPackage.duration),
        features: newPackage.features.split('\n').filter(f => f.trim() !== ''),
        image: newPackage.image.trim() || null,
        isActive: newPackage.isActive
      };

      const res = await axios.post(
        "http://localhost:5000/api/admin/packages",
        packageToAdd,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      setPackages(Array.isArray(packages) ? [...packages, res.data] : [res.data]);
      setShowModal(false);
      setIsAddMode(false);
      setNewPackage({
        name: '',
        description: '',
        price: '',
        duration: '',
        features: '',
        image: '',
        isActive: true
      });
      alert("Package added successfully!");
    } catch (err) {
      console.error("Error adding package:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to add package");
      }
    }
  };

  // Delete package
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/packages/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      setPackages(Array.isArray(packages) ? packages.filter((pkg) => pkg._id !== id) : []);
      alert("Package deleted successfully!");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to delete package");
      }
    }
  };

  // Open edit modal
  const handleEdit = (pkg) => {
    setEditingPackage({
      ...pkg,
      features: pkg.features ? pkg.features.join('\n') : ''
    });
    setIsAddMode(false);
    setShowModal(true);
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setNewPackage({
      name: '',
      description: '',
      price: '',
      duration: '',
      features: '',
      image: '',
      isActive: true
    });
    setIsAddMode(true);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setIsAddMode(false);
    setEditingPackage(null);
    setNewPackage({
      name: '',
      description: '',
      price: '',
      duration: '',
      features: '',
      image: '',
      isActive: true
    });
  };

  // Save edited package
  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    // Validation
    if (!editingPackage.name.trim()) {
      alert("Package name is required");
      return;
    }
    if (!editingPackage.description.trim()) {
      alert("Package description is required");
      return;
    }
    if (!editingPackage.price || parseFloat(editingPackage.price) <= 0) {
      alert("Valid price is required");
      return;
    }
    if (!editingPackage.duration || parseInt(editingPackage.duration) <= 0) {
      alert("Valid duration is required");
      return;
    }

    try {
      const updatedPackage = {
        name: editingPackage.name.trim(),
        description: editingPackage.description.trim(),
        features: editingPackage.features.split('\n').filter(f => f.trim() !== ''),
        price: parseFloat(editingPackage.price),
        duration: parseInt(editingPackage.duration),
        image: editingPackage.image?.trim() || null,
        isActive: editingPackage.isActive
      };

      const res = await axios.put(
        `http://localhost:5000/api/admin/packages/${editingPackage._id}`,
        updatedPackage,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      setPackages(Array.isArray(packages) ? packages.map((pkg) => (pkg._id === editingPackage._id ? res.data : pkg)) : [res.data]);
      setShowModal(false);
      setEditingPackage(null);
      alert("Package updated successfully!");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to update package");
      }
    }
  };

  // Toggle package status
  const toggleStatus = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/packages/${id}`,
        { isActive: !currentStatus },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      setPackages(Array.isArray(packages) ? packages.map((pkg) => (pkg._id === id ? res.data : pkg)) : [res.data]);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to update package status");
      }
    }
  };

  if (loading) return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading packages...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
        {error.includes("log in again") && (
          <button 
            onClick={() => window.location.href = "/admin-login"}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Packages Management</h1>
          <p className="text-gray-600 mt-1">Manage studio packages and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <input
              type="date"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              title="From date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              title="To date"
            />
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              title="Format"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleGenerateReport}
              disabled={reportLoading}
              className={`flex items-center px-4 py-2 ${reportLoading ? 'bg-gray-300' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg transition-colors shadow-sm`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m10 12V4M4 20h16"></path>
              </svg>
              {reportLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add New Package
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Package Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration (hrs)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Features
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(packages) && packages.map((pkg) => (
              <tr key={pkg._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{pkg.name}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate text-gray-600" title={pkg.description}>
                    {pkg.description}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-green-600">${pkg.price}</td>
                <td className="px-6 py-4 text-gray-600">{pkg.duration}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate text-gray-600">
                    {pkg.features ? 
                      (Array.isArray(pkg.features) ? 
                        pkg.features.join(', ') : 
                        pkg.features
                      ) : 'No features listed'
                    }
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStatus(pkg._id, pkg.isActive)}
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                      pkg.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {(!Array.isArray(packages) || packages.length === 0) && (
              <tr>
                <td colSpan="7" className="text-center py-12">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"></path>
                    </svg>
                    <p className="text-gray-500 font-medium">No packages found</p>
                    <p className="text-gray-400 text-sm mt-1">Get started by creating your first package</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {isAddMode ? 'Add New Package' : 'Edit Package'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={isAddMode ? newPackage.name : editingPackage?.name || ''}
                    onChange={(e) => {
                      if (isAddMode) {
                        setNewPackage({...newPackage, name: e.target.value});
                      } else {
                        setEditingPackage({...editingPackage, name: e.target.value});
                      }
                    }}
                    placeholder="e.g., Premium Photography Package"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={isAddMode ? newPackage.description : editingPackage?.description || ''}
                    onChange={(e) => {
                      if (isAddMode) {
                        setNewPackage({...newPackage, description: e.target.value});
                      } else {
                        setEditingPackage({...editingPackage, description: e.target.value});
                      }
                    }}
                    rows="3"
                    placeholder="Describe what this package includes..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={isAddMode ? newPackage.price : editingPackage?.price || ''}
                      onChange={(e) => {
                        if (isAddMode) {
                          setNewPackage({...newPackage, price: e.target.value});
                        } else {
                          setEditingPackage({...editingPackage, price: e.target.value});
                        }
                      }}
                      placeholder="99.99"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={isAddMode ? newPackage.duration : editingPackage?.duration || ''}
                      onChange={(e) => {
                        if (isAddMode) {
                          setNewPackage({...newPackage, duration: e.target.value});
                        } else {
                          setEditingPackage({...editingPackage, duration: e.target.value});
                        }
                      }}
                      placeholder="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <textarea
                    value={isAddMode ? newPackage.features : editingPackage?.features || ''}
                    onChange={(e) => {
                      if (isAddMode) {
                        setNewPackage({...newPackage, features: e.target.value});
                      } else {
                        setEditingPackage({...editingPackage, features: e.target.value});
                      }
                    }}
                    rows="4"
                    placeholder="Professional photographer&#10;High-resolution photos&#10;Basic editing included&#10;Online gallery access"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter each feature on a new line</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={isAddMode ? newPackage.image : editingPackage?.image || ''}
                    onChange={(e) => {
                      if (isAddMode) {
                        setNewPackage({...newPackage, image: e.target.value});
                      } else {
                        setEditingPackage({...editingPackage, image: e.target.value});
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Optional: Add a preview image for this package</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isAddMode ? newPackage.isActive : editingPackage?.isActive || false}
                    onChange={(e) => {
                      if (isAddMode) {
                        setNewPackage({...newPackage, isActive: e.target.checked});
                      } else {
                        setEditingPackage({...editingPackage, isActive: e.target.checked});
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Package is Active (visible to customers)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={isAddMode ? handleAddPackage : handleSaveEdit}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                  {isAddMode ? 'Add Package' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesTable;