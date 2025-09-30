import React, { useEffect, useState } from "react";
import axios from "axios";

const PackagesTable = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPackage, setEditingPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      
      setPackages(res.data);
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
      setPackages(packages.filter((pkg) => pkg._id !== id));
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
    setShowModal(true);
  };

  // Save edited package
  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    try {
      const updatedPackage = {
        ...editingPackage,
        features: editingPackage.features.split('\n').filter(f => f.trim() !== ''),
        price: parseFloat(editingPackage.price),
        duration: parseInt(editingPackage.duration)
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
      
      setPackages(packages.map((pkg) => (pkg._id === editingPackage._id ? res.data : pkg)));
      setShowModal(false);
      setEditingPackage(null);
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
      
      setPackages(packages.map((pkg) => (pkg._id === id ? res.data : pkg)));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to update package status");
      }
    }
  };

  if (loading) return <p>Loading packages...</p>;
  if (error) return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <p className="text-red-500">{error}</p>
      {error.includes("log in again") && (
        <button 
          onClick={() => window.location.href = "/admin-login"}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Login
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Packages</h1>
        <button 
          onClick={() => {
            // You can implement add package functionality here
            alert("Add package functionality - implement as needed");
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add Package
        </button>
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
            {packages.map((pkg) => (
              <tr key={pkg._id}>
                <td className="px-6 py-4 font-medium">{pkg.name}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate" title={pkg.description}>
                    {pkg.description}
                  </div>
                </td>
                <td className="px-6 py-4">${pkg.price}</td>
                <td className="px-6 py-4">{pkg.duration}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate">
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
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      pkg.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pkg._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No packages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Package</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Package Name</label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({...editingPackage, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingPackage.description}
                  onChange={(e) => setEditingPackage({...editingPackage, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={editingPackage.price}
                    onChange={(e) => setEditingPackage({...editingPackage, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    value={editingPackage.duration}
                    onChange={(e) => setEditingPackage({...editingPackage, duration: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Features (one per line)</label>
                <textarea
                  value={editingPackage.features}
                  onChange={(e) => setEditingPackage({...editingPackage, features: e.target.value})}
                  rows="4"
                  placeholder="Enter each feature on a new line"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingPackage.image || ''}
                  onChange={(e) => setEditingPackage({...editingPackage, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingPackage.isActive}
                  onChange={(e) => setEditingPackage({...editingPackage, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Package is Active</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPackage(null);
                }}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesTable;