import React from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router';
import Footer from './Footer';

const Contact = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-600">StudioPro</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600">Features</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">About</a>
          <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600">Contact</a>
        </nav>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300">
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Get in Touch</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600">
          We'd love to hear from you. Fill out the form below or reach out to us using the contact details.
        </p>
      </div>

      {/* Contact Form & Information Section */}
      <section className="container mx-auto py-16 px-4 md:flex md:space-x-12">
        {/* Contact Form */}
        <div className="md:w-2/3 mb-10 md:mb-0 p-8 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a message</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea 
                id="message" 
                name="message" 
                rows="4" 
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="md:w-1/3 p-8 bg-blue-600 text-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6">Contact Info</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <FaMapMarkerAlt className="text-2xl mt-1" />
              <div>
                <h3 className="text-xl font-semibold">Address</h3>
                <p>123 Creative Street, Studio City, CA 90210</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaEnvelope className="text-2xl mt-1" />
              <div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p>support@studiopro.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaPhone className="text-2xl mt-1" />
              <div>
                <h3 className="text-xl font-semibold">Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default Contact;