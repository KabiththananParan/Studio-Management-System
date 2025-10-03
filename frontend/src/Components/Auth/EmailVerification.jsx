import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isCountingDown, setIsCountingDown] = useState(true);

  // useEffect hook to manage the countdown timer
  useEffect(() => {
    if (!isCountingDown) return;

    const timer = setInterval(() => {
      setResendCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setIsCountingDown(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountingDown]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOtp(value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: location.state?.email, otp }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      navigate("/userDashboard");
    } else {
      setError(data.message || "Invalid OTP");
    }
  };

  const handleResend = () => {
    if (isCountingDown) return;

    console.log('Resending OTP...');
    setResendCountdown(60);
    setIsCountingDown(true);
    alert("A new OTP has been sent to your email.");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white p-4 flex justify-between items-center shadow-md">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl text-blue-600">StudioPro</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/signUP-form" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign Up
          </Link>
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
        </div>
      </nav>

      {/* Verification Form Container */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16 pb-8 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
        <p className="text-gray-600 mb-6">
          A 6-digit verification code has been sent to your email address. Please check your inbox and spam folder.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="sr-only">Enter Code</label>
            <input
              type="text"
              id="otp"
              name="otp"
              className={`w-full p-4 text-center text-xl tracking-[1rem] border-2 rounded-xl transition duration-200 ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'}`}
              maxLength="6"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              autoComplete="off"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Verify Account
          </button>
        </form>

        <div className="mt-6 text-gray-600">
          {isCountingDown ? (
            <p>Resend code in {resendCountdown} seconds</p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 font-semibold hover:underline"
            >
              Resend Code
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;