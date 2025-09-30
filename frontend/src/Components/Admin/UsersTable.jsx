import React, { useEffect, useState } from "react";
import axios from "axios";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    // Try different endpoints to find the correct one
    const endpoints = [
      "http://localhost:5000/api/admin/users",
      "http://localhost:5000/api/users",
      "http://localhost:5000/api/admin/dashboard", // Test if admin routes work at all
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying: ${endpoint}`);
        const res = await axios.get(endpoint, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        console.log(`Success with: ${endpoint}`, res.data);
        if (endpoint.includes('/users')) {
          setUsers(res.data);
        } else {
          console.log("Admin access confirmed, but wrong endpoint");
        }
        setError("");
        setLoading(false);
        return;
      } catch (err) {
        console.log(`Failed: ${endpoint}`, err.response?.status, err.response?.data?.message);
      }
    }
    
    setError("Could not fetch users from any endpoint. Check backend setup.");
    setLoading(false);
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
        localStorage.removeToken("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  // Simple edit handler
  const handleEdit = async (id) => {
    const firstName = prompt("Enter new first name:");
    if (!firstName) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${id}`,
        { firstName },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      setUsers(users.map((u) => (u._id === id ? res.data : u)));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setError("Session expired. Please log in again.");
      } else {
        alert(err.response?.data?.message || "Failed to update user");
      }
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
      <h1 className="text-2xl font-bold mb-4">Users</h1>
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
                    onClick={() => handleEdit(user._id)}
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
    </div>
  );
};

export default UsersTable;
