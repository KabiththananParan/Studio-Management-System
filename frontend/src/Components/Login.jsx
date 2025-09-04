import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Email is not valid.';
    }
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Logic for successful login, e.g., API call
      console.log('Login successful!', { email, password });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-10">Welcome Back!</h2>
        

        <div className="flex justify-center mb-6">
          <button className="py-2 px-6 rounded-l-xl text-white bg-blue-600 font-semibold">Sign In</button>
         <Link to="/signUP-form" className="py-2 px-6 rounded-r-xl text-gray-700 bg-gray-200 font-semibold">Sign Up</Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
            <input
              type="text"
              className={`w-full p-3 border rounded-xl ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-medium">Password</label>
              
            </div>

            <input
              type="password"
              className={`w-full p-3 border rounded-xl ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

            <div>
                <Link to="/forgot-password" className="mt-15 text-blue-600 text-sm font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold mb-4 hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        

        <div className="text-center mt-6 text-sm">
          <p className="text-gray-500">Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;