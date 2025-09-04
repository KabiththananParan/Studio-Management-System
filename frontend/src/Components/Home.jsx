import React from 'react';
import { BsCalendar2CheckFill, BsFillPersonLinesFill, BsFolderFill, BsGraphUp, BsCashStack, BsGridFill } from 'react-icons/bs';
import { Link } from 'react-router';
import Footer from './Footer';

// This is a simple reusable component for a feature card
const FeatureCard = ({ icon, title, description, bgColor }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-start text-left">
      <div className={`p-3 rounded-lg ${bgColor} mb-4 text-white`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// This is a simple reusable component for a stat card
const StatCard = ({ number, label }) => {
  return (
    <div className="text-center p-4">
      <h3 className="text-4xl md:text-5xl font-bold mb-2">{number}</h3>
      <p className="text-lg">{label}</p>
    </div>
  );
};

// This is a simple reusable component for a testimonial card
const TestimonialCard = ({ initials, name, title, quote, bgColor }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 ${bgColor}`}>
        {initials}
      </div>
      <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
      <p className="text-sm text-gray-500 mb-4">{title}</p>
      <p className="italic text-gray-700">"{quote}"</p>
    </div>
  );
};

const Home = () => {
  return (
    <div className="font-sans">
      {/* Navbar Section */}
      <nav className="bg-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl text-blue-600">StudioPro</span>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
          <Link to="/login-form" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen bg-cover bg-center" style={{ backgroundImage: "url('../src/assets/studio.jpg')" }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative flex flex-col items-center justify-center h-full text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Manage Your Studio Like a Pro</h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            Streamline your creative workflow with our comprehensive studio management platform. Handle bookings, clients, projects, and finances all in one place.
          </p>
          <Link to="/login-form" className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Everything You Need to Run Your Studio</h2>
          <p className="text-lg text-gray-600 mb-12">Powerful features designed specifically for creative professionals and studio owners</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BsCalendar2CheckFill size={24} />}
              title="Smart Scheduling"
              description="Automated booking system with calendar integration, conflict detection, and client notifications."
              bgColor="bg-blue-500"
            />
            <FeatureCard
              icon={<BsFillPersonLinesFill size={24} />}
              title="Client Management"
              description="Comprehensive client profiles, communication history, and project tracking in one place."
              bgColor="bg-green-500"
            />
            <FeatureCard
              icon={<BsFolderFill size={24} />}
              title="Project Tracking"
              description="Monitor project progress, deadlines, and deliverables with visual timeline management."
              bgColor="bg-purple-500"
            />
            <FeatureCard
              icon={<BsCashStack size={24} />}
              title="Financial Management"
              description="Invoice generation, payment tracking, expense management, and financial reporting."
              bgColor="bg-yellow-500"
            />
            <FeatureCard
              icon={<BsGridFill size={24} />}
              title="Asset Management"
              description="Organize and share creative assets, maintain equipment inventory, and track usage."
              bgColor="bg-red-500"
            />
            <FeatureCard
              icon={<BsGraphUp size={24} />}
              title="Analytics & Reports"
              description="Detailed insights into studio performance, revenue trends, and client satisfaction."
              bgColor="bg-teal-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard number="2,500+" label="Studios Managed" />
          <StatCard number="50,000+" label="Bookings Processed" />
          <StatCard number="98%" label="Client Satisfaction" />
          <StatCard number="24/7" label="Support Available" />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Trusted by Creative Professionals</h2>
          <p className="text-lg text-gray-600 mb-12">See what studio owners are saying about StudioPro</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              initials="SC"
              name="Sarah Chen"
              title="Photography Studio Owner"
              quote="StudioPro transformed how I manage my photography business. The booking system is a game-changer."
              bgColor="bg-blue-600"
            />
            <TestimonialCard
              initials="MR"
              name="Mike Rodriguez"
              title="Recording Studio Manager"
              quote="The financial tracking features helped us increase our revenue by 30% in just six months. Highly recommended."
              bgColor="bg-green-600"
            />
            <TestimonialCard
              initials="EB"
              name="Emma Brown"
              title="Art Studio Director"
              quote="Client management has never been easier. My team loves the intuitive interface and powerful features."
              bgColor="bg-purple-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Studio?</h2>
          <p className="text-lg mb-8">Join thousands of creative professionals who trust StudioPro to manage their business</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors">
            Get Started
          </button>
        </div>
      </section>

    <Footer />

    </div>
  );
};

export default Home;