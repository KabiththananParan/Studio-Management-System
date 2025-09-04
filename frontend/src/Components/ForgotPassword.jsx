import React, { useState } from 'react';
import { Link } from 'react-router';

const PasswordResetForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Simulate sending reset link
    console.log('Sending reset link to:', email);
    setMessage('If an account with that email exists, a password reset link has been sent.');
    // In a real application, you would make an API call here
    // e.g., axios.post('/api/reset-password', { email })
    //   .then(response => setMessage('...'))
    //   .catch(err => setError('...'));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-2">Studio Manager</h2>
        <p className="text-gray-500 mb-6">Reset your password</p>

        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-4">
            {/* Padlock Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-left">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* Email Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 4v4a2 2 0 002 2h14a2 2 0 002-2v-4"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="email"
                className={`w-full p-3 pl-10 border rounded-xl ${error ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {message && <p className="text-green-600 text-xs mt-1">{message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold mb-6 hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>

        <Link to="/login-form" className="text-blue-600 text-sm font-medium hover:underline">
          Back to Sign In
        </Link>

        <div className="text-center mt-6 text-sm">
          <p className="text-gray-500">Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;