import React, { useState, useEffect } from "react";

const ProfileView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
  });

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/user/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            userName: data.userName,
            email: data.email,
            password: "",
          });
        } else {
          setError(data.message || "Failed to fetch profile");
        }
      } catch (err) {
        setError("Server error, try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
        setIsEditing(false);
        alert("Profile updated successfully ✅");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert("Server error while updating profile");
    }
  };

  // ✅ Delete account
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/user/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        alert("Account deleted successfully ❌");
        localStorage.removeItem("token");
        window.location.href = "/login-form"; // redirect to login
      } else {
        alert(data.message || "Failed to delete account");
      }
    } catch (err) {
      alert("Server error while deleting account");
    }
  };

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
      <p className="mt-2 text-gray-600">Manage your profile information and account settings here.</p>

      {isEditing ? (
        // ✅ Edit Form
        <form onSubmit={handleUpdate} className="mt-6 bg-white shadow p-6 rounded-2xl space-y-4 border border-gray-200">
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full p-2 border rounded-lg" />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full p-2 border rounded-lg" />
          <input type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded-lg" />
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded-lg" />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password (optional)" className="w-full p-2 border rounded-lg" />

          <div className="flex space-x-4">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      ) : (
        // ✅ Profile View
        <div className="mt-6 bg-white shadow p-6 rounded-2xl space-y-4 border border-gray-200">
          <p><span className="text-gray-600 text-sm">First Name:</span> {user.firstName}</p>
          <p><span className="text-gray-600 text-sm">Last Name:</span> {user.lastName}</p>
          <p><span className="text-gray-600 text-sm">Username:</span> {user.userName}</p>
          <p><span className="text-gray-600 text-sm">Email:</span> {user.email}</p>

          <div className="flex space-x-4 mt-4">
            <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Edit</button>
            <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
