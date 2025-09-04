import React from 'react';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import Footer from './Footer';

const blogPosts = [
  {
    id: 1,
    title: "Mastering Light in Photography",
    excerpt: "Learn the secrets to controlling natural and artificial light to create stunning photographs. Tips and tricks for every skill level.",
    imageUrl: "https://images.unsplash.com/photo-1510127034255-fd7ba53e7616?q=80&w=2670&auto=format&fit=crop",
    author: "Alex Liu",
    date: "July 25, 2024",
    link: "#"
  },
  {
    id: 2,
    title: "The Art of Branding for Creatives",
    excerpt: "Building a strong brand identity is crucial for creative businesses. Discover how to define your brand and attract your ideal clients.",
    imageUrl: "https://images.unsplash.com/photo-1549673960-ec24d85ac946?q=80&w=2670&auto=format&fit=crop",
    author: "Jordan Smith",
    date: "July 20, 2024",
    link: "#"
  },
  {
    id: 3,
    title: "Essential Tools for Digital Artists",
    excerpt: "From software to hardware, we cover the must-have tools that can elevate your digital art to the next level.",
    imageUrl: "https://images.unsplash.com/photo-1550005809-b73377788b6a?q=80&w=2670&auto=format&fit=crop",
    author: "Maya Thompson",
    date: "July 15, 2024",
    link: "#"
  },
  {
    id: 4,
    title: "Client Management Strategies for Freelancers",
    excerpt: "Effective client communication and management are key to a thriving freelance career. Learn our best strategies.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
    author: "Alex Liu",
    date: "July 10, 2024",
    link: "#"
  },
  {
    id: 5,
    title: "Boosting Your Creative Productivity",
    excerpt: "Struggling with creative blocks? These proven techniques will help you stay inspired and productive every day.",
    imageUrl: "https://images.unsplash.com/photo-1531297484607-07455b550e2e?q=80&w=2670&auto=format&fit=crop",
    author: "Jordan Smith",
    date: "July 5, 2024",
    link: "#"
  },
  {
    id: 6,
    title: "Designing User-Friendly Portfolios",
    excerpt: "Your portfolio is your online storefront. We'll show you how to design one that truly showcases your best work.",
    imageUrl: "https://images.unsplash.com/photo-1521737711867-0064d37c8657?q=80&w=2670&auto=format&fit=crop",
    author: "Maya Thompson",
    date: "July 1, 2024",
    link: "#"
  },
];

const Blog = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-600">StudioPro</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600">Features</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">About</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Contact</a>
        </nav>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300">
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Our Latest Insights</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600">
          Stay updated with articles, tips, and inspiration for creative professionals.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center text-gray-500 text-xs mb-4">
                  <FaUser className="mr-2" /> {post.author}
                  <FaCalendarAlt className="ml-4 mr-2" /> {post.date}
                </div>
                <a href={post.link} className="text-blue-600 font-semibold hover:underline">Read More &rarr;</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 py-20 px-4 text-center text-white">
        <h2 className="text-4xl font-extrabold mb-4">Never Miss an Update</h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto">
          Subscribe to our newsletter for the latest articles and exclusive tips delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-80 px-5 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition duration-300">
            Subscribe
          </button>
        </div>
      </section>

      <Footer />
      
    </div>
  );
};

export default Blog;