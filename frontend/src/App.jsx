import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './Components/Login'
import PasswordResetForm from './Components/ForgotPassword';
import SignUpForm from './Components/SignUP';
import Home from './Components/Home';
import About from './Components/About';
import Contact from './Components/Contact';
import Features from './Components/Features';
import FAQ from './Components/FAQ';
import Blog from './Components/Blog';
import EmailVerification from './Components/EmailVerification';
import UserDashboard from './Components/UserDashboard';
import AdminDashboard from './Components/AdminDashboard';
import AdminLogin from './Components/Admin/AdminLogin';

function App() {
  const [count, setCount] = useState(0)

  return (
  <Router>
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
      </Routes>
    </Router>
  )
}

export default App
