import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import Footer from './Footer';

// A single component for an FAQ item to make the code cleaner and reusable
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-lg hover:text-blue-600 transition-colors duration-200"
      >
        <span>{question}</span>
        {isOpen ? <FaMinus className="text-gray-500" /> : <FaPlus className="text-gray-500" />}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  // Define your FAQ data here
  const faqData = [
    {
      question: "What is StudioPro?",
      answer: "StudioPro is an all-in-one studio management software designed for creative professionals like photographers, artists, and designers. It helps you manage bookings, projects, clients, and finances in one place."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial with no credit card required. You can access all our features during this period to see if StudioPro is the right fit for your business."
    },
    {
      question: "What pricing plans do you offer?",
      answer: "We have several pricing tiers, including a Starter plan for individuals and a Pro plan for growing teams. All plans include access to our core features, with higher tiers offering more advanced tools and storage."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, data security is our top priority. We use industry-standard encryption and follow strict security protocols to ensure your data is always safe and protected."
    },
    {
      question: "How can I get support?",
      answer: "Our support team is available via email and live chat. You can also find comprehensive guides and tutorials in our help center to answer most of your questions."
    }
  ];

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
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-600">
          Find answers to the most common questions about StudioPro.
        </p>
      </div>

      {/* FAQ Section */}
      <section className="container mx-auto py-16 px-4 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {faqData.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 py-20 px-4 text-center text-white">
        <h2 className="text-4xl font-extrabold mb-4">Still have questions?</h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto">
          Our support team is ready to help you find the answers you need.
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition duration-300">
          Contact Support
        </button>
      </section>

      <Footer />
      
    </div>
  );
};

export default FAQ;