import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EmailVerification = () => {
  // State for the OTP input field and any validation errors
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  // State for the resend countdown timer
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isCountingDown, setIsCountingDown] = useState(true);

  // useEffect hook to manage the countdown timer
  useEffect(() => {
    // Exit if the countdown is not active
    if (!isCountingDown) return;

    // Set up a timer that decrements the countdown every second
    const timer = setInterval(() => {
      setResendCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          // If the countdown reaches zero, clear the timer and allow resend
          clearInterval(timer);
          setIsCountingDown(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    // Clean up the timer when the component unmounts or the countdown finishes
    return () => clearInterval(timer);
  }, [isCountingDown]);

  // Handle changes to the OTP input field
  const handleOtpChange = (e) => {
    // Only allow digits in the input
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOtp(value);
    // Clear the error message when the user starts typing
    if (error) {
      setError('');
    }
  };

  // Handle the verification form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simple client-side validation for a 6-digit OTP
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

  // Handle the resend OTP action
  const handleResend = () => {
    // Prevent resend if the countdown is still active
    if (isCountingDown) return;

    // In a real application, you would make an API call to resend the OTP to the user's email
    console.log('Resending OTP...');
    
    // Reset the countdown to start the timer again
    setResendCountdown(60);
    setIsCountingDown(true);
    alert("A new OTP has been sent to your email.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
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
  );
};

export default EmailVerification;
