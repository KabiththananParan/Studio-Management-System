import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUpForm = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

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
    if (!formData.firstName) {
      tempErrors.firstName = 'First Name is required.';
    }
    if (!formData.lastName) {
      tempErrors.lastName = 'Last Name is required.';
    }
    if (!formData.email) {
      tempErrors.email = 'Email Address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email Address is not valid.';
    }
    if (!formData.userName) {
      tempErrors.userName = 'User Name is required.';
    }
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
                const response = await fetch("http://localhost:5000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                    const data = await response.json();
                    if (response.ok) {
                    navigate('/emailVerification', { state: { email: formData.email } });
                    } else {
                    alert(data.message || "Something went wrong");
                    }


    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-7">Create your account</h1>

        <div className="flex justify-center mb-6">
          <Link to="/login-form" className="py-2 px-6 rounded-l-xl text-gray-700 bg-gray-200 font-semibold text-center">Sign In</Link>
          <button className="py-2 px-6 rounded-r-xl text-white bg-blue-600 font-semibold">Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`w-full p-3 border rounded-xl ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
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
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full p-3 border rounded-xl ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="studioName">User Name</label>
            <input
              type="text"
              id="studioName"
              name="userName"
              className={`w-full p-3 border rounded-xl ${errors.userName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Your User Name"
              value={formData.userName}
              onChange={handleChange}
            />
            {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
          </div>

          <div className="mb-4 relative">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">Password</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                className={`w-full p-3 border rounded-xl ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              {/* Eye icon for showing/hiding password can be added here */}
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="mb-4 relative">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`w-full p-3 border rounded-xl ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {/* Eye icon for showing/hiding password can be added here */}
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="mb-6 flex items-start">
            <input
              type="checkbox"
              id="agreedToTerms"
              name="agreedToTerms"
              className="mr-2 mt-1"
              checked={formData.agreedToTerms}
              onChange={handleChange}
            />
            <label className="text-sm text-gray-700" htmlFor="agreedToTerms">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
          {errors.agreedToTerms && <p className="text-red-500 text-xs mb-4">{errors.agreedToTerms}</p>}

          {/* The button's type is "submit" and it is inside the form tag. */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold mb-4 hover:bg-blue-700 transition">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;