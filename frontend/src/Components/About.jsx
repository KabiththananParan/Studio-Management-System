import React from 'react';
import { FaLightbulb, FaLeaf, FaShieldAlt } from 'react-icons/fa';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const About = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-600">StudioPro</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600">Features</a>
          <a href="#" className="text-blue-600 font-semibold border-b-2 border-blue-600">About</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
        </nav>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300">
          Get Started
        </button>
      </header>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">About StudioPro</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600">
          We're passionate about empowering creative professionals with the tools they need to
          focus on what they do best - creating amazing work.
        </p>
      </div>

      {/* Our Mission Section */}
      <section className="container mx-auto py-16 px-4 md:flex md:items-center md:space-x-12">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            StudioPro was born from the frustration of managing creative businesses with scattered tools and endless paperwork. We believe that artists, photographers, designers, and other creative professionals should spend their time creating, not managing spreadsheets.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our platform brings together everything you need to run your creative studio – from booking management to client communication, project tracking to financial reporting – all in one intuitive interface.
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop"
            alt="A group of creative professionals in a meeting"
            className="rounded-lg shadow-lg w-full"
          />
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-gray-50 py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Values</h2>
        <p className="text-gray-600 mb-12">The principles that guide everything we do</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Simplicity */}
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
              <FaLightbulb className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simplicity</h3>
            <p className="text-gray-600 max-w-sm">
              We believe powerful tools should be easy to use. Our interface is designed to be intuitive and clutter-free.
            </p>
          </div>
          {/* Creativity First */}
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-full bg-green-100 text-green-600 mb-4">
              <FaLeaf className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Creativity First</h3>
            <p className="text-gray-600 max-w-sm">
              Every feature is designed with creative professionals in mind, understanding their unique workflow and needs.
            </p>
          </div>
          {/* Reliability */}
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-full bg-purple-100 text-purple-600 mb-4">
              <FaShieldAlt className="text-3xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Reliability</h3>
            <p className="text-gray-600 max-w-sm">
              Your business depends on us, and we take that responsibility seriously with 99.9% uptime and robust security.
            </p>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Meet Our Team</h2>
        <p className="text-gray-600 mb-12">The people behind StudioPro</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Alex Liu */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold mb-4">
              AL
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Alex Liu</h3>
            <p className="text-blue-600 mb-2">CEO & Founder</p>
            <p className="text-gray-600 text-sm max-w-sm">
              Former creative director with 10+ years of studio management experience
            </p>
          </div>
          {/* Jordan Smith */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-green-600 text-white flex items-center justify-center text-4xl font-bold mb-4">
              JS
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Jordan Smith</h3>
            <p className="text-green-600 mb-2">Head of Product</p>
            <p className="text-gray-600 text-sm max-w-sm">
              Product designer passionate about creating intuitive user experiences
            </p>
          </div>
          {/* Maya Thompson */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-4xl font-bold mb-4">
              MT
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Maya Thompson</h3>
            <p className="text-purple-600 mb-2">Lead Developer</p>
            <p className="text-gray-600 text-sm max-w-sm">
              Full-stack engineer focused on building scalable, reliable solutions
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 py-20 px-4 text-center text-white">
        <h2 className="text-4xl font-extrabold mb-4">Ready to Join Our Community?</h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto">
          Discover why thousands of creative professionals trust StudioPro
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition duration-300">
          Get Started Today
        </button>
      </section>

      {/* Footer Section */}
            <footer className="bg-gray-900 text-gray-400 py-12">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About Section */}
                <div className="flex flex-col space-y-4">
                  <div className="text-white font-bold text-xl">StudioPro</div>
                  <p className="text-sm">
                    The complete studio management solution for creative professionals.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="hover:text-white transition-colors"><FaFacebookF /></a>
                    <a href="#" className="hover:text-white transition-colors"><FaTwitter /></a>
                    <a href="#" className="hover:text-white transition-colors"><FaInstagram /></a>
                    <a href="#" className="hover:text-white transition-colors"><FaLinkedinIn /></a>
                  </div>
                </div>
      
                {/* Product Links */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Product</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  </ul>
                </div>
      
                {/* Company Links */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Company</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  </ul>
                </div>
      
                {/* Support Links */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Support</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                  </ul>
                </div>
              </div>
            </footer>

    </div>
  );
};

export default About;