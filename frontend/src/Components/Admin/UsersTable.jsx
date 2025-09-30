import React, { useEffect, useState } from "react";
import axios from "axios";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    isVerified: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const validateForm = (data, isEdit = false) => {
    const errors = {};
    
    // First Name validation
    if (!data.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!data.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Username validation
    if (!data.userName.trim()) {
      errors.userName = "Username is required";
    } else if (data.userName.trim().length < 3) {
      errors.userName = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.userName.trim())) {
      errors.userName = "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(data.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation (only for new users or when password is provided)
    if (!isEdit || data.password) {
      if (!data.password) {
        errors.password = "Password is required";
      } else if (data.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      // Confirm password validation
      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    return errors;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isVerified: false
    });
    setFormErrors({});
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      setUsers(res.data);
      setError("");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch users. Please try again.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  // Add new user
  const handleAddUser = async () => {
    const errors = validateForm(formData, false);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        isVerified: formData.isVerified
      };

      const res = await axios.post(
        "http://localhost:5000/api/admin/users",
        userData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      setUsers([...users, res.data]);
      setShowAddModal(false);
      resetForm();
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else if (err.response?.status === 400) {
        // Handle validation errors from backend
        const backendError = err.response.data.message;
        if (backendError.includes("email")) {
          setFormErrors({ email: "Email already exists" });
        } else if (backendError.includes("userName")) {
          setFormErrors({ userName: "Username already exists" });
        } else {
          setFormErrors({ general: backendError });
        }
      } else {
        setFormErrors({ general: err.response?.data?.message || "Failed to add user" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      password: "",
      confirmPassword: "",
      isVerified: user.isVerified
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Update user
  const handleUpdateUser = async () => {
    const errors = validateForm(formData, true);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim(),
        email: formData.email.trim().toLowerCase(),
        isVerified: formData.isVerified
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
      }

      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${editingUser._id}`,
        userData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      setUsers(users.map((u) => (u._id === editingUser._id ? res.data : u)));
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else if (err.response?.status === 400) {
        const backendError = err.response.data.message;
        if (backendError.includes("email")) {
          setFormErrors({ email: "Email already exists" });
        } else if (backendError.includes("userName")) {
          setFormErrors({ userName: "Username already exists" });
        } else {
          setFormErrors({ general: backendError });
        }
      } else {
        setFormErrors({ general: err.response?.data?.message || "Failed to update user" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading users...</p>;
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
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center"
        >
          <span className="mr-2">+</span>
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.userName}</td>
                <td className="px-6 py-4">
                  {user.isVerified ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.userName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="johndoe123"
                />
                {formErrors.userName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.userName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isVerified" className="text-sm font-medium">Mark as Verified</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <span className="text-sm text-gray-500">ID: {editingUser._id}</span>
            </div>

            {/* Current User Info Display */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Current User Information:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{editingUser.firstName} {editingUser.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Username:</span>
                  <span className="ml-2 font-medium">{editingUser.userName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{editingUser.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    editingUser.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {editingUser.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Joined:</span>
                  <span className="ml-2 font-medium">{new Date(editingUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Updated:</span>
                  <span className="ml-2 font-medium">{new Date(editingUser.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> The form below is pre-filled with current values. 
                Modify any field you want to change, or leave it as-is to keep the current value. 
                For password, leave both fields empty to keep the current password.
              </p>
            </div>
            
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 mb-3">Modify User Details:</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name * 
                    <span className="text-xs text-gray-500 font-normal">
                      (Current: {editingUser.firstName})
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.firstName ? 'border-red-500' : 
                        formData.firstName !== editingUser.firstName ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      placeholder={`Current: ${editingUser.firstName}`}
                    />
                    {formData.firstName !== editingUser.firstName && (
                      <span className="absolute right-2 top-2 text-blue-500 text-xs font-medium">CHANGED</span>
                    )}
                  </div>
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name *
                    <span className="text-xs text-gray-500 font-normal">
                      (Current: {editingUser.lastName})
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.lastName ? 'border-red-500' : 
                        formData.lastName !== editingUser.lastName ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      placeholder={`Current: ${editingUser.lastName}`}
                    />
                    {formData.lastName !== editingUser.lastName && (
                      <span className="absolute right-2 top-2 text-blue-500 text-xs font-medium">CHANGED</span>
                    )}
                  </div>
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Username *
                  <span className="text-xs text-gray-500 font-normal">
                    (Current: {editingUser.userName})
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.userName ? 'border-red-500' : 
                      formData.userName !== editingUser.userName ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    placeholder={`Current: ${editingUser.userName}`}
                  />
                  {formData.userName !== editingUser.userName && (
                    <span className="absolute right-2 top-2 text-blue-500 text-xs font-medium">CHANGED</span>
                  )}
                </div>
                {formErrors.userName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.userName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address *
                  <span className="text-xs text-gray-500 font-normal">
                    (Current: {editingUser.email})
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-500' : 
                      formData.email !== editingUser.email ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    placeholder={`Current: ${editingUser.email}`}
                  />
                  {formData.email !== editingUser.email && (
                    <span className="absolute right-2 top-2 text-blue-500 text-xs font-medium">CHANGED</span>
                  )}
                </div>
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h5 className="font-medium text-yellow-800 mb-2">Password Update (Optional)</h5>
                <p className="text-sm text-yellow-700 mb-3">
                  Leave both password fields empty to keep the current password unchanged.
                  Fill both fields only if you want to change the password.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-yellow-800">New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                          formErrors.password ? 'border-red-500' : 
                          formData.password ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                        }`}
                        placeholder="Leave empty to keep current"
                      />
                      {formData.password && (
                        <span className="absolute right-2 top-2 text-yellow-600 text-xs font-medium">NEW</span>
                      )}
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-yellow-800">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                          formErrors.confirmPassword ? 'border-red-500' : 
                          formData.confirmPassword ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                      />
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <span className="absolute right-2 top-2 text-green-600 text-xs font-medium">✓</span>
                      )}
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <label htmlFor="editIsVerified" className="text-sm font-medium">User Verification Status</label>
                  <p className="text-xs text-gray-600">
                    Current status: <span className={`font-medium ${editingUser.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {editingUser.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsVerified"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                    className="mr-2 h-4 w-4"
                  />
                  <span className={`text-sm font-medium ${
                    formData.isVerified !== editingUser.isVerified ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {formData.isVerified ? 'Verified' : 'Unverified'}
                    {formData.isVerified !== editingUser.isVerified && ' (CHANGED)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary of Changes */}
            {(formData.firstName !== editingUser.firstName || 
              formData.lastName !== editingUser.lastName || 
              formData.userName !== editingUser.userName || 
              formData.email !== editingUser.email || 
              formData.password || 
              formData.isVerified !== editingUser.isVerified) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Summary of Changes:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  {formData.firstName !== editingUser.firstName && (
                    <li>• First Name: "{editingUser.firstName}" → "{formData.firstName}"</li>
                  )}
                  {formData.lastName !== editingUser.lastName && (
                    <li>• Last Name: "{editingUser.lastName}" → "{formData.lastName}"</li>
                  )}
                  {formData.userName !== editingUser.userName && (
                    <li>• Username: "{editingUser.userName}" → "{formData.userName}"</li>
                  )}
                  {formData.email !== editingUser.email && (
                    <li>• Email: "{editingUser.email}" → "{formData.email}"</li>
                  )}
                  {formData.password && (
                    <li>• Password: Will be updated to new password</li>
                  )}
                  {formData.isVerified !== editingUser.isVerified && (
                    <li>• Verification: {editingUser.isVerified ? 'Verified' : 'Unverified'} → {formData.isVerified ? 'Verified' : 'Unverified'}</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setFormData({
                    firstName: editingUser.firstName,
                    lastName: editingUser.lastName,
                    userName: editingUser.userName,
                    email: editingUser.email,
                    password: "",
                    confirmPassword: "",
                    isVerified: editingUser.isVerified
                  });
                  setFormErrors({});
                }}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                disabled={isSubmitting}
              >
                🔄 Reset to Original
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      💾 Update User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
