import { useState } from "react";
import axios from "axios";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // store validation errors

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // no errors → valid
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // stop if invalid

    try {
      const res = await axios.post("http://localhost:5000/api/auth/admin/login", { email, password });

      localStorage.setItem("token", res.data.token);
      window.location.href = "/AdminDashboard";
    } catch (err) {
      alert("Admin login failed. Check credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back Admin!</h2>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <label className="block text-sm mb-1 font-medium">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full mb-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

          <label className="block text-sm mb-1 font-medium">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full mb-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
            }`}
          />
          {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

          <a href="/forgot-password" className="text-blue-600 text-sm block mb-4">
            Forgot password?
          </a>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Need help? <a href="/support" className="text-blue-600">Contact Support</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
