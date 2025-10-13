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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white p-4 flex justify-between items-center shadow-md">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl text-blue-600">StudioPro</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16 pb-8 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center mb-7">Create your account</h1>        
          
          <div className="flex justify-center mb-6">
            <Link to="/login-form" className="py-2 px-6 rounded-l-xl text-gray-700 bg-gray-200 font-semibold text-center">Sign In</Link>
            <button className="py-2 px-6 rounded-r-xl text-white bg-blue-600 font-semibold">Sign Up</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className={`w-full p-3 border rounded-xl ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className={`w-full p-3 border rounded-xl ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                className={`w-full p-3 border rounded-xl ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">User Name</label>
              <input
                type="text"
                name="userName"
                className={`w-full p-3 border rounded-xl ${errors.userName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Your User Name"
                value={formData.userName}
                onChange={handleChange}
              />
              {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                className={`w-full p-3 border rounded-xl ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={`w-full p-3 border rounded-xl ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="mb-6 flex items-start">
              <input
                type="checkbox"
                name="agreedToTerms"
                className="mr-2 mt-1"
                checked={formData.agreedToTerms}
                onChange={handleChange}
              />
              <label className="text-sm text-gray-700">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.agreedToTerms && <p className="text-red-500 text-xs mb-4">{errors.agreedToTerms}</p>}
            
            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">{errors.form}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold mb-4 hover:bg-blue-700 transition"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;