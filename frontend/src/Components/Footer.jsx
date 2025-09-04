import React from 'react';
// Make sure to install react-icons if you haven't already: npm install react-icons
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa'; 
import { Link } from 'react-router';

const Footer = () => {
    return (
        <div>
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
              <li><Link to="/FAQ" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
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
    )
}

export default Footer;