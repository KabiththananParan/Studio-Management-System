import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUpForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userName: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName) tempErrors.firstName = 'First Name is required.';
    if (!formData.lastName) tempErrors.lastName = 'Last Name is required.';
    if (!formData.email) {
      tempErrors.email = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email Address is not valid.';
    }
    if (!formData.userName) tempErrors.userName = 'User Name is required.';
    if (!formData.password) {
      tempErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.agreedToTerms) {
      tempErrors.agreedToTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const { confirmPassword, agreedToTerms, ...dataToSend } = formData;
        
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });

        const data = await response.json();
        if (response.ok) {
          // Redirect to email verification instead of directly to login
          navigate('/emailVerification', { 
            state: { 
              email: formData.email,
              message: "Account created successfully! Please check your email for verification code."
            } 
          });
        } else {
          setErrors({ form: data.message || "Something went wrong" });
        }
      } catch (error) {
        setErrors({ form: "Network error. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-white">StudioPro</span>
          </Link>
          <Link 
            to="/" 
            className="text-white/80 hover:text-white transition-colors flex items-center px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-screen pt-24 pb-8 px-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/70">Join StudioPro to book amazing photo sessions</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex mb-8 bg-white/10 rounded-xl p-1">
            <Link 
              to="/login-form" 
              className="flex-1 py-3 px-4 rounded-lg text-white/70 hover:text-white hover:bg-white/10 font-semibold text-sm text-center transition-all duration-200"
            >
              Sign In
            </Link>
            <button className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm shadow-lg transition-all duration-200">
              Sign Up
            </button>
          </div>

          {/* Display form errors */}
          {errors.form && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-red-200 text-sm text-center">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.firstName 
                      ? "border-red-400 focus:ring-red-400/50" 
                      : "border-white/30 focus:ring-blue-400/50 focus:border-blue-400/50"
                  }`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className="text-red-300 text-sm mt-2">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.lastName 
                      ? "border-red-400 focus:ring-red-400/50" 
                      : "border-white/30 focus:ring-blue-400/50 focus:border-blue-400/50"
                  }`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="text-red-300 text-sm mt-2">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.email 
                    ? "border-red-400 focus:ring-red-400/50" 
                    : "border-white/30 focus:ring-blue-400/50 focus:border-blue-400/50"
                }`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-300 text-sm mt-2">{errors.email}</p>}
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Username
              </label>
              <input
                type="text"
                name="userName"
                className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.userName 
                    ? "border-red-400 focus:ring-red-400/50" 
                    : "border-white/30 focus:ring-blue-400/50 focus:border-blue-400/50"
                }`}
                placeholder="Your unique username"
                value={formData.userName}
                onChange={handleChange}
              />
              {errors.userName && <p className="text-red-300 text-sm mt-2">{errors.userName}</p>}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password 
                      ? "border-red-400 focus:ring-red-400/50" 
                      : "border-white/30 focus:ring-blue-400/50 focus:border-blue-400/50"
                  }`}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="text-red-300 text-sm mt-2">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={`w-full px-4 py-3 bg-white/10 border backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.confirmPassword 
                      ? "border-red-400 focus:ring-red-400/50" 
                      : "border-white/30 focus:ring-blue-400/50 focus:border-blue-400/50"
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="text-red-300 text-sm mt-2">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreedToTerms"
                className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                checked={formData.agreedToTerms}
                onChange={handleChange}
              />
              <label className="text-sm text-white/80 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-blue-300 hover:text-blue-200 underline transition-colors duration-200">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-300 hover:text-blue-200 underline transition-colors duration-200">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreedToTerms && <p className="text-red-300 text-sm">{errors.agreedToTerms}</p>}

            {/* Create Account Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400/50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login-form" 
                className="text-white/80 hover:text-white transition-colors duration-200 underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;