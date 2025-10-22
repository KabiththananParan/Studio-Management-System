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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

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

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    setPhotoError("");
    if (!file) return;

    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      setPhotoError('Only JPG, PNG, or WEBP images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setPhotoError('File is too large. Max 2MB');
      return;
    }

    try {
      setPhotoUploading(true);
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('photo', file);
      const res = await fetch('http://localhost:5000/api/user/profile/photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      // Update user state with returned user (contains profilePhotoUrl)
      if (data?.user) setUser(data.user);
    } catch (err) {
      setPhotoError(err.message || 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

    return (
      <div className="px-2 py-4 sm:p-6 md:p-10 max-w-full sm:max-w-xl md:max-w-2xl mx-auto">
        {/* Glassmorphism Card */}
        <div className="relative bg-white bg-opacity-60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 md:p-10">
          {/* Avatar / Profile Photo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {user?.profilePhotoUrl ? (
                <img
                  src={`http://localhost:5000${user.profilePhotoUrl}`}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover shadow-lg animate-float"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg animate-float flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white select-none">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="absolute bottom-2 right-2 bg-green-400 text-white text-xs px-2 py-1 rounded-full shadow animate-pulse">Active</span>
            </div>
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-center">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">@{user.userName}</p>

            {/* Photo upload control */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <label className="cursor-pointer bg-gray-100 text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-200">
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePhotoChange} />
                {photoUploading ? 'Uploading…' : 'Change Photo'}
              </label>
              {photoError && <span className="text-sm text-red-500">{photoError}</span>}
            </div>
          </div>

          <div className="mb-8 text-center">
            <p className="text-gray-700 text-sm sm:text-base">Manage your profile information and account settings here.</p>
          </div>

          {isEditing ? (
            // Edit Form
            <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl bg-white bg-opacity-80 focus:ring-2 focus:ring-blue-400 transition" />
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl bg-white bg-opacity-80 focus:ring-2 focus:ring-purple-400 transition" />
                <input type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="Username" className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl bg-white bg-opacity-80 focus:ring-2 focus:ring-pink-400 transition" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl bg-white bg-opacity-80 focus:ring-2 focus:ring-green-400 transition" />
              </div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password (optional)" className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl bg-white bg-opacity-80 focus:ring-2 focus:ring-yellow-400 transition" />

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-4">
                <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Cancel</button>
              </div>
            </form>
          ) : (
            // Profile View
            <div className="space-y-4 sm:space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white bg-opacity-70 rounded-xl p-3 sm:p-4 shadow">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">First Name</p>
                  <p className="font-semibold text-base sm:text-lg text-gray-800">{user.firstName}</p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-xl p-3 sm:p-4 shadow">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Last Name</p>
                  <p className="font-semibold text-base sm:text-lg text-gray-800">{user.lastName}</p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-xl p-3 sm:p-4 shadow">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Username</p>
                  <p className="font-semibold text-base sm:text-lg text-gray-800">{user.userName}</p>
                </div>
                <div className="bg-white bg-opacity-70 rounded-xl p-3 sm:p-4 shadow">
                  <p className="text-gray-500 text-xs sm:text-sm mb-1">Email</p>
                  <p className="font-semibold text-base sm:text-lg text-gray-800">{user.email}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6">
                <button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Edit</button>
                <button onClick={handleDelete} className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Delete</button>
              </div>
            </div>
          )}

          {/* Decorative Gradient Circles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 opacity-10 rounded-full translate-y-8 -translate-x-8"></div>

          {/* Custom Animations */}
          <style jsx>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both; }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .animate-float { animation: float 3s ease-in-out infinite; }
          `}</style>
        </div>
      </div>
    );
};

export default ProfileView;
