import React from 'react';
import { FaCalendarAlt, FaTasks, FaUsers, FaChartBar, FaCloudUploadAlt, FaCreditCard } from 'react-icons/fa';
import Footer from './Footer';

const Features = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-600">StudioPro</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600">Features</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">About</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
        </nav>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300">
          Get Started
        </button>
      </header>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Powerful Features for Creative Pros</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600">
          Discover how StudioPro streamlines your workflow, automates tasks, and helps you grow your creative business.
        </p>
      </div>

      {/* Features Grid Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 text-center">
          {/* Feature 1: Booking & Scheduling */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
              <FaCalendarAlt className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Booking & Scheduling</h3>
            <p className="text-gray-600">
              Easily manage client appointments, view your availability, and send automated reminders to reduce no-shows.
            </p>
          </div>

          {/* Feature 2: Project Management */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
              <FaTasks className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Project Management</h3>
            <p className="text-gray-600">
              Track projects from start to finish. Assign tasks, set deadlines, and collaborate seamlessly with your team.
            </p>
          </div>

          {/* Feature 3: Client Communication */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-4 bg-purple-100 text-purple-600 rounded-full mb-4">
              <FaUsers className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Client Communication</h3>
            <p className="text-gray-600">
              Centralize all client interactions in one place. Send messages, share files, and get approvals instantly.
            </p>
          </div>

          {/* Feature 4: Financial Reporting */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
              <FaChartBar className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Financial Reporting</h3>
            <p className="text-gray-600">
              Monitor your studio's health with detailed reports on revenue, expenses, and profitability.
            </p>
          </div>

          {/* Feature 5: Secure File Sharing */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full mb-4">
              <FaCloudUploadAlt className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure File Sharing</h3>
            <p className="text-gray-600">
              Share large files with clients and collaborators securely. Get comments and feedback directly on the files.
            </p>
          </div>

          {/* Feature 6: Invoicing & Payments */}
          <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full mb-4">
              <FaCreditCard className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Invoicing & Payments</h3>
            <p className="text-gray-600">
              Create professional invoices, send payment links, and accept online payments directly through the platform.
            </p>
          </div>
        </div>
      </section>

      

      <Footer />

    </div>
  );
};

export default Features;