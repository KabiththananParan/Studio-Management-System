import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginForm from './Components/Auth/Login'
import PasswordResetForm from './Components/Auth/ForgotPassword';
import SignUpForm from './Components/Auth/SignUP';
import Home from './Components/Home';
import About from './Components/About';
import Contact from './Components/Contact';
import Features from './Components/Features';
import FAQ from './Components/FAQ';
import Blog from './Components/Blog';
import EmailVerification from './Components/Auth/EmailVerification';
import UserDashboard from './Components/UserDashboard';
import AdminDashboard from './Components/Admin/AdminDashboard';
import AdminLogin from './Components/Admin/AdminLogin';

import { studioPackages } from '../src/Components/Booking/data/constants';
import { Header } from './Components/Booking/components/';
// Page imports
import {
  HomePage,
  BookingPage,
  CustomerDetailsPage,
  PaymentPage,
  SuccessPage,
  HistoryPage,
  RefundsPage
} from './Components/Booking/pages';

const AppContent = () => {
  const navigate = useNavigate();
  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 'TXN001',
      date: '2025-01-15',
      amount: 280,
      status: 'completed',
      paymentMethod: 'Credit Card',
      packageName: 'Premium Studio Package',
      invoiceId: 'INV-2025-001',
      canRefund: true
    },
    {
      id: 'TXN002',
      date: '2025-01-10',
      amount: 120,
      status: 'completed',
      paymentMethod: 'Digital Wallet',
      packageName: 'Basic Photography Package',
      invoiceId: 'INV-2025-002',
      canRefund: true
    }
  ]);

  const handlePackageSelect = (packageId) => {
    navigate(`/booking/${packageId}`);
  };

  const handleSlotSelect = (selectedPackage, slot) => {
    navigate('/customer-details', {
      state: {
        selectedPackage,
        selectedSlot: slot
      }
    });
  };

  const handlePaymentSuccess = (paymentData) => {
    const { selectedPackage, bookingDetails } = paymentData;
    
    // Create new transaction record
    const newTransaction = {
      id: `TXN${String(paymentHistory.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      amount: bookingDetails.totalAmount,
      status: 'completed',
      paymentMethod: getPaymentMethodName(paymentData.paymentData.paymentMethod || 'card'),
      packageName: selectedPackage.name,
      invoiceId: `INV-${new Date().getFullYear()}-${String(paymentHistory.length + 1).padStart(3, '0')}`,
      canRefund: true
    };
    
    // Add to payment history
    setPaymentHistory(prev => [newTransaction, ...prev]);
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'card': return 'Credit Card';
      case 'wallet': return 'Digital Wallet';
      case 'bank': return 'Bank Transfer';
      default: return 'Credit Card';
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/features" element={<Features />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/FAQ" element={<FAQ />} />
      <Route path="/login-form" element={<LoginForm />} />
      <Route path="/signUP-form" element={<SignUpForm />} />
      <Route path="/emailVerification" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<PasswordResetForm />} />
      <Route path="/userDashboard" element={<UserDashboard />} />
      <Route path="/adminDashboard" element={<AdminDashboard />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Routes for booking */}
      <Route 
        path="/booking" 
        element={<HomePage onPackageSelect={handlePackageSelect} />} 
      />
      <Route 
        path="/booking/:packageId" 
        element={
          <BookingPage 
            packages={studioPackages} 
            onSlotSelect={handleSlotSelect}
          />
        } 
      />
      <Route 
        path="/customer-details" 
        element={<CustomerDetailsPage />} 
      />
      <Route 
        path="/payment" 
        element={<PaymentPage onPaymentSuccess={handlePaymentSuccess} />} 
      />
      <Route 
        path="/success" 
        element={<SuccessPage />} 
      />
      <Route 
        path="/history" 
        element={<HistoryPage transactions={paymentHistory} />} 
      />
      <Route 
        path="/refunds" 
        element={<RefundsPage transactions={paymentHistory} />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
