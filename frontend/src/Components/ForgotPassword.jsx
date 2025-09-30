import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PasswordResetForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Step 1: Send reset OTP
  const handleSendOtp = async (e) => {
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

    setLoading(true);
    console.log("Sending OTP to:", email); // Debug log
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      console.log("Response status:", response.status); // Debug log
      const data = await response.json();
      console.log("Response data:", data); // Debug log
      
      // ✅ Check if response is OK (status 200)
      if (response.ok) {
        setMessage("Password reset OTP has been sent to your email.");
        setStep(2); // Move to OTP verification step
        console.log("Moving to step 2"); // Debug log
      } else {
        setError(data.message || "Failed to send reset OTP");
        console.error("Failed response:", data); // Debug log
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResetToken(data.resetToken);
        setMessage("OTP verified successfully!");
        setStep(3); // Move to password reset step
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login-form");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage("New OTP has been sent to your email.");
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-2">Studio Manager</h2>
        <p className="text-gray-500 mb-6">
          {step === 1 && "Reset your password"}
          {step === 2 && "Enter verification code"}
          {step === 3 && "Create new password"}
        </p>

        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 rounded-full p-4">
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

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <p className="text-gray-700 mb-6">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
            <form onSubmit={handleSendOtp}>
              <div className="mb-4 text-left">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                    type="email"
                    id="email"
                    className={`w-full p-3 pl-10 border rounded-xl ${error ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold mb-6 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset OTP"}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <>
            <p className="text-gray-700 mb-6">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-4">
                <input
                  type="text"
                  className={`w-full p-4 text-center text-xl tracking-[1rem] border-2 rounded-xl ${error ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold mb-4 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Back to Email
              </button>
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="text-gray-600 text-sm font-medium hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <p className="text-gray-700 mb-6">
              Enter your new password
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4 text-left">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className={`w-full p-3 border rounded-xl ${error ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="mb-4 text-left">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className={`w-full p-3 border rounded-xl ${error ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold mb-6 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* Error and Success Messages */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        {step === 1 && (
          <Link to="/login-form" className="text-blue-600 text-sm font-medium hover:underline">
            Back to Sign In
          </Link>
        )}

        <div className="text-center mt-6 text-sm">
          <p className="text-gray-500">Need help? <a href="#" className="text-blue-600 hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;